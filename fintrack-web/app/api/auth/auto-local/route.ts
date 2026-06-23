import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { signToken, generateRefreshToken, hashToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

const LOCAL_EMAIL = 'local@fintrack.app';

// Called on Electron startup. Creates the local user on first launch,
// sets auth cookies, and redirects to /dashboard — no login screen needed.
export async function GET(req: NextRequest) {
  const db = getDb();

  let user = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(LOCAL_EMAIL) as any;

  if (!user) {
    const hash = await bcrypt.hash(crypto.randomUUID(), 12);
    const result = db
      .prepare('INSERT INTO usuarios (nombre, apellidos, email, contrasena) VALUES (?, ?, ?, ?)')
      .run('Usuario', 'Local', LOCAL_EMAIL, hash);
    user = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(result.lastInsertRowid) as any;
  }

  const accessToken  = await signToken({ sub: String(user.id) });
  const refreshPlain = generateRefreshToken();
  const expiresAt    = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // One active session per local user
  db.prepare('DELETE FROM refresh_tokens WHERE usuario_id = ?').run(user.id);
  db.prepare(
    'INSERT INTO refresh_tokens (usuario_id, token_hash, expires_at) VALUES (?, ?, ?)'
  ).run(user.id, hashToken(refreshPlain), expiresAt);

  const base = new URL(req.url).origin;
  const res  = NextResponse.redirect(new URL('/dashboard', base));

  const cookieOpts = { httpOnly: true, secure: false, sameSite: 'lax' as const, path: '/' };
  res.cookies.set('access_token',  accessToken,  { ...cookieOpts, maxAge: 15 * 60 });
  res.cookies.set('refresh_token', refreshPlain, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 });

  return res;
}
