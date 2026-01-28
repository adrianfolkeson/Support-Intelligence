import { query } from '../database/connection';
import { SupportTicket, IngestionResult } from '../types';
import * as dotenv from 'dotenv';

dotenv.config();

interface ExternalTicket {
  id: string;
  customer_id: string;
  subject?: string;
  message: string;
  status?: string;
  priority?: string;
  created_at: string;
}

// =============================================================================
// SUPPORT PLATFORM INTEGRATION - ZENDESK (ACTIVE)
// =============================================================================

async function fetchTicketsFromZendesk(apiUrl: string, apiKey: string, since?: Date): Promise<ExternalTicket[]> {
  let url = `${apiUrl}/api/v2/tickets.json?sort_order=desc`;
  
  // Add timestamp filter if provided
  if (since) {
    // Zendesk doesn't have a direct "since" param, we'll filter in code
    console.log(`Filtering tickets since: ${since.toISOString()}`);
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${apiKey}/token:${apiKey}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Zendesk API failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as { tickets: any[] };
  
  const tickets = data.tickets.map((t) => ({
    id: String(t.id),
    customer_id: String(t.requester_id),
    subject: t.subject,
    message: t.description || t.subject,
    status: t.status,
    priority: t.priority || 'normal',
    created_at: t.created_at,
  }));

  // Filter by date if since is provided
  if (since) {
    return tickets.filter((t: ExternalTicket) => new Date(t.created_at) > since);
  }

  return tickets;
}

// =============================================================================
// SUPPORT PLATFORM INTEGRATION EXAMPLES (COMMENTED OUT)
// =============================================================================

// ----- FRESHDESK EXAMPLE -----
//
// async function fetchTicketsFromFreshdesk(apiUrl: string, apiKey: string): Promise<ExternalTicket[]> {
//   const response = await fetch(`${apiUrl}/api/v2/tickets`, {
//     headers: {
//       'Authorization': `Basic ${Buffer.from(`${apiKey}:X`).toString('base64')}`,
//       'Content-Type': 'application/json',
//     },
//   });
//   const tickets = await response.json();
//   return tickets.map((t: any) => ({
//     id: String(t.id),
//     customer_id: String(t.requester_id),
//     subject: t.subject,
//     message: t.description_text || t.subject,
//     status: t.status === 2 ? 'open' : t.status === 3 ? 'closed' : 'open',
//     priority: t.priority === 1 ? 'low' : t.priority === 2 ? 'medium' : t.priority === 3 ? 'high' : 'urgent',
//     created_at: new Date(t.created_at).toISOString(),
//   }));
// }

// ----- INTERCOM EXAMPLE -----
//
// async function fetchTicketsFromIntercom(apiUrl: string, apiKey: string): Promise<ExternalTicket[]> {
//   const response = await fetch(`${apiUrl}/conversations`, {
//     headers: {
//       'Authorization': `Bearer ${apiKey}`,
//       'Accept': 'application/json',
//     },
//   });
//   const data = await response.json();
//   return data.conversations.map((c: any) => ({
//     id: c.id,
//     customer_id: c.source.author.id,
//     subject: c.source.subject || 'Intercom Conversation',
//     message: c.source.body || '',
//     status: c.state,
//     priority: 'medium',
//     created_at: new Date(c.created_at * 1000).toISOString(),
//   }));
// }

// =============================================================================
// DEFAULT: ZENDESK INTEGRATION (Active)
// =============================================================================

/**
 * Fetch tickets from Zendesk API
 */
async function fetchTicketsFromAPI(
  apiUrl: string,
  apiKey: string,
  since?: Date
): Promise<ExternalTicket[]> {
  const params = new URLSearchParams();
  if (since) {
    params.append('since', since.toISOString());
  }

  const url = `${apiUrl}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;

    // Normalize response structure (adapt based on your API)
    // Example assumes: { tickets: [...] } or directly [...]
    const tickets = Array.isArray(data) ? data : data.tickets || [];

    return tickets;
  } catch (error) {
    console.error('Error fetching tickets from external API:', error);
    throw error;
  }
}

/**
 * Normalize external ticket to our schema
 */
function normalizeTicket(
  external: ExternalTicket,
  organizationId: string
): Partial<SupportTicket> {
  return {
    organization_id: organizationId,
    external_ticket_id: external.id,
    customer_id: external.customer_id,
    subject: external.subject || 'No subject',
    message: external.message.trim(),
    status: (external.status as any) || 'open',
    priority: (external.priority as any) || 'medium',
    ticket_timestamp: new Date(external.created_at),
  };
}

/**
 * Insert ticket into database (skip if duplicate)
 */
async function insertTicket(ticket: Partial<SupportTicket>): Promise<boolean> {
  const sql = `
    INSERT INTO support_tickets (
      organization_id,
      external_ticket_id,
      customer_id,
      subject,
      message,
      status,
      priority,
      ticket_timestamp
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (organization_id, external_ticket_id) DO NOTHING
    RETURNING id
  `;

  const values = [
    ticket.organization_id,
    ticket.external_ticket_id,
    ticket.customer_id,
    ticket.subject,
    ticket.message,
    ticket.status,
    ticket.priority,
    ticket.ticket_timestamp,
  ];

  try {
    const result = await query(sql, values);
    return result.rowCount ? result.rowCount > 0 : false;
  } catch (error) {
    console.error('Error inserting ticket:', error);
    throw error;
  }
}

/**
 * Get the most recent ticket timestamp for an organization
 */
async function getLastTicketTimestamp(organizationId: string): Promise<Date | null> {
  const sql = `
    SELECT MAX(ticket_timestamp) as last_timestamp
    FROM support_tickets
    WHERE organization_id = $1
  `;

  const result = await query(sql, [organizationId]);

  return result.rows[0]?.last_timestamp || null;
}

/**
 * Main ingestion function
 */
export async function ingestTickets(organizationId: string): Promise<IngestionResult> {
  try {
    console.log(`Starting ticket ingestion for organization: ${organizationId}`);

    // Get organization API credentials
    const orgResult = await query(
      'SELECT external_api_url, external_api_key FROM organizations WHERE id = $1',
      [organizationId]
    );

    if (orgResult.rows.length === 0) {
      throw new Error(`Organization ${organizationId} not found`);
    }

    const { external_api_url, external_api_key } = orgResult.rows[0];

    if (!external_api_url || !external_api_key) {
      throw new Error('Organization missing API credentials');
    }

    // Get last ingestion timestamp to avoid re-fetching
    const lastTimestamp = await getLastTicketTimestamp(organizationId);
    const since = lastTimestamp || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days

    console.log(`Fetching tickets since: ${since.toISOString()}`);

    // Fetch tickets from external API
    const externalTickets = await fetchTicketsFromAPI(
      external_api_url,
      external_api_key,
      since
    );

    console.log(`Fetched ${externalTickets.length} tickets from external API`);

    // Normalize and insert
    let ingested = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const externalTicket of externalTickets) {
      try {
        const normalized = normalizeTicket(externalTicket, organizationId);
        const inserted = await insertTicket(normalized);

        if (inserted) {
          ingested++;
        } else {
          skipped++;
        }
      } catch (error) {
        errors.push(`Ticket ${externalTicket.id}: ${error}`);
      }
    }

    console.log(`Ingestion complete: ${ingested} new, ${skipped} skipped`);

    return {
      success: true,
      tickets_ingested: ingested,
      tickets_skipped: skipped,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error('Ingestion failed:', error);
    return {
      success: false,
      tickets_ingested: 0,
      tickets_skipped: 0,
      errors: [String(error)],
    };
  }
}

// Run if called directly
if (require.main === module) {
  const orgId = process.argv[2];

  if (!orgId) {
    console.error('Usage: node ingestion.js <organization_id>');
    process.exit(1);
  }

  ingestTickets(orgId)
    .then((result) => {
      console.log('Result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
