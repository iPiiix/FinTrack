# Preguntas frecuentes (FAQ)

## General

### ¿FinTrack es realmente gratuito?

Sí. FinTrack es open-source con licencia MIT. No hay planes de pago, no hay funciones de pago ocultas y no hay suscripción. Descárgalo y úsalo sin límites.

### ¿Mis datos se envían a algún servidor?

No. Todos los datos se almacenan localmente en un fichero SQLite en tu dispositivo. La app no hace ninguna llamada de red excepto:
- Obtener cotizaciones de activos del portfolio (Yahoo Finance) — solo si usas el portfolio
- Llamadas al LLM si configuras el AI Advisor — solo si lo usas explícitamente

### ¿Por qué no necesito hacer login?

FinTrack es una app de escritorio personal. Al abrirse crea automáticamente un perfil local y te lleva al dashboard directamente. No tiene sentido pedir contraseña a una app que vive en tu propio dispositivo.

### ¿Funciona sin conexión a internet?

Sí, excepto para las cotizaciones del portfolio (requieren conexión a Yahoo Finance) y el AI Advisor (requiere conexión al LLM). El resto de funcionalidades, incluyendo el registro de transacciones y los gráficos, funciona 100 % offline.

---

## Instalación

### macOS dice que la app no se puede abrir porque es de un desarrollador no identificado

Es un aviso normal de Gatekeeper porque la app no está firmada con un certificado de desarrollador de Apple. Para abrirla:

1. Ve a **Ajustes del Sistema → Privacidad y Seguridad**
2. Desplázate hasta el mensaje sobre FinTrack
3. Haz clic en **"Abrir igualmente"**

Solo necesitas hacerlo una vez.

### Windows Defender me avisa al ejecutar el instalador

SmartScreen muestra un aviso en apps que no tienen reputación acumulada (es decir, apps nuevas o poco descargadas). Haz clic en **"Más información" → "Ejecutar de todas formas"** para continuar. Puedes revisar el código fuente en el repositorio si quieres verificar que es seguro.

### ¿Puedo instalar FinTrack en varios ordenadores?

Sí, pero cada instalación tiene su propia base de datos local independiente. No hay sincronización entre dispositivos (de momento). Para migrar datos, copia el fichero `fintrack.db` de un dispositivo al otro.

---

## Datos y seguridad

### ¿Dónde está mi base de datos?

| Sistema | Ruta |
|---|---|
| macOS | `~/Library/Application Support/FinTrack/fintrack.db` |
| Windows | `%APPDATA%\FinTrack\fintrack.db` |

### ¿Cómo hago una copia de seguridad?

Copia el fichero `fintrack.db` a donde quieras (disco externo, nube personal, etc.). Es un fichero SQLite estándar que puedes abrir con cualquier visor de SQLite.

### ¿Puedo ver mis datos directamente en la base de datos?

Sí. El fichero `.db` es SQLite estándar. Herramientas como [DB Browser for SQLite](https://sqlitebrowser.org/) o la extensión SQLite de VS Code te permiten inspeccionarlo directamente.

### ¿Qué pasa si desinstalo la app?

La base de datos **no se elimina** al desinstalar. Permanece en la ruta de datos de usuario. Si quieres borrarla también, elimínala manualmente.

### ¿Puedo proteger la app con contraseña?

El perfil local tiene contraseña (modificable en Ajustes → Seguridad), pero la pantalla de login no aparece al arrancar en modo escritorio — el login es automático. Si necesitas proteger el acceso, usa el bloqueo de pantalla del sistema operativo.

---

## Funcionalidades

### ¿Puedo usar FinTrack en varias divisas?

Sí. Cada cuenta puede tener su propia divisa. Los balances se muestran en la divisa de la cuenta. El patrimonio total del Overview consolida todo en EUR usando el tipo de cambio de Yahoo Finance.

### ¿Qué tickers soporta el Portfolio?

Cualquier ticker disponible en Yahoo Finance: acciones (`AAPL`, `MSFT`), ETFs (`SPY`, `VWCE.DE`), crypto (`BTC-USD`, `ETH-USD`), divisas (`EUR=X`) y más. Si Yahoo Finance lo cotiza, FinTrack lo muestra.

### ¿Puedo importar mis datos desde otro gestor financiero?

De momento no hay importador directo desde otras apps. Si tienes un CSV de transacciones, puedes adaptar su formato al esperado por FinTrack o insertar los datos directamente en el SQLite.

### ¿El AI Advisor requiere una clave de API?

El AI Advisor usa el LLM que tú configures. Necesitas una clave de API del proveedor que elijas (OpenAI, Anthropic, etc.). Sin configuración, el módulo muestra un mensaje indicando que no hay modelo configurado.

### ¿Cuántos meses de proyección hace la simulación Monte Carlo?

El selector de horizonte tiene cuatro opciones: **12, 24, 36 y 60 meses**. La simulación requiere al menos 2-3 meses de historial de transacciones para ser significativa.

---

## Desarrollo

### ¿Puedo contribuir al proyecto?

Sí. Lee la [guía de desarrollo](development.md) y abre un Pull Request en GitHub. Las PRs son bienvenidas, incluyendo las generadas con IA.

### ¿Por qué usa Next.js dentro de Electron en lugar de un frontend estático?

Next.js permite compartir las API Routes (que usan SQLite) en el mismo proceso del servidor de la app. De este modo no hay un servidor Express separado — el mismo Next.js sirve la UI y expone la API local. También facilita el despliegue de la landing page en Vercel con el mismo código.

### ¿El backend FastAPI sigue siendo necesario?

No para la versión de escritorio. El directorio `backend/` contiene un backend FastAPI que fue la primera versión del proyecto (con PostgreSQL y autenticación de usuarios múltiples). La versión actual usa Next.js API Routes + SQLite local y no depende de FastAPI.

### ¿Puedo usar FinTrack en la web (sin Electron)?

La landing page (`/`) se puede desplegar en Vercel. El dashboard (`/dashboard`) redirige a login, y el login no funciona en un contexto de servidor web sin base de datos (Vercel serverless no soporta SQLite). La versión de escritorio es el producto principal.
