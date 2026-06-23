import { NextRequest } from 'next/server';
import { ok, err, withAuth } from '@/lib/api';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export const GET = withAuth(async (_req, user) => {
  const db = getDb();
  return ok(db.prepare('SELECT * FROM activos WHERE usuario_id = ? ORDER BY fecha_compra DESC').all(user.id));
});

export const POST = withAuth(async (req: NextRequest, user) => {
  const { ticker, cantidad, precio_compra } = await req.json();
  if (!ticker || !cantidad || !precio_compra) return err('Faltan campos obligatorios');

  const db = getDb();
  const result = db
    .prepare('INSERT INTO activos (ticker, cantidad, precio_compra, usuario_id) VALUES (?, ?, ?, ?)')
    .run(ticker.toUpperCase(), cantidad, precio_compra, user.id);

  const activo = db.prepare('SELECT * FROM activos WHERE id = ?').get(result.lastInsertRowid);
  return ok(activo, 201);
});
