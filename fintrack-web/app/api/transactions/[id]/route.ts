import { NextRequest } from 'next/server';
import { ok, err, withAuth } from '@/lib/api';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

function getTxForUser(id: number, userId: number) {
  return getDb()
    .prepare(
      `SELECT t.* FROM transacciones t
       JOIN cuentas c ON t.cuenta_id = c.id
       WHERE t.id = ? AND c.usuario_id = ?`
    )
    .get(id, userId) as any;
}

export const DELETE = withAuth(async (req: NextRequest, user) => {
  const id = Number(req.nextUrl.pathname.split('/').pop());
  const db = getDb();
  const tx = getTxForUser(id, user.id);
  if (!tx) return err('Transacción no encontrada', 404);

  const reversion = tx.tipo === 'ingreso' ? -Math.abs(tx.cantidad) : Math.abs(tx.cantidad);

  db.transaction(() => {
    db.prepare('UPDATE cuentas SET balance = balance + ? WHERE id = ?').run(reversion, tx.cuenta_id);
    db.prepare('DELETE FROM transacciones WHERE id = ?').run(id);
  })();

  return new Response(null, { status: 204 });
});

export const PATCH = withAuth(async (req: NextRequest, user) => {
  const id = Number(req.nextUrl.pathname.split('/').pop());
  const db = getDb();
  const tx = getTxForUser(id, user.id);
  if (!tx) return err('Transacción no encontrada', 404);

  const { estado, descripcion, nombre } = await req.json();
  if (estado !== undefined)     db.prepare('UPDATE transacciones SET estado = ? WHERE id = ?').run(estado, id);
  if (descripcion !== undefined) db.prepare('UPDATE transacciones SET descripcion = ? WHERE id = ?').run(descripcion, id);
  if (nombre !== undefined)     db.prepare('UPDATE transacciones SET nombre = ? WHERE id = ?').run(nombre, id);

  const updated = db.prepare('SELECT * FROM transacciones WHERE id = ?').get(id) as any;
  return ok({
    id_transaccion: updated.id,
    cantidad:       updated.cantidad,
    tipo:           updated.tipo,
    nombre:         updated.nombre,
    descripcion:    updated.descripcion,
    estado:         updated.estado,
    fecha:          updated.fecha,
    id_cuenta:      updated.cuenta_id,
    id_categoria:   updated.categoria_id,
    creado_en:      updated.creado_en,
  });
});
