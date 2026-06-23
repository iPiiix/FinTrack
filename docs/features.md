# Funcionalidades

## Overview — Resumen general

El panel principal muestra cuatro KPIs en tiempo real y dos gráficos.

### KPIs

| Métrica | Descripción |
|---|---|
| **Patrimonio total** | Suma de los balances de todas tus cuentas activas |
| **Balance mensual** | Ingresos − Gastos del mes en curso (flujo de caja neto) |
| **Ingresos (mes)** | Total de transacciones de tipo "ingreso" en el mes actual |
| **Tasa de ahorro** | `(Ingresos − Gastos) / Ingresos × 100` expresado en % |

La tasa de ahorro incluye un indicador cualitativo:
- **EXCELENTE** — ≥ 20 %
- **PUEDE MEJORAR** — 0 % – 19 %
- **CRÍTICO (DEUDA)** — negativo

### Gráfico de flujo de caja

Combina dos series sobre el mismo eje temporal (agrupado por mes):
- **Barras** — flujo mensual (verde si positivo, rojo si negativo)
- **Línea** — flujo acumulado desde la primera transacción

El tooltip muestra ambos valores al pasar el ratón.

### Donut por categorías

Desglosa el gasto total por categoría. Al pasar el ratón sobre cada segmento se muestra el importe. La leyenda enumera las categorías con su color asociado.

---

## Transacciones

### Registrar una transacción

Haz clic en **"+"** en la barra superior. Campos disponibles:

| Campo | Descripción |
|---|---|
| Nombre | Descripción breve de la transacción |
| Cantidad | Importe (siempre positivo; el tipo define si es ingreso o gasto) |
| Tipo | `ingreso` / `gasto` / `transferencia` |
| Categoría | Lista desplegable (predefinidas + personalizadas) |
| Cuenta | Cuenta bancaria a la que afecta |
| Fecha | Fecha de la transacción (por defecto hoy) |
| Descripción | Nota libre opcional |

### Filtros y búsqueda

La vista de Transacciones permite filtrar por tipo (`TODAS / ingreso / gasto / transferencia`) y buscar por nombre en tiempo real.

Los totales de ingresos y gastos se recalculan automáticamente al aplicar filtros.

### Eliminar una transacción

Haz clic en el icono de papelera en la fila de la transacción. Se pide confirmación antes de borrar.

### Exportar a CSV

Botón **"Exportar"** en la vista de Transacciones. Descarga un `.csv` con todas las transacciones visibles (aplica el filtro activo).

---

## Categorías

FinTrack incluye 5 categorías predefinidas que no se pueden eliminar:

| ID | Nombre | Uso típico |
|---|---|---|
| 1 | Nómina / Salario | Ingresos del trabajo |
| 2 | Vivienda | Alquiler, hipoteca, comunidad |
| 3 | Alimentación | Supermercado, mercado |
| 4 | Transporte | Gasolina, metro, bus |
| 5 | Ocio y Restaurantes | Salidas, cine, restaurantes |

Puedes crear categorías adicionales desde la API o directamente desde el drawer de nueva transacción (campo desplegable con opción de crear).

---

## Portfolio

Registra y monitoriza activos financieros: acciones, ETFs, crypto, inmuebles y liquidez.

### Añadir un activo

Botón **"+"** en la pestaña Portfolio:

| Campo | Descripción |
|---|---|
| Ticker | Símbolo bursátil (ej. `AAPL`, `BTC-USD`, `TSLA`) |
| Cantidad | Número de unidades o fracciones |
| Precio de compra | Precio por unidad en el momento de la compra |
| Fecha de compra | Fecha de la operación |

### Precios en tiempo real

FinTrack obtiene cotizaciones actualizadas cada **30 segundos** vía la API de Yahoo Finance. Los activos en USD se convierten automáticamente a EUR usando el tipo de cambio `EUR=X`.

### Métricas por activo

Para cada ticker agrupado se muestra:
- **Precio actual** (con diferencia % respecto al precio de compra promedio)
- **Valor de mercado** total
- **P&L** (beneficio / pérdida) en € y en %

### Patrimonio del portfolio

Suma del valor de mercado de todos los activos. Se combina con los balances de cuentas en el KPI de "Patrimonio total" del Overview.

---

## AI Advisor

Panel de análisis financiero inteligente que combina dos módulos:

### Análisis narrativo (LLM)

Genera un resumen textual de tu situación financiera usando el LLM configurado. El análisis incluye:
- Evaluación del flujo de caja y tasa de ahorro
- Identificación de categorías de mayor gasto
- Sugerencias de optimización

El análisis tiene un **cooldown de 5 minutos** para evitar llamadas innecesarias al modelo.

> **Privacidad:** solo se envían al modelo los datos que FinTrack selecciona (métricas agregadas, no transacciones individuales completas).

### Simulación Monte Carlo

Proyección probabilística del patrimonio a 12, 24, 36 o 60 meses basada en tu historial de flujo de caja.

La simulación muestra tres percentiles:
- **P10** — escenario pesimista (10 % de probabilidad de estar por debajo)
- **P50** — escenario mediano (mediana de la distribución)
- **P90** — escenario optimista (90 % de probabilidad de estar por debajo)

El selector de horizonte temporal está en la parte superior del gráfico.

---

## Ajustes

### Perfil

Modifica tu nombre y apellidos. Los cambios se guardan localmente.

### Seguridad

Cambia la contraseña del perfil local (útil si quieres proteger la app en un dispositivo compartido). La nueva contraseña debe tener al menos 8 caracteres.

### Restablecer datos

Opción de **eliminar todos los datos** (cuentas, transacciones y activos). Esta acción es irreversible y requiere confirmación explícita.

---

## Múltiples cuentas

Puedes crear tantas cuentas como necesites. Cada transacción está vinculada a una cuenta específica. Las transferencias entre cuentas mueven saldo de una a otra.

Tipos disponibles: `corriente`, `ahorro`, `inversión`, `efectivo`, y tipo libre personalizable.

Cada cuenta puede tener su propia divisa (EUR, USD, GBP, etc.). Los balances se muestran en la divisa de la cuenta; el patrimonio total consolida en EUR usando el tipo de cambio en tiempo real.
