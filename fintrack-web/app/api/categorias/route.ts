import { NextRequest } from 'next/server';
import { ok, err, withAuth } from '@/lib/api';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export const GET = withAuth(async (_req, user) => {
  const db = getDb();
  const categorias = db
    .prepare('SELECT * FROM categorias WHERE usuario_id IS NULL OR usuario_id = ? ORDER BY id ASC')
    .all(user.id);
  return ok(categorias);
});

export const POST = withAuth(async (req: NextRequest, user) => {
  const { nombre, descripcion } = await req.json();
  if (!nombre) return err('El nombre es obligatorio');

  const db = getDb();
  const result = db
    .prepare('INSERT INTO categorias (nombre, descripcion, usuario_id) VALUES (?, ?, ?)')
    .run(nombre, descripcion ?? null, user.id);

  const categoria = db.prepare('SELECT * FROM categorias WHERE id = ?').get(result.lastInsertRowid);
  return ok(categoria, 201);
});
