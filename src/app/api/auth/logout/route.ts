import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ status: 'logged out' }, { status: 200 });
  
  // Clear the session cookie
  response.cookies.set({
    name: 'session',
    value: '',
    maxAge: -1,
    path: '/',
  });

  return response;
}
