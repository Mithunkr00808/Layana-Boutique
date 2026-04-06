import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ status: 'logged out' }, { status: 200 });
  
  // Clear auth cookies with same security flags as creation
  response.cookies.set({
    name: 'session',
    value: '',
    maxAge: -1,
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  response.cookies.set({
    name: 'isAdmin',
    value: '',
    maxAge: -1,
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return response;
}
