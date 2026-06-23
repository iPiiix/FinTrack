import { NextRequest } from 'next/server';
import { err, withAuth } from '@/lib/api';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs';

export const DELETE = withAuth(async (req: NextRequest, user) => {
  const id = Number(req.nextUrl.pathname.split('/').pop());
  const db = getDb();
  const activo = db.prepare('SELECT * FROM activos WHERE id = ? AND usuario_id = ?').get(id, user.id);
  if (!activo) return err('Activo no encontrado', 404);
  db.prepare('DELETE FROM activos WHERE id = ?').run(id);
  return new Response(null, { status: 204 });
});
