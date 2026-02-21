CREATE DATABASE fintrack;

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

CREATE TYPE tipo_cuenta AS ENUM ('debito', 'credito', 'ahorros', 'inversion');

CREATE TABLE cuenta(
    id_cuenta BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    tipo tipo_cuenta NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    divisa VARCHAR(10) NOT NULL,
    
    id_usuario BIGINT REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TYPE estado_transaccion AS ENUM ('pendiente', 'completada', 'fallida');

CREATE TABLE transacciones (
    id_transaccion BIGSERIAL PRIMARY KEY,
    cantidad DECIMAL(15, 2) NOT NULL, 
    nombre VARCHAR(200) NOT NULL,
    descripcion VARCHAR(500),
    estado estado_transaccion NOT NULL DEFAULT 'pendiente',
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    id_cuenta BIGINT NOT NULL REFERENCES cuenta(id_cuenta) ON DELETE CASCADE,
    id_categoria BIGINT REFERENCES categoria(id_categoria) ON DELETE SET NULL
);

CREATE TABLE categoria (
    id_categoria BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255)
);