import { NextRequest } from 'next/server';
import { ok } from '@/lib/api';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const db = getDb();
  const exists = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  return ok({ exists: !!exists });
}
