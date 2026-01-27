import * as fs from 'fs';
import * as path from 'path';
import { query, closePool } from './connection';

const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

async function createMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

async function getExecutedMigrations(): Promise<string[]> {
  const result = await query('SELECT filename FROM schema_migrations ORDER BY id');
  return result.rows.map((row) => row.filename);
}

async function executeMigration(filename: string) {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`Executing migration: ${filename}`);

  try {
    await query(sql);
    await query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
    console.log(`✓ Migration ${filename} completed`);
  } catch (error) {
    console.error(`✗ Migration ${filename} failed:`, error);
    throw error;
  }
}

async function runMigrations() {
  try {
    console.log('Starting database migrations...');

    await createMigrationsTable();

    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    const executed = await getExecutedMigrations();
    const pending = files.filter((f) => !executed.includes(f));

    if (pending.length === 0) {
      console.log('No pending migrations');
      return;
    }

    console.log(`Found ${pending.length} pending migration(s)`);

    for (const file of pending) {
      await executeMigration(file);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };
