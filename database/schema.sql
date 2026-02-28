CREATE DATABASE fintrack;

-- TIPOS ENUM

CREATE TYPE tipo_cuenta AS ENUM ('debito', 'credito', 'ahorros', 'inversion');
CREATE TYPE estado_transaccion AS ENUM ('pendiente', 'completada', 'fallida');
CREATE TYPE tipo_transaccion AS ENUM ('ingreso','gasto','transferencia');

-- USUARIOS
CREATE TABLE usuarios (
    id_usuario BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    contrasena TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para login rápido
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- Trigger para actualizar actualizado_en automáticamente
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuarios_actualizado
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- CATEGORÍAS
CREATE TABLE categoria (
    id_categoria BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    id_usuario BIGINT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para buscar categorías de un usuario
CREATE INDEX idx_categoria_usuario ON categoria(id_usuario);

-- Categorías globales por defecto del sistema
INSERT INTO categoria (nombre, descripcion, id_usuario) VALUES
    ('Alimentación', 'Supermercados y restaurantes', NULL),
    ('Transporte', 'Gasolina, transporte público, taxis', NULL),
    ('Vivienda', 'Alquiler, hipoteca, suministros', NULL),
    ('Salud', 'Médicos, farmacias, seguros', NULL),
    ('Ocio', 'Entretenimiento, suscripciones, hobbies, casinos, clubs nocturnos', NULL),
    ('Nómina', 'Ingresos por trabajo', NULL),
    ('Inversión', 'Dividendos, intereses, rentabilidad', NULL),
    ('Otros', 'Sin categoría específica', NULL);

-- CUENTAS
CREATE TABLE cuenta (
    id_cuenta BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    tipo tipo_cuenta NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    divisa VARCHAR(10) NOT NULL DEFAULT 'EUR',
    activa BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    id_usuario BIGINT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE INDEX idx_cuenta_usuario ON cuenta(id_usuario);

CREATE TRIGGER trigger_cuenta_actualizado
    BEFORE UPDATE ON cuenta
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp();

-- TRANSACCIONES
CREATE TABLE transacciones (
    id_transaccion BIGSERIAL PRIMARY KEY,
    cantidad DECIMAL(15, 2) NOT NULL,
    tipo tipo_transaccion NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion VARCHAR(500),
    estado estado_transaccion NOT NULL DEFAULT 'pendiente',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    id_cuenta BIGINT NOT NULL REFERENCES cuenta(id_cuenta) ON DELETE CASCADE,
    id_categoria BIGINT REFERENCES categoria(id_categoria) ON DELETE SET NULL
);

CREATE INDEX idx_transacciones_cuenta ON transacciones(id_cuenta);
CREATE INDEX idx_transacciones_fecha ON transacciones(fecha);
CREATE INDEX idx_transacciones_tipo ON transacciones(tipo);
CREATE INDEX idx_transacciones_categoria ON transacciones(id_categoria);