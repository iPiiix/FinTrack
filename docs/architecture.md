# Arquitectura

## Visión general

FinTrack es una aplicación Electron que embebe un servidor Next.js como proceso hijo. El servidor Next.js actúa como backend HTTP local (puerto 3000) y sirve la UI React al BrowserWindow de Electron.

```
┌─────────────────────────────────────────────────────┐
│  Electron (main process)                            │
│                                                     │
│  ┌──────────────────┐    ┌───────────────────────┐  │
│  │  BrowserWindow   │    │  Next.js standalone   │  │
│  │  (renderer)      │◄──►│  server (child proc.) │  │
│  │                  │    │  localhost:3000        │  │
│  │  React UI        │    │                       │  │
│  └──────────────────┘    │  API Routes (SQLite)  │  │
│                          └───────────┬───────────┘  │
│                                      │              │
│                          ┌───────────▼───────────┐  │
│                          │  fintrack.db           │  │
│                          │  (userData / SQLite)   │  │
│                          └───────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Shell de escritorio | Electron | 42 |
| Framework web | Next.js (App Router) | 16 |
| UI | React | 19 |
| Lenguaje | TypeScript | 5 |
| Base de datos | SQLite vía better-sqlite3 | 12 |
| Estilos | Tailwind CSS | 4 |
| Animaciones | Framer Motion | 12 |
| Gráficos | Chart.js, Recharts | 4 / 3 |
| Fondo landing | Canvas 2D nativo | — |
| Empaquetado desktop | electron-builder | 26 |

---

## Estructura del repositorio

```
FinTrack/
├── docs/                          ← Documentación
│   ├── index.md
│   ├── getting-started.md
│   ├── features.md
│   ├── architecture.md
│   ├── development.md
│   └── faq.md
│
├── fintrack-web/                  ← Aplicación principal
│   ├── app/                       ← Next.js App Router
│   │   ├── page.tsx               ← Landing page (marketing)
│   │   ├── layout.tsx             ← Root layout + AuthProvider
│   │   ├── globals.css
│   │   ├── dashboard/             ← Dashboard financiero
│   │   │   ├── page.tsx
│   │   │   └── components/
│   │   │       ├── OverviewView.tsx
│   │   │       ├── TransactionsView.tsx
│   │   │       ├── PortfolioView.tsx
│   │   │       ├── AIInsightsView.tsx
│   │   │       ├── MonteCarloChart.tsx
│   │   │       ├── SettingsView.tsx
│   │   │       ├── TopBar.tsx
│   │   │       ├── Drawer.tsx
│   │   │       ├── CreateAccountDrawer.tsx
│   │   │       ├── CreateAssetDrawer.tsx
│   │   │       └── TutorialModal.tsx
│   │   └── api/                   ← API Routes (Node.js runtime)
│   │       ├── analytics/summary/ ← KPIs del mes actual
│   │       ├── auth/
│   │       │   ├── auto-local/    ← Login automático Electron
│   │       │   ├── login/
│   │       │   ├── logout/
│   │       │   ├── me/
│   │       │   ├── refresh/
│   │       │   └── register/
│   │       ├── cuentas/
│   │       ├── categorias/
│   │       ├── transactions/
│   │       ├── portfolio/
│   │       ├── quote/             ← Cotizaciones Yahoo Finance
│   │       └── usuarios/me/
│   │
│   ├── electron/
│   │   └── main.js                ← Main process: arranca Next.js + crea ventana
│   │
│   ├── components/
│   │   ├── ThreeBackground.tsx    ← Glow CSS + Canvas 2D de la landing
│   │   └── ErrorBoundary.tsx
│   │
│   ├── context/
│   │   └── AuthContext.tsx        ← Estado de sesión local
│   │
│   ├── lib/
│   │   ├── db.ts                  ← Singleton SQLite + initSchema
│   │   ├── jwt.ts                 ← signToken, generateRefreshToken
│   │   ├── auth.ts                ← withAuth helper
│   │   ├── api.ts                 ← ok() / withAuth() response helpers
│   │   ├── utils.ts               ← fmt(), groupByMonth(), groupByCategory()
│   │   └── constants.ts           ← DONUT_COLORS, etc.
│   │
│   ├── middleware.ts              ← Protege /dashboard, /portfolio
│   ├── next.config.ts
│   ├── vercel.json
│   └── package.json
│
└── backend/                       ← FastAPI legacy (no requerido en desktop)
    └── app/
        └── routers/
