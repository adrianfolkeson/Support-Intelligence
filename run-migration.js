const { Client } = require('pg');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const sql = `
      CREATE TABLE IF NOT EXISTS user_organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'owner',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, organization_id)
      );

      CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON user_organizations(organization_id);
    `;

    await client.query(sql);
    console.log('✓ Migration completed: user_organizations table created');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
