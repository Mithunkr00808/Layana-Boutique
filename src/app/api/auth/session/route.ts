import { NextRequest, NextResponse } from 'next/server';
import { z } from "zod";
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { csrfRejectedResponse, isSameOriginRequest } from "@/lib/security/csrf";
import {
  checkRateLimit,
  getRateLimitKey,
  purgeExpiredRateLimitBuckets,
  rateLimitResponse,
} from "@/lib/security/rate-limit";

const sessionRequestSchema = z
  .object({
    idToken: z.string().min(1, "Missing ID token"),
    profile: z
      .object({
        firstName: z.string().trim().max(100).optional(),
        lastName: z.string().trim().max(100).optional(),
        email: z.string().trim().max(320).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export async function POST(request: NextRequest) {
  purgeExpiredRateLimitBuckets();
  const rateLimitKey = getRateLimitKey(request, "api:auth:session");
  const rateLimitResult = checkRateLimit(rateLimitKey, {
    keyPrefix: "api:auth:session",
    windowMs: 60_000,
    maxRequests: 20,
  });
  if (!rateLimitResult.allowed) {
    return rateLimitResponse(rateLimitResult);
  }

  if (!isSameOriginRequest(request)) {
    return csrfRejectedResponse();
  }

  try {
    const body = await request.json();
    const parsed = sessionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { idToken, profile } = parsed.data;

    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID Token' }, { status: 400 });
    }

    // Verify token to check for admin claim
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const isAdmin = !!decodedToken.admin;

    // If profile data is provided (signup flow), create user document server-side
    if (profile && decodedToken.uid) {
      const userRef = adminDb.collection('users').doc(decodedToken.uid);
      const existingDoc = await userRef.get();

      if (!existingDoc.exists) {
        await userRef.set({
          firstName: String(profile.firstName || '').slice(0, 100),
          lastName: String(profile.lastName || '').slice(0, 100),
          fullName: `${String(profile.firstName || '')} ${String(profile.lastName || '')}`.trim().slice(0, 200),
          email: decodedToken.email || String(profile.email || ''),
          createdAt: new Date().toISOString(),
        });
      }
    } else if (decodedToken.uid) {
      // Auto-create user profile from auth token for OAuth sign-ins (Google, etc.)
      // The decodedToken already contains name/email/picture from the OAuth provider
      const userRef = adminDb.collection('users').doc(decodedToken.uid);
      const existingDoc = await userRef.get();

      if (!existingDoc.exists) {
        const nameParts = (decodedToken.name || '').trim().split(' ');
        await userRef.set({
          firstName: String(nameParts[0] || '').slice(0, 100),
          lastName: String(nameParts.slice(1).join(' ') || '').slice(0, 100),
          fullName: String(decodedToken.name || '').trim().slice(0, 200),
          email: decodedToken.email || '',
          photoURL: decodedToken.picture || '',
          authProvider: decodedToken.firebase?.sign_in_provider || 'unknown',
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // Create the session cookie.
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ status: 'success', isAdmin }, { status: 200 });
    
    response.cookies.set('session', sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    });

    response.cookies.set('isAdmin', isAdmin.toString(), {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax'
    });
    
    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 401 });
  }
}
