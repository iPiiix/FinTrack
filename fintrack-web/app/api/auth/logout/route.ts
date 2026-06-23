import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { hashToken } from '@/lib/jwt';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const refreshPlain = cookieStore.get('refresh_token')?.value;

  if (refreshPlain) {
    const db = getDb();
    db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?').run(hashToken(refreshPlain));
  }

  const response = NextResponse.json({ status: 'logged out' });
  const del = { httpOnly: true, secure: false, sameSite: 'lax' as const, path: '/', maxAge: 0 };
  response.cookies.set('access_token', '', del);
  response.cookies.set('refresh_token', '', del);
  return response;
}
