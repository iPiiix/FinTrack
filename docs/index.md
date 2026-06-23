# Documentación de FinTrack

Bienvenido a la documentación oficial de **FinTrack**, la app de escritorio open-source para gestión de finanzas personales.

## Contenido

| Sección | Descripción |
|---|---|
| [Primeros pasos](getting-started.md) | Instalación, primer arranque y configuración inicial |
| [Funcionalidades](features.md) | Guía detallada de cada módulo del dashboard |
| [Arquitectura](architecture.md) | Stack técnico, estructura del proyecto y flujo de datos |
| [Desarrollo](development.md) | Cómo compilar desde el código fuente y contribuir |
| [FAQ](faq.md) | Preguntas frecuentes |

---

## ¿Qué es FinTrack?

FinTrack es una aplicación de escritorio construida con Electron y Next.js que almacena todos tus datos en una base de datos SQLite local. No requiere internet para funcionar, no envía datos a ningún servidor externo y no tiene pantalla de inicio de sesión — al abrirla, estás directo en tu dashboard.

### Principios de diseño

- **Local-first** — SQLite en tu dispositivo. Sin cloud, sin sincronización remota, sin telemetría.
- **Sin fricciones** — no hay registro ni login. Descarga, instala, abre.
- **Open source** — MIT. Audita el código, forkea, contribuye.
- **Sin suscripción** — gratis sin límites para uso personal.

---

## Plataformas soportadas

| Plataforma | Estado |
|---|---|
| macOS (Apple Silicon) | ✅ Soportado |
| macOS (Intel x64) | ✅ Soportado |
| Windows 10/11 (x64) | ✅ Soportado |
| Linux | 🔜 Próximamente |

---

## Descarga rápida

→ [GitHub Releases](https://github.com/iPiiix/FinTrack/releases/latest)
