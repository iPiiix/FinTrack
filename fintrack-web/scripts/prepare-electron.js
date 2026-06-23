/**
 * Run after `next build` and before `electron-builder`.
 * - Copies .next/static into standalone (Next.js requires it there)
 * - Copies public/ into standalone
 * - Removes better-sqlite3 from standalone so electron-builder's
 *   rebuilt version (in app.asar.unpacked) is used via NODE_PATH.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const standalone = path.join(root, '.next', 'standalone');

if (!fs.existsSync(standalone)) {
  console.error('ERROR: .next/standalone not found. Run `next build` first.');
  process.exit(1);
}

// Copy static assets into standalone
fs.cpSync(
  path.join(root, '.next', 'static'),
  path.join(standalone, '.next', 'static'),
  { recursive: true }
);
console.log('Copied .next/static → .next/standalone/.next/static');

// Copy public assets into standalone
fs.cpSync(
  path.join(root, 'public'),
  path.join(standalone, 'public'),
  { recursive: true }
);
console.log('Copied public/ → .next/standalone/public/');

// Remove better-sqlite3 from standalone — electron-builder rebuilds the
// project-level copy for the correct Electron ABI and places it in
// app.asar.unpacked/node_modules, which main.js exposes via NODE_PATH.
const sqlitePath = path.join(standalone, 'node_modules', 'better-sqlite3');
if (fs.existsSync(sqlitePath)) {
  fs.rmSync(sqlitePath, { recursive: true, force: true });
  console.log('Removed better-sqlite3 from standalone/node_modules');
}

console.log('Electron build prepared.');
