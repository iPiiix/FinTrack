import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from './jwt';
import { getDb } from './db';

export function ok(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ detail: message }, { status });
}

export type DbUser = {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  fecha_nacimiento: string | null;
  contrasena: string;
  creado_en: string;
  api_key?: string | null;
  ai_provider?: string | null;
};

export async function getUser(_req?: NextRequest): Promise<DbUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) return null;
    const { sub } = await verifyToken(token);
    const db = getDb();
    return (db.prepare('SELECT * FROM usuarios WHERE id = ?').get(Number(sub)) as DbUser) ?? null;
  } catch {
    return null;
  }
}

export async function requireUser(req?: NextRequest): Promise<DbUser> {
  const user = await getUser(req);
  if (!user) throw new ApiError('No autorizado', 401);
  return user;
}

export class ApiError extends Error {
  constructor(public message: string, public status: number) {
    super(message);
  }
}

export function withAuth(
  handler: (req: NextRequest, user: DbUser) => Promise<NextResponse | Response>
) {
  return async (req: NextRequest) => {
    try {
      const user = await requireUser(req);
      return await handler(req, user);
    } catch (e) {
      if (e instanceof ApiError) return err(e.message, e.status);
      console.error(e);
      return err('Error interno del servidor', 500);
    }
  };
}
