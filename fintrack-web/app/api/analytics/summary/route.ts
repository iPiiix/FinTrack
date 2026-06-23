import { ok, withAuth } from '@/lib/api';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export const GET = withAuth(async (_req, user) => {
  const db = getDb();
  const now = new Date();
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const patrimonio =
    (db
      .prepare('SELECT COALESCE(SUM(balance), 0) AS total FROM cuentas WHERE usuario_id = ?')
      .get(user.id) as any).total ?? 0;

  const ingresos =
    (db
      .prepare(
        `SELECT COALESCE(SUM(t.cantidad), 0) AS total
         FROM transacciones t JOIN cuentas c ON t.cuenta_id = c.id
         WHERE c.usuario_id = ? AND t.tipo = 'ingreso' AND t.fecha >= ?`
      )
      .get(user.id, startOfMonth) as any).total ?? 0;

  const gastos =
    (db
      .prepare(
        `SELECT COALESCE(SUM(t.cantidad), 0) AS total
         FROM transacciones t JOIN cuentas c ON t.cuenta_id = c.id
         WHERE c.usuario_id = ? AND t.tipo = 'gasto' AND t.fecha >= ?`
      )
      .get(user.id, startOfMonth) as any).total ?? 0;

  const flujoCaja = ingresos - gastos;
  const tasaAhorro = ingresos > 0 ? Math.round((flujoCaja / ingresos) * 10000) / 100 : 0;

  return ok({
    total_ingresos:   ingresos,
    total_gastos:     gastos,
    flujo_caja_neto:  flujoCaja,
    tasa_ahorro_pct:  tasaAhorro,
    patrimonio_neto:  patrimonio,
  });
});
