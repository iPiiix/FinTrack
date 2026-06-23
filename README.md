# 💸 FinTrack — Control Financiero Personal

<p align="center">
  <img src="fintrack-web/public/png.png" alt="FinTrack" width="80" />
</p>

<p align="center">
  <strong>OWN YOUR FUTURE. KNOW YOUR NUMBERS.</strong>
</p>

<p align="center">
  <a href="https://github.com/iPiiix/FinTrack/releases/latest"><img alt="GitHub release" src="https://img.shields.io/github/v/release/iPiiix/FinTrack?style=flat-square&color=E8FF47&labelColor=09090B" /></a>
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/license-MIT-white?style=flat-square&labelColor=09090B" /></a>
  <img alt="Platform" src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows-zinc?style=flat-square&labelColor=09090B" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-white?style=flat-square&labelColor=09090B" />
</p>

FinTrack es una app de escritorio para gestión de finanzas personales. Registra ingresos y gastos, analiza tu flujo de caja, visualiza tu patrimonio y obtén proyecciones con IA. Todo **100 % local**: los datos viven en tu dispositivo en SQLite. Sin suscripciones, sin registro, sin telemetría.

Si quieres controlar tu dinero de forma privada, rápida y sin depender de servicios externos, esto es lo que buscas.

---

## Descarga

| Plataforma | Enlace |
|---|---|
| **macOS — Apple Silicon** | [FinTrack-1.0.0-arm64.dmg](https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-1.0.0-arm64.dmg) |
| **macOS — Intel** | [FinTrack-1.0.0.dmg](https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-1.0.0.dmg) |
| **Windows** | [FinTrack-Setup-1.0.0.exe](https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-Setup-1.0.0.exe) |

> **Linux** — próximamente.

---

## Primeros pasos

**macOS:** abre el `.dmg`, arrastra FinTrack a Aplicaciones y ejecútalo. La primera vez macOS puede pedir confirmación en Ajustes → Privacidad y Seguridad.

**Windows:** ejecuta el instalador `.exe`. Puedes elegir el directorio de instalación y se crea un acceso directo en el escritorio.

Al arrancar no se pide ningún inicio de sesión. La app crea automáticamente un perfil local y abre el dashboard directamente.

---

## Funcionalidades

### Libro mayor
Registra cada ingreso, gasto o transferencia con nombre, importe, categoría y cuenta. Historial completo con búsqueda y filtros por tipo.

### Flujo de caja
Gráfico mensual de capital entrante vs. gasto saliente con curva acumulada. Tasa de ahorro calculada al instante con indicador de salud (Excelente / Puede mejorar / Crítico).

### Gastos por categoría
Donut chart interactivo con desglose automático por categoría. Categorías predefinidas: Nómina, Vivienda, Alimentación, Transporte, Ocio — y puedes crear las tuyas.

### Portfolio
Registra acciones, crypto, inmuebles y liquidez en un único panel. Patrimonio neto calculado incluyendo todos los activos y cuentas.

### AI Advisor
Conecta el LLM que prefieras (configurable) para obtener análisis narrativos y resúmenes de tu situación financiera. El modelo solo recibe lo que tú compartes. Incluye simulación Monte Carlo para proyecciones de largo plazo.

### Múltiples cuentas
Crea cuentas de distintos tipos (corriente, ahorro, inversión, efectivo) en cualquier divisa. El balance se actualiza en tiempo real.

### Exportación
Exporta tus transacciones a CSV desde el dashboard con un clic.

### 100 % local
SQLite almacenado en el directorio de datos del usuario. Sin servidores, sin cloud, sin telemetría. Tus datos no salen de tu equipo.

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Shell de escritorio | Electron 42 |
| Framework web | Next.js 16 / React 19 / TypeScript |
| Base de datos | SQLite vía `better-sqlite3` |
| Estilos | Tailwind CSS v4 |
| Animaciones | Framer Motion |
| Gráficos | Chart.js + Recharts |
| Fondo 3D (landing) | Three.js / React Three Fiber |
| Autenticación local | JWT + auto-login sin pantalla de login |

---

## Desde el código fuente

Requisitos: **Node.js 18+**

```bash
git clone https://github.com/iPiiix/FinTrack.git
cd FinTrack/fintrack-web

npm install

# Modo desarrollo (Next.js + Electron juntos)
npm run dev:electron

# Solo el servidor web
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la landing, o la app Electron se abre sola con `dev:electron`.

### Compilar los instaladores

```bash
# macOS (genera .dmg en dist/)
npm run build:mac

# Windows (genera .exe en dist/)
npm run build:win
```

> Los binarios compilados van a `fintrack-web/dist/` y no se suben al repositorio. Las releases oficiales se publican en [GitHub Releases](https://github.com/iPiiix/FinTrack/releases).

---

## Estructura del repositorio

```
FinTrack/
├── fintrack-web/          # App principal (Next.js + Electron)
│   ├── app/               # Next.js App Router
│   │   ├── page.tsx       # Landing page (marketing)
│   │   ├── dashboard/     # Dashboard financiero
│   │   └── api/           # API Routes (SQLite local)
│   ├── electron/          # Main process de Electron
│   ├── components/        # Componentes compartidos
│   ├── lib/               # DB, JWT, utilidades
│   └── context/           # AuthContext (perfil local)
└── backend/               # FastAPI legacy (no requerido en desktop)
```

---

## Cómo funciona el auto-login

Cuando Electron arranca, carga `/api/auth/auto-local`. Esta ruta crea el perfil local en la primera ejecución (usuario `local@fintrack.app`), emite las cookies JWT y redirige al dashboard — sin pantalla de login, sin contraseña. Los datos persisten en `~/Library/Application Support/FinTrack/fintrack.db` (macOS) o `%APPDATA%\FinTrack\fintrack.db` (Windows).

---

## Deploy de la landing page

La landing se puede desplegar en Vercel de forma independiente al binario de escritorio:

```bash
cd fintrack-web
npx vercel --prod
```

O conecta el repo en [vercel.com](https://vercel.com) y establece el **Root Directory** en `fintrack-web`. La variable `VERCEL=1` desactiva automáticamente el modo `standalone` de Next.js (que solo se usa para Electron).

---

## Licencia

MIT — úsalo, modifícalo, distribúyelo. Ver [LICENSE](LICENSE).

---

<p align="center">
  Hecho con 🖤 por <a href="https://github.com/iPiiix">iPiiix</a>
</p>
