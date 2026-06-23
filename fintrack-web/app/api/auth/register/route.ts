import { NextRequest } from 'next/server';
import { ok, err } from '@/lib/api';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { nombre, apellidos, email, fecha_nacimiento, contrasena } = await req.json();

  if (!nombre || !email || !contrasena) {
    return err('Faltan campos obligatorios');
  }

  const db = getDb();
  const exists = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
  if (exists) return err('El email ya está registrado');

  const hash = await bcrypt.hash(contrasena, 12);
  const result = db
    .prepare('INSERT INTO usuarios (nombre, apellidos, email, fecha_nacimiento, contrasena) VALUES (?, ?, ?, ?, ?)')
    .run(nombre, apellidos ?? '', email, fecha_nacimiento ?? null, hash);

  const user = db
    .prepare('SELECT id, nombre, apellidos, email FROM usuarios WHERE id = ?')
    .get(result.lastInsertRowid);

  return ok(user, 201);
}
