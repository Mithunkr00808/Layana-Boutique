import { NextRequest, NextResponse } from 'next/server';
import { csrfRejectedResponse, isSameOriginRequest } from "@/lib/security/csrf";

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return csrfRejectedResponse();
  }

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
