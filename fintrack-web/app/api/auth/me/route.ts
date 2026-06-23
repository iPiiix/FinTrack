import { ok, err, getUser } from '@/lib/api';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getUser();
  if (!user) return err('No autorizado', 401);

  return ok({
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    email_verificado: true,
    subscription_tier: 'free',
    subscription_status: 'active',
  });
}
