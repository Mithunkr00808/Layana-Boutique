import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID Token' }, { status: 400 });
    }

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // Create the session cookie. This will also verify the ID token in the process.
    // The session cookie will have the same claims as the ID token.
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Set cookie policy for session cookie.
    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax' as const
    };

    const response = NextResponse.json({ status: 'success' }, { status: 200 });
    response.cookies.set(options);
    
    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 401 });
  }
}
