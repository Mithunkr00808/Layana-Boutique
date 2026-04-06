import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/siteSettings';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // re-fetch at most once per minute

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(settings.social, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch {
    return NextResponse.json({ instagram: '', facebook: '', email: '' });
  }
}
