import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { idToken, profile } = await request.json();

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
