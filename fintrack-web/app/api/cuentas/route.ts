import { NextRequest } from 'next/server';
import { ok, err, withAuth } from '@/lib/api';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export const GET = withAuth(async (_req, user) => {
  const db = getDb();
  const cuentas = db
    .prepare('SELECT * FROM cuentas WHERE usuario_id = ? AND activa = 1 ORDER BY creado_en ASC')
    .all(user.id);
  return ok(cuentas);
});

export const POST = withAuth(async (req: NextRequest, user) => {
  const { nombre, tipo, balance = 0, divisa = 'EUR' } = await req.json();
  if (!nombre || !tipo) return err('Faltan campos obligatorios');

  const TIPOS_VALIDOS = ['debito', 'credito', 'ahorros', 'inversion'];
  if (!TIPOS_VALIDOS.includes(tipo)) return err('Tipo de cuenta inválido');

  const db = getDb();
  const result = db
    .prepare(
      'INSERT INTO cuentas (nombre, tipo, balance, divisa, usuario_id) VALUES (?, ?, ?, ?, ?)'
    )
    .run(nombre, tipo, balance, divisa, user.id);

  const cuenta = db.prepare('SELECT * FROM cuentas WHERE id = ?').get(result.lastInsertRowid);
  return ok(cuenta, 201);
});
