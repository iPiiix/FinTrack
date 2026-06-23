# Primeros pasos

## Instalación

### macOS

1. Descarga el archivo `.dmg` correspondiente a tu procesador:
   - **Apple Silicon (M1/M2/M3/M4):** [FinTrack-1.0.0-arm64.dmg](https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-1.0.0-arm64.dmg)
   - **Intel:** [FinTrack-1.0.0.dmg](https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-1.0.0.dmg)

2. Abre el `.dmg` y arrastra **FinTrack** a la carpeta Aplicaciones.

3. La primera vez que lo abras, macOS puede mostrar un aviso de seguridad porque la app no está firmada por Apple. Para abrirla:
   - Ve a **Ajustes del Sistema → Privacidad y Seguridad**
   - Desplázate hacia abajo hasta encontrar el mensaje sobre FinTrack
   - Haz clic en **"Abrir igualmente"**

4. FinTrack se abre directamente en el dashboard. No hay pantalla de inicio de sesión.

---

### Windows

1. Descarga el instalador: [FinTrack-Setup-1.0.0.exe](https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-Setup-1.0.0.exe)

2. Ejecuta el instalador. Si Windows Defender SmartScreen aparece, haz clic en **"Más información" → "Ejecutar de todas formas"**.

3. Puedes elegir el directorio de instalación. Se crea un acceso directo en el escritorio y en el menú Inicio.

4. FinTrack se abre directamente en el dashboard.

---

## Primer uso

Al arrancar por primera vez, FinTrack:

1. Crea una base de datos SQLite en tu carpeta de datos de usuario:
   - **macOS:** `~/Library/Application Support/FinTrack/fintrack.db`
   - **Windows:** `%APPDATA%\FinTrack\fintrack.db`

2. Genera un perfil local automáticamente (sin contraseña).

3. Inserta 5 categorías predefinidas: Nómina / Salario, Vivienda, Alimentación, Transporte, Ocio y Restaurantes.

4. Te redirige al dashboard.

---

## Configuración inicial recomendada

### 1. Crea tus cuentas

Antes de registrar transacciones necesitas al menos una cuenta. Haz clic en **"Nueva cuenta"** en el panel de Overview.

Tipos de cuenta disponibles:
- **Corriente** — cuenta bancaria del día a día
- **Ahorro** — depósitos o cuentas de ahorro
- **Inversión** — cuenta de broker o fondos
- **Efectivo** — dinero físico

Puedes crear varias cuentas en diferentes divisas.

### 2. Registra tus primeras transacciones

Haz clic en el botón **"+"** de la barra superior. Rellena:
- **Nombre** — descripción breve (ej. "Sueldo enero", "Supermercado")
- **Cantidad** — importe en la divisa de la cuenta
- **Tipo** — Ingreso, Gasto o Transferencia
- **Categoría** — elige una de las predefinidas o créala tú
- **Cuenta** — cuenta a la que afecta
- **Fecha** — por defecto hoy

### 3. Añade tus activos al Portfolio (opcional)

Si tienes acciones, ETFs, crypto u otros activos, ve a la pestaña **Portfolio** y regístralos con su ticker, cantidad y precio de compra. FinTrack actualiza los precios en tiempo real cada 30 segundos.

---

## Dónde se guardan tus datos

| Sistema | Ruta |
|---|---|
| macOS | `~/Library/Application Support/FinTrack/fintrack.db` |
| Windows | `%APPDATA%\FinTrack\fintrack.db` |

Para hacer una copia de seguridad, copia ese fichero `.db` a donde quieras. Para restaurar, reemplaza el fichero antes de abrir la app.

> **Importante:** si eliminas o mueves este fichero, FinTrack creará uno nuevo vacío en el siguiente arranque. Tus datos anteriores no serán recuperables a menos que tengas copia.
