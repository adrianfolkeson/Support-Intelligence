const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2tWhDPuKZQr8@ep-quiet-haze-agmirv8i-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function runMigrations() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to database');

    const migrations = [
      '001_initial_schema.sql',
      '002_add_intelligence_version.sql',
      '003_add_zendesk_credentials.sql',
      '004_add_subscriptions.sql'
    ];

    for (const migration of migrations) {
      const filePath = path.join(__dirname, '..', 'migrations', migration);

      if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${migration} - not found`);
        continue;
      }

      console.log(`Running ${migration}...`);
      const sql = fs.readFileSync(filePath, 'utf8');

      await client.query(sql);
      console.log(`✓ ${migration} completed`);
    }

    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
