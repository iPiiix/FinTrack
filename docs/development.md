# Desarrollo y contribución

## Requisitos

- **Node.js 18+** (recomendado: Node 20 LTS o superior)
- **npm** (incluido con Node)
- macOS para compilar el build de macOS; Windows para el build de Windows

---

## Clonar y ejecutar en modo desarrollo

```bash
git clone https://github.com/iPiiix/FinTrack.git
cd FinTrack/fintrack-web

npm install
```

### Solo el servidor web (Next.js)

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La landing page se muestra en `/`. El dashboard está en `/dashboard` — como no hay cookie de sesión, el middleware redirige a `/auth/login`. Para saltarte eso en desarrollo, visita directamente `http://localhost:3000/api/auth/auto-local`.

### Next.js + Electron juntos

```bash
npm run dev:electron
```

Este comando:
1. Arranca `next dev` en el puerto 3000
2. Espera a que el servidor esté listo (`wait-on`)
3. Lanza Electron que carga `/api/auth/auto-local` → redirige al dashboard

---

## Compilar instaladores

### macOS

Necesitas estar en macOS. Genera dos DMG (arm64 + x64):

```bash
npm run build:mac
```

Los archivos aparecen en `dist/`:
- `FinTrack-1.0.0-arm64.dmg` — Apple Silicon
- `FinTrack-1.0.0.dmg` — Intel

### Windows

Desde Windows (o una VM/CI con Windows):

```bash
npm run build:win
```

Genera:
- `dist/FinTrack-Setup-1.0.0.exe` — instalador NSIS x64

### Proceso de compilación

`build:mac` y `build:win` ejecutan:
1. `next build` — genera el output standalone en `.next/standalone`
2. `node scripts/prepare-electron.js` — copia el standalone a `resources/standalone/`
3. `electron-builder` — empaqueta la app con los recursos

---

## Estructura de scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Next.js en modo desarrollo (hot reload) |
| `npm run dev:electron` | Next.js + Electron juntos |
| `npm run build` | Build de Next.js (standalone) |
| `npm run build:mac` | Build completo → DMG |
| `npm run build:win` | Build completo → EXE |
| `npm run lint` | ESLint sobre el código TypeScript |

---

## Variables de entorno

En desarrollo, puedes crear `fintrack-web/.env.local` con:

```env
# Opcional: ruta personalizada para la base de datos en desarrollo
DATABASE_PATH=/ruta/a/tu/fintrack.db

# Opcional: secreto JWT personalizado (por defecto usa un valor fijo en dev)
JWT_SECRET=tu-secreto-aqui
```

En producción (Electron), el main process pasa `DATABASE_PATH` y `JWT_SECRET` directamente al proceso hijo de Next.js como variables de entorno.

---

## Añadir una categoría personalizada

Las categorías se crean vía `POST /api/categorias`:

```bash
curl -X POST http://localhost:3000/api/categorias \
  -H "Content-Type: application/json" \
  -b "access_token=<tu-token>" \
  -d '{"nombre": "Suscripciones", "descripcion": "Netflix, Spotify, etc."}'
```

O directamente desde el drawer de nueva transacción en la UI.

---

## Añadir una API Route

Las rutas van en `fintrack-web/app/api/<recurso>/route.ts`. Usa el helper `withAuth` de `lib/api.ts` para proteger la ruta y obtener el usuario local:

```typescript
import { ok, withAuth } from '@/lib/api';
import { getDb } from '@/lib/db';

export const runtime = 'nodejs'; // obligatorio para better-sqlite3

export const GET = withAuth(async (_req, user) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM cuentas WHERE usuario_id = ?').all(user.id);
  return ok(rows);
});
```

`getDb()` devuelve un singleton; la conexión se reutiliza en la misma instancia del servidor.

---

## Contribuir

Las PRs son bienvenidas. Algunas áreas donde hay trabajo pendiente:

- [ ] **Linux** — build de AppImage / deb / rpm
- [ ] **Sincronización opcional** — exportar/importar backup cifrado
- [ ] **Más tipos de activo** — inmuebles, fondos de pensiones, deuda
- [ ] **Alertas** — notificaciones cuando el gasto en una categoría supera un umbral
- [ ] **Temas** — modo claro y temas de color alternativos
- [ ] **Internacionalización** — soporte para más idiomas

### Flujo de trabajo

```bash
# 1. Fork del repo y clona tu fork
git clone https://github.com/tu-usuario/FinTrack.git

# 2. Crea una rama
git checkout -b feat/nombre-de-tu-feature

# 3. Haz tus cambios y verifica que el linter pasa
npm run lint

# 4. Commit y push
git push origin feat/nombre-de-tu-feature

# 5. Abre un Pull Request en GitHub
```

### Estilo de código

- TypeScript estricto (`"strict": true` en tsconfig)
- Sin comentarios innecesarios — el código se explica solo
- Componentes React funcionales con hooks
- Nombres en inglés para código, en español para strings visibles al usuario
