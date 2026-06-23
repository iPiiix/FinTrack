import { NextRequest, NextResponse } from 'next/server';
import { err } from '@/lib/api';
import { getDb } from '@/lib/db';
import { signToken, generateRefreshToken, hashToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? '';
  let email: string, password: string;

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const form = await req.formData();
    email = form.get('username') as string;
    password = form.get('password') as string;
  } else {
    const body = await req.json();
    email = body.email ?? body.username;
    password = body.password ?? body.contrasena;
  }

  if (!email || !password) return err('Faltan credenciales');

  const db = getDb();
  const user = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email) as any;
  if (!user) return err('Credenciales incorrectas', 401);

  const valid = await bcrypt.compare(password, user.contrasena);
  if (!valid) return err('Credenciales incorrectas', 401);

  const accessToken = await signToken({ sub: String(user.id) });
  const refreshPlain = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(
    'INSERT INTO refresh_tokens (usuario_id, token_hash, expires_at) VALUES (?, ?, ?)'
  ).run(user.id, hashToken(refreshPlain), expiresAt);

  const response = NextResponse.json({
    usuario: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      email_verificado: true,
      subscription_tier: 'free',
      subscription_status: 'active',
    },
  });

  const cookieOpts = { httpOnly: true, secure: false, sameSite: 'lax' as const, path: '/' };
  response.cookies.set('access_token', accessToken, { ...cookieOpts, maxAge: 15 * 60 });
  response.cookies.set('refresh_token', refreshPlain, { ...cookieOpts, maxAge: 30 * 24 * 60 * 60 });

  return response;
}
