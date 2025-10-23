// Apply the chat close columns migration without psql (ESM compatible)
// Usage:
//   node server/scripts/apply_migration_chat_close.js "<DATABASE_URL>"
// or set env var DATABASE_URL and run without an arg.

import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

const MIGRATION_REL_PATH = path.join('server', 'migrations', '2025-10-21_add_chat_close_columns.sql');
const MIGRATION_ABS_PATH = path.isAbsolute(MIGRATION_REL_PATH)
  ? MIGRATION_REL_PATH
  : path.join(process.cwd(), MIGRATION_REL_PATH);
const MIGRATION_SQL = fs.readFileSync(MIGRATION_ABS_PATH, 'utf8');

const DATABASE_URL = process.env.DATABASE_URL || process.argv[2];
if (!DATABASE_URL) {
  console.error('DATABASE_URL not provided. Pass as first arg or set env var.');
  process.exit(1);
}

const run = async () => {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query('BEGIN');
    await client.query(MIGRATION_SQL);
    await client.query('COMMIT');
    console.log('✅ Migration applied successfully.');
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

run();
