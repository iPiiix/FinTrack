const db = require('better-sqlite3')('fintrack.db');

try {
  db.exec('ALTER TABLE usuarios ADD COLUMN api_key TEXT');
  console.log('Added api_key column');
} catch (e) {
  console.log('api_key might already exist:', e.message);
}

try {
  db.exec('ALTER TABLE usuarios ADD COLUMN ai_provider TEXT');
  console.log('Added ai_provider column');
} catch (e) {
  console.log('ai_provider might already exist:', e.message);
}

console.log('DB update complete.');
