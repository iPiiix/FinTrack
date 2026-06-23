import { NextRequest } from 'next/server';
import { ok, err, withAuth } from '@/lib/api';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export const GET = withAuth(async (_req, user) => {
  const db = getDb();
  const txs = db
    .prepare(
      `SELECT t.*, c.nombre AS cuenta_nombre, cat.nombre AS categoria_nombre
       FROM transacciones t
       JOIN cuentas c ON t.cuenta_id = c.id
       LEFT JOIN categorias cat ON t.categoria_id = cat.id
       WHERE c.usuario_id = ?
       ORDER BY t.fecha DESC`
    )
    .all(user.id);

  // Normalise field names to match what the frontend expects from the old API
  const mapped = txs.map((t: any) => ({
    id_transaccion: t.id,
    cantidad:       t.cantidad,
    tipo:           t.tipo,
    nombre:         t.nombre,
    descripcion:    t.descripcion,
    estado:         t.estado,
    fecha:          t.fecha,
    id_cuenta:      t.cuenta_id,
    id_categoria:   t.categoria_id,
    creado_en:      t.creado_en,
  }));

  return ok(mapped);
});

export const POST = withAuth(async (req: NextRequest, user) => {
  const { cantidad, tipo, nombre, descripcion, estado = 'completada', id_cuenta, id_categoria } =
    await req.json();

  if (!cantidad || !tipo || !nombre || !id_cuenta) return err('Faltan campos obligatorios');
  const TIPOS = ['ingreso', 'gasto', 'transferencia'];
  if (!TIPOS.includes(tipo)) return err('Tipo de transacción inválido');

  const db = getDb();

  // Verify account ownership
  const cuenta = db
    .prepare('SELECT * FROM cuentas WHERE id = ? AND usuario_id = ?')
    .get(id_cuenta, user.id) as any;
  if (!cuenta) return err('Cuenta no encontrada', 404);

  const impacto = tipo === 'gasto' ? -Math.abs(cantidad) : Math.abs(cantidad);

  const insert = db.transaction(() => {
    db.prepare('UPDATE cuentas SET balance = balance + ? WHERE id = ?').run(impacto, id_cuenta);
    return db
      .prepare(
        `INSERT INTO transacciones (cantidad, tipo, nombre, descripcion, estado, cuenta_id, categoria_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(Math.abs(cantidad), tipo, nombre, descripcion ?? null, estado, id_cuenta, id_categoria ?? null);
  });

  const result = insert();
  const tx = db.prepare('SELECT * FROM transacciones WHERE id = ?').get(result.lastInsertRowid) as any;

  return ok({
    id_transaccion: tx.id,
    cantidad:       tx.cantidad,
    tipo:           tx.tipo,
    nombre:         tx.nombre,
    descripcion:    tx.descripcion,
    estado:         tx.estado,
    fecha:          tx.fecha,
    id_cuenta:      tx.cuenta_id,
    id_categoria:   tx.categoria_id,
    creado_en:      tx.creado_en,
  }, 201);
});
