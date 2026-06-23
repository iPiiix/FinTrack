import { NextRequest } from 'next/server';
import { ok, err, withAuth } from '@/lib/api';
import { getDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

// PUT /api/usuarios/me/password  (wrapped inside this file via sub-path isn't possible — see separate files)
// This route handles name + password updates via query param ?action=
export const PUT = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const db = getDb();

  // Update name
  if (body.nombre !== undefined) {
    db.prepare('UPDATE usuarios SET nombre = ?, apellidos = ? WHERE id = ?')
      .run(body.nombre, body.apellidos ?? user.apellidos, user.id);
    return ok({ message: 'Nombre actualizado' });
  }

  // Update password
  if (body.current_password && body.new_password) {
    const valid = await bcrypt.compare(body.current_password, user.contrasena);
    if (!valid) return err('La contraseña actual es incorrecta');
    const hash = await bcrypt.hash(body.new_password, 12);
    db.prepare('UPDATE usuarios SET contrasena = ? WHERE id = ?').run(hash, user.id);
    return ok({ message: 'Contraseña actualizada' });
  }

  return err('Petición no válida');
});

// DELETE /api/usuarios/me  — wipe account
export const DELETE = withAuth(async (_req, user) => {
  const db = getDb();
  db.transaction(() => {
    db.prepare('DELETE FROM activos WHERE usuario_id = ?').run(user.id);
    db.prepare(`DELETE FROM transacciones WHERE cuenta_id IN
                (SELECT id FROM cuentas WHERE usuario_id = ?)`).run(user.id);
    db.prepare('DELETE FROM cuentas WHERE usuario_id = ?').run(user.id);
    db.prepare('DELETE FROM refresh_tokens WHERE usuario_id = ?').run(user.id);
    db.prepare('DELETE FROM usuarios WHERE id = ?').run(user.id);
  })();
  return ok({ message: 'Cuenta eliminada' });
});