```

---

## Base de datos

FinTrack usa **SQLite** vía `better-sqlite3`. El esquema se inicializa automáticamente en el primer arranque a través de `lib/db.ts → initSchema()`.

### Tablas

**`usuarios`**
```sql
id, nombre, apellidos, email, fecha_nacimiento, contrasena, creado_en
```
En modo escritorio solo existe el usuario `local@fintrack.app`.

**`refresh_tokens`**
```sql
id, usuario_id, token_hash, revoked, expires_at, creado_en
```
Tokens de refresco JWT. Al arrancar Electron se elimina la sesión anterior y se crea una nueva.

**`cuentas`**
```sql
id, nombre, tipo, balance, divisa, activa, usuario_id, creado_en
```

**`categorias`**
```sql
id, nombre, descripcion, usuario_id, creado_en
```
5 categorías globales (sin `usuario_id`) + personalizadas por usuario.

**`transacciones`**
```sql
id, cantidad, tipo, nombre, descripcion, estado, fecha, cuenta_id, categoria_id, creado_en
```
`tipo` puede ser `ingreso`, `gasto` o `transferencia`.

**`activos`**
```sql
id, ticker, cantidad, precio_compra, fecha_compra, usuario_id
```
Activos del portfolio. Los precios actuales se obtienen en tiempo real.

---

## Flujo de autenticación local

```
Electron arranca
      │
      ▼
main.js: startNextServer()
  Lanza server.js (Next.js standalone) como proceso hijo
  Espera HTTP en localhost:3000 (hasta 30 reintentos × 500 ms)
      │
      ▼
main.js: createWindow()
  BrowserWindow.loadURL("http://localhost:3000/api/auth/auto-local")
      │
      ▼
GET /api/auth/auto-local
  - Busca usuario "local@fintrack.app" en SQLite
  - Si no existe → INSERT (primer arranque)
  - Genera access_token (JWT, 15 min) y refresh_token (30 días)
  - Borra sesión anterior, inserta nueva en refresh_tokens
  - Set-Cookie: access_token + refresh_token (httpOnly)
  - Redirect → /dashboard
      │
      ▼
middleware.ts valida la cookie access_token
  → Permite acceso a /dashboard
      │
      ▼
Dashboard carga con el usuario local
```

El token se renueva automáticamente mediante `GET /api/auth/refresh` cuando expira el access_token (15 min), sin interrumpir la sesión.

---

## Flujo de cotizaciones

```
PortfolioView monta
      │
      ▼
fetchQuotes() → GET /api/quote?symbols=AAPL,BTC-USD,EUR=X
      │
      ▼
/api/quote/route.ts
  Llama a Yahoo Finance (yfinance compatible)
  Devuelve { quotes: [{ symbol, price, currency, changePercent }] }
      │
      ▼
PortfolioView calcula:
  - Precio actual (USD → EUR vía EUR=X)
  - Valor de mercado por activo
  - P&L total
      │
      ▼
setInterval(fetchQuotes, 30_000) — refresh automático cada 30 s
```

---

## Despliegue en Vercel (landing)

Cuando `process.env.VERCEL` está definido:
- `next.config.ts` desactiva `output: 'standalone'` (solo necesario para Electron)
- `serverExternalPackages: ['better-sqlite3']` evita que webpack intente empaquetar el módulo nativo
- La ruta `/` (landing page) se sirve estáticamente
- Las rutas de API que usan SQLite no son accesibles desde el exterior (el middleware redirige `/dashboard` a `/auth/login`)

---

## Empaquetado de Electron

`electron-builder` genera los instaladores a partir del build de Next.js standalone:

```
npm run build:mac   →  dist/FinTrack-1.0.0-arm64.dmg
                        dist/FinTrack-1.0.0.dmg
npm run build:win   →  dist/FinTrack-Setup-1.0.0.exe
```

El script `scripts/prepare-electron.js` copia el output standalone de Next.js a `resources/standalone/` dentro del bundle de Electron. El main process lo lanza como proceso hijo con `ELECTRON_RUN_AS_NODE=1`.

`better-sqlite3` se declara en `asarUnpack` para que el binario nativo quede fuera del ASAR y pueda ser cargado correctamente por Node.js.
