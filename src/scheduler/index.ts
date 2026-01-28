import * as cron from 'node-cron';
import * as dotenv from 'dotenv';
import { query } from '../database/connection';
import { ingestTickets } from '../services/ingestion';
import { analyzeTickets } from '../services/analysis';
import { generateWeeklyReport } from '../services/report-generator';
import { syncZendeskTickets, getZendeskConfig } from '../services/zendesk';

dotenv.config();

// Configuration
const SCHEDULER_TIMEOUT_MS = parseInt(process.env.SCHEDULER_TIMEOUT_MS || '1800000', 10); // 30 min default
const MAX_PARALLEL_ORGS = parseInt(process.env.MAX_PARALLEL_ORGS || '5', 10); // Process 5 orgs in parallel max
const JOB_BATCH_DELAY_MS = 5000; // 5 second delay between organizations

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
 * Process a single organization with timeout
 */
async function processOrganizationWithTimeout(orgId: string, timeoutMs: number = SCHEDULER_TIMEOUT_MS): Promise<boolean> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Organization processing timed out after ${timeoutMs}ms`)), timeoutMs);
  });

  try {
    await Promise.race([
      processOrganization(orgId),
      timeoutPromise
    ]);
    return true;
  } catch (error) {
    console.error(`Organization ${orgId} processing failed or timed out:`, error);
    return false;
  }
}

/**
 * Process a single organization
 */
async function processOrganization(orgId: string): Promise<void> {
  console.log(`\n--- Organization: ${orgId} ---`);

  let ticketsSynced = 0;

  // Step 1: Check if Zendesk is configured
  const zendeskConfig = await getZendeskConfig(orgId);

  if (zendeskConfig) {
    // Sync from Zendesk
    console.log('Step 1: Syncing tickets from Zendesk...');
    const syncResult = await syncZendeskTickets(orgId);
    ticketsSynced = syncResult.ticketsSynced;
    console.log(`Synced ${ticketsSynced} tickets from Zendesk`);
  } else {
    // Fallback to old ingestion method (external API)
    console.log('Step 1: Ingesting tickets from external API...');
    const ingestionResult = await ingestTickets(orgId);
    ticketsSynced = ingestionResult.tickets_ingested || 0;
    console.log('Ingestion result:', ingestionResult);
  }

  // Step 2: Analyze tickets (only if new tickets were synced)
  if (ticketsSynced > 0) {
    console.log('Step 2: Analyzing tickets...');
    const analysisResult = await analyzeTickets(orgId);
    console.log('Analysis result:', analysisResult);
  } else {
    console.log('Step 2: Skipping analysis (no new tickets)');
  }
}

/**
 * Daily job: Ingest tickets and analyze them
 */
async function runDailyJob() {
  console.log('\n=== Starting Daily Job ===');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Timeout: ${SCHEDULER_TIMEOUT_MS}ms`);

  const organizations = await getActiveOrganizations();

  if (organizations.length === 0) {
    console.log('No organizations found');
    return { success: true, processed: 0, failed: 0 };
  }

  console.log(`Processing ${organizations.length} organization(s) with max ${MAX_PARALLEL_ORGS} parallel`);

  let processed = 0;
  let failed = 0;

  // Process organizations in batches to avoid overwhelming the system
  for (let i = 0; i < organizations.length; i += MAX_PARALLEL_ORGS) {
    const batch = organizations.slice(i, i + MAX_PARALLEL_ORGS);
    
    console.log(`\n--- Processing batch ${Math.floor(i / MAX_PARALLEL_ORGS) + 1} (${batch.length} orgs) ---`);

    const results = await Promise.allSettled(
      batch.map(orgId => processOrganizationWithTimeout(orgId))
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        processed++;
      } else {
        failed++;
      }
    }

    // Add delay between batches to avoid rate limiting
    if (i + MAX_PARALLEL_ORGS < organizations.length) {
      console.log(`Waiting ${JOB_BATCH_DELAY_MS}ms before next batch...`);
      await new Promise(resolve => setTimeout(resolve, JOB_BATCH_DELAY_MS));
    }
  }

  console.log(`\n=== Daily Job Complete: ${processed} succeeded, ${failed} failed ===\n`);
  return { success: failed === 0, processed, failed };
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
    return { success: true, processed: 0, failed: 0 };
  }

  console.log(`Generating reports for ${organizations.length} organization(s)`);

  let processed = 0;
  let failed = 0;

  for (const orgId of organizations) {
    try {
      console.log(`\n--- Organization: ${orgId} ---`);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Report generation timed out after ${SCHEDULER_TIMEOUT_MS}ms`)), SCHEDULER_TIMEOUT_MS);
      });

      await Promise.race([
        generateWeeklyReport(orgId),
        timeoutPromise
      ]);

      console.log('Report generated successfully');
      processed++;
    } catch (error) {
      console.error(`Error generating report for organization ${orgId}:`, error);
      failed++;
    }
  }

  console.log(`\n=== Weekly Job Complete: ${processed} succeeded, ${failed} failed ===\n`);
  return { success: failed === 0, processed, failed };
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
