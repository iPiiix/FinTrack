import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fintrack-local-dev-secret-change-me'
);

export async function signToken(payload: { sub: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, SECRET);
  return payload as { sub: string };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
