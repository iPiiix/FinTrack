import type Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  // In Electron production the main process sets DATABASE_PATH to userData
  const dbPath = process.env.DATABASE_PATH
    ? process.env.DATABASE_PATH
    : path.join(process.cwd(), 'fintrack.db');

  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SQLite = require('better-sqlite3') as typeof import('better-sqlite3');
  _db = SQLite(dbPath);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre      TEXT NOT NULL,
      apellidos   TEXT NOT NULL DEFAULT '',
      email       TEXT UNIQUE NOT NULL,
      fecha_nacimiento TEXT,
      contrasena  TEXT NOT NULL,
      creado_en   TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id  INTEGER NOT NULL,
      token_hash  TEXT UNIQUE NOT NULL,
      revoked     INTEGER DEFAULT 0,
      expires_at  TEXT NOT NULL,
      creado_en   TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cuentas (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre      TEXT NOT NULL,
      tipo        TEXT NOT NULL,
      balance     REAL DEFAULT 0,
      divisa      TEXT DEFAULT 'EUR',
      activa      INTEGER DEFAULT 1,
      usuario_id  INTEGER NOT NULL,
      creado_en   TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS categorias (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre      TEXT NOT NULL,
      descripcion TEXT,
      usuario_id  INTEGER,
      creado_en   TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    INSERT OR IGNORE INTO categorias (id, nombre, descripcion) VALUES
      (1, 'Nómina / Salario',    'Ingresos regulares del trabajo'),
      (2, 'Vivienda',             'Alquiler, hipoteca, comunidad'),
      (3, 'Alimentación',         'Supermercado y comida'),
      (4, 'Transporte',           'Gasolina, transporte público'),
      (5, 'Ocio y Restaurantes',  'Salidas, cine, restaurantes');

    CREATE TABLE IF NOT EXISTS transacciones (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      cantidad    REAL NOT NULL,
      tipo        TEXT NOT NULL,
      nombre      TEXT NOT NULL,
      descripcion TEXT,
      estado      TEXT DEFAULT 'completada',
      fecha       TEXT DEFAULT (datetime('now')),
      cuenta_id   INTEGER NOT NULL,
      categoria_id INTEGER,
      creado_en   TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (cuenta_id)    REFERENCES cuentas(id)    ON DELETE CASCADE,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    );

    CREATE TABLE IF NOT EXISTS activos (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker        TEXT NOT NULL,
      cantidad      REAL NOT NULL,
      precio_compra REAL NOT NULL,
      fecha_compra  TEXT DEFAULT (datetime('now')),
      usuario_id    INTEGER NOT NULL,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );
  `);
}
