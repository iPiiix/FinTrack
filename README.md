# FinTrack

## 📋 Resumen General

**FinTrack** es una plataforma web intuitiva diseñada para ayudarte a tomar el control absoluto de tus finanzas personales o empresariales. Su objetivo principal es ofrecerte un panorama claro de tus movimientos monetarios sin la complejidad de las hojas de cálculo tradicionales.

Con FinTrack, puedes registrar fácilmente tus ingresos y gastos, visualizar a dónde va tu dinero usando gráficos interactivos, categorizar tus transacciones y obtener ayuda analítica respaldada por Inteligencia Artificial. Además, la plataforma está diseñada con fuertes medidas de seguridad y gestión de suscripciones para ofrecerte una experiencia fluida, dándote las herramientas necesarias para mejorar tu salud financiera sin esfuerzo técnico.

---

## 🛠️ Stack Tecnológico

El proyecto está separado en dos partes principales: la interfaz visible (Frontend) y el núcleo lógico junto a la base de datos (Backend).

### Frontend (Interfaz Gráfica)
Construido para ser rápido, interactivo y atractivo visualmente:
* **Framework:** Next.js y React 19.
* **Estilos y UI:** Tailwind CSS v4 para el diseño responsivo moderno.
* **Animaciones:** Framer Motion para transiciones suaves y dinámicas.
* **Visualización de Datos:** Recharts y Chart.js para los gráficos de ingresos y gastos.
* **Pagos:** Stripe.js para procesar de forma segura suscripciones y transacciones.
* **Seguridad:** Cloudflare Turnstile (una alternativa moderna a reCAPTCHA) para evitar bots en inicios de sesión o registros.

### Backend (Lógica y Datos)
Construido para ser robusto, seguro y eficiente:
* **Framework:** FastAPI en Python (extremadamente rápido para APIs).
* **Base de Datos:** PostgreSQL (o SQLite en desarrollo local) integrándose mediante SQLAlchemy.
* **Control de versiones de Base de Datos:** Alembic para migraciones.
* **IA Analítica:** Integración con la API de Google Generative AI (Gemini).
* **Autenticación:** Sistema de usuarios con hashes seguros (Bcrypt) y JSON Web Tokens (JWT).
* **Servidor HTTP:** Uvicorn / Gunicorn para un despliegue optimizado.

---

## ⚙️ Detalles Técnicos

### Estructura del Repositorio

1. **/fintrack-web** (Next.js Application)
   - Utiliza el *App Router* de Next.js (`app/`).
   - Gestión de estado global con Context API (ej. `AuthContext.tsx`).
   - Uso de un middleware de Next.js (`middleware.ts`) para manejo de proxies, inyección de headers o protección de rutas en el borde.
   - Herramientas configuradas como ESLint para asegurar calidad en el código TypeScript.

2. **/backend** (FastAPI)
   - Patrón MVC / Endpoints modulares mediante `routers/` (ej. `usuarios.py`).
   - Scripts de utileria para desarrollo rápido como `debug_db.py` o `test_ai.py`.
   - Sistema de configuración multi-entorno cargado a través de `python-dotenv` y las settings de Pydantic.
   - Administración integrada en desarrollo usando herramientas de inspección como de `sqladmin`.

### Puesta en Marcha en Local

**1. Entorno del Backend**
```bash
cd backend
# Activar tu entorno virtual
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt

# Ejecutar el servidor con recarga automática
uvicorn app.main:app --reload
# El servidor suele escuchar en http://localhost:8000
```
> *(Nota: Asegúrate de configurar correctamente tu archivo `.env` en la carpeta backend con credenciales para base de datos, Stripe, JWT secreto y Google AI).*

**2. Entorno del Frontend**
```bash
cd fintrack-web
# Instalar módulos de node
npm install

# Lanzar el servidor de desarrollo
npm run dev
# El cliente se levantará en http://localhost:3000
```
> *(El archivo `.env.local` debe contener la URL pública base del backend y tus claves testeables de Stripe / Turnstile).*
