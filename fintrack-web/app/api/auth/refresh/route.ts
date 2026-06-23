import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { err } from '@/lib/api';
import { getDb } from '@/lib/db';
import { signToken, generateRefreshToken, hashToken } from '@/lib/jwt';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies();
  const refreshPlain = cookieStore.get('refresh_token')?.value;
  if (!refreshPlain) return err('No refresh token', 401);

  const db = getDb();
  const tokenRow = db
    .prepare(
      `SELECT * FROM refresh_tokens
       WHERE token_hash = ? AND revoked = 0 AND expires_at > datetime('now')`
    )
    .get(hashToken(refreshPlain)) as any;

  if (!tokenRow) return err('Token inválido', 401);

  // Rotate: revoke old, create new
  db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?').run(tokenRow.id);

  const newAccess = await signToken({ sub: String(tokenRow.usuario_id) });
  const newRefreshPlain = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(
    'INSERT INTO refresh_tokens (usuario_id, token_hash, expires_at) VALUES (?, ?, ?)'
  ).run(tokenRow.usuario_id, hashToken(newRefreshPlain), expiresAt);

  const response = NextResponse.json({ status: 'refreshed' });
  const cookieOpts = { httpOnly: true, secure: false, sameSite: 'lax' as const, path: '/' };
  response.cookies.set('access_token', newAccess, { ...cookieOpts, maxAge: 15 * 60 });
  response.cookies.set('refresh_token', newRefreshPlain, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 });
  return response;
}
