import { withAuth } from '@/lib/api';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export const GET = withAuth(async (_req, user) => {
  const db = getDb();
  const txs = db
    .prepare(
      `SELECT t.*, c.nombre AS cuenta_nombre
       FROM transacciones t
       JOIN cuentas c ON t.cuenta_id = c.id
       WHERE c.usuario_id = ?
       ORDER BY t.fecha DESC`
    )
    .all(user.id) as any[];

  const rows = [['Fecha', 'Nombre', 'Tipo', 'Cantidad', 'Estado', 'Descripcion', 'Cuenta']];
  for (const t of txs) {
    rows.push([t.fecha ?? '', t.nombre, t.tipo, t.cantidad, t.estado, t.descripcion ?? '', t.cuenta_nombre]);
  }

  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=transacciones_fintrack.csv',
    },
  });
});
