#!/usr/bin/env node

/**
 * Import customer CSV tickets for manual analysis
 *
 * Usage:
 *   node scripts/import-customer-csv.js customer_tickets.csv "Customer Name"
 *
 * CSV format expected: customer_id,subject,message
 */

require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function importCSV(filepath, organizationName) {
  try {
    // 1. Create organization
    const orgId = uuidv4();
    console.log(`Creating organization: ${organizationName}`);
    console.log(`Organization ID: ${orgId}`);

    await pool.query(
      'INSERT INTO organizations (id, name, created_at) VALUES ($1, $2, NOW()) ON CONFLICT (id) DO NOTHING',
      [orgId, organizationName]
    );

    // 2. Read CSV
    const csvContent = fs.readFileSync(filepath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    // Skip header
    const tickets = lines.slice(1);

    console.log(`Found ${tickets.length} tickets to import`);

    // 3. Import tickets
    let imported = 0;
    for (const line of tickets) {
      // Simple CSV parser (handles basic cases)
      const match = line.match(/^([^,]*),([^,]*),(.*)$/);
      if (!match) {
        console.warn(`Skipping malformed line: ${line.substring(0, 50)}...`);
        continue;
      }

      const [, customer_id, subject, message] = match;

      if (!customer_id || !message) {
        console.warn(`Skipping incomplete line`);
        continue;
      }

      await pool.query(
        `INSERT INTO support_tickets (id, organization_id, customer_id, subject, message, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [uuidv4(), orgId, customer_id.trim(), subject.trim(), message.trim()]
      );

      imported++;
      if (imported % 10 === 0) {
        console.log(`Imported ${imported} tickets...`);
      }
    }

    console.log(`\n✅ Success! Imported ${imported} tickets`);
    console.log(`\nNext steps:`);
    console.log(`1. Run analysis: npm run analyze -- ${orgId}`);
    console.log(`2. Check results: npm run report -- ${orgId}`);
    console.log(`3. Or query database directly for org_id: ${orgId}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Main
const args = process.argv.slice(2);
if (args.length !== 2) {
  console.error('Usage: node scripts/import-customer-csv.js <csv-file> <organization-name>');
  console.error('Example: node scripts/import-customer-csv.js acme_tickets.csv "Acme Corp"');
  process.exit(1);
}

const [filepath, orgName] = args;

if (!fs.existsSync(filepath)) {
  console.error(`❌ File not found: ${filepath}`);
  process.exit(1);
}

importCSV(filepath, orgName);
