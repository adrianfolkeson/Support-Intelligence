import * as cron from 'node-cron';
import * as dotenv from 'dotenv';
import { query } from '../database/connection';
import { ingestTickets } from '../services/ingestion';
import { analyzeTickets } from '../services/analysis';
import { generateWeeklyReport } from '../services/report-generator';

dotenv.config();

/**
 * Get all active organizations
 */
async function getActiveOrganizations(): Promise<string[]> {
  try {
    const result = await query('SELECT id FROM organizations ORDER BY created_at');
    return result.rows.map((row) => row.id);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return [];
  }
}

/**
 * Daily job: Ingest tickets and analyze them
 */
async function runDailyJob() {
  console.log('\n=== Starting Daily Job ===');
  console.log(`Time: ${new Date().toISOString()}`);

  const organizations = await getActiveOrganizations();

  if (organizations.length === 0) {
    console.log('No organizations found');
    return;
  }

  console.log(`Processing ${organizations.length} organization(s)`);

  for (const orgId of organizations) {
    try {
      console.log(`\n--- Organization: ${orgId} ---`);

      // Step 1: Ingest tickets
      console.log('Step 1: Ingesting tickets...');
      const ingestionResult = await ingestTickets(orgId);
      console.log('Ingestion result:', ingestionResult);

      // Step 2: Analyze tickets (only if new tickets were ingested)
      if (ingestionResult.success && ingestionResult.tickets_ingested > 0) {
        console.log('Step 2: Analyzing tickets...');
        const analysisResult = await analyzeTickets(orgId);
        console.log('Analysis result:', analysisResult);
      } else {
        console.log('Step 2: Skipping analysis (no new tickets)');
      }
    } catch (error) {
      console.error(`Error processing organization ${orgId}:`, error);
      // Continue with next organization
    }
  }

  console.log('\n=== Daily Job Complete ===\n');
}

/**
 * Weekly job: Generate reports
 */
async function runWeeklyJob() {
  console.log('\n=== Starting Weekly Job ===');
  console.log(`Time: ${new Date().toISOString()}`);

  const organizations = await getActiveOrganizations();

  if (organizations.length === 0) {
    console.log('No organizations found');
    return;
  }

  console.log(`Generating reports for ${organizations.length} organization(s)`);

  for (const orgId of organizations) {
    try {
      console.log(`\n--- Organization: ${orgId} ---`);

      const result = await generateWeeklyReport(orgId);
      console.log('Report generated:', result.reportId);
    } catch (error) {
      console.error(`Error generating report for organization ${orgId}:`, error);
      // Continue with next organization
    }
  }

  console.log('\n=== Weekly Job Complete ===\n');
}

/**
 * Initialize and start scheduler
 */
function startScheduler() {
  console.log('🕐 Scheduler starting...');

  if (process.env.ENABLE_SCHEDULER !== 'true') {
    console.log('⚠️  Scheduler disabled (set ENABLE_SCHEDULER=true to enable)');
    return;
  }

  // Daily job: Run at 2 AM every day
  // Format: minute hour day month weekday
  cron.schedule('0 2 * * *', async () => {
    console.log('\n⏰ Triggering daily job (2 AM)');
    try {
      await runDailyJob();
    } catch (error) {
      console.error('Daily job failed:', error);
    }
  });

  console.log('✓ Daily job scheduled: 2:00 AM (ingest + analyze)');

  // Weekly job: Run every Monday at 3 AM
  cron.schedule('0 3 * * 1', async () => {
    console.log('\n⏰ Triggering weekly job (Monday 3 AM)');
    try {
      await runWeeklyJob();
    } catch (error) {
      console.error('Weekly job failed:', error);
    }
  });

  console.log('✓ Weekly job scheduled: Monday 3:00 AM (generate reports)');

  console.log('\n✅ Scheduler is running\n');

  // Optional: Run immediately on startup for testing
  if (process.env.RUN_ON_STARTUP === 'true') {
    console.log('🚀 Running jobs immediately (RUN_ON_STARTUP=true)...');
    setTimeout(async () => {
      await runDailyJob();
      await runWeeklyJob();
    }, 2000);
  }
}

// Export for use in main app
export { startScheduler, runDailyJob, runWeeklyJob };

// Run if called directly
if (require.main === module) {
  startScheduler();

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\n\nShutting down scheduler...');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\nShutting down scheduler...');
    process.exit(0);
  });
}
