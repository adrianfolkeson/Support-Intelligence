import { query } from '../database/connection';

interface ZendeskTicket {
  id: number;
  subject: string;
  description: string;
  requester_id: number;
  status: string;
  priority: string | null;
  created_at: string;
  updated_at: string;
}

interface ZendeskUser {
  id: number;
  email: string;
  name: string;
}

interface ZendeskConfig {
  subdomain: string;
  email: string;
  apiToken: string;
}

/**
 * Fetch tickets from Zendesk API
 */
export async function fetchZendeskTickets(
  organizationId: string,
  config: ZendeskConfig,
  sinceDate?: Date
): Promise<{ ticketsSynced: number }> {
  const { subdomain, email, apiToken } = config;

  // Build Zendesk API URL
  const baseUrl = `https://${subdomain}.zendesk.com/api/v2`;

  // Create Basic Auth token (email/token format for Zendesk)
  const authToken = Buffer.from(`${email}/token:${apiToken}`).toString('base64');

  let ticketsSynced = 0;
  let hasMore = true;
  let nextPage: string | null = null;

  // Build initial URL with optional date filter
  let ticketsUrl = `${baseUrl}/tickets.json?include=users`;
  if (sinceDate) {
    const timestamp = Math.floor(sinceDate.getTime() / 1000);
    ticketsUrl += `&start_time=${timestamp}`;
  }

  try {
    while (hasMore) {
      const url = nextPage || ticketsUrl;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Basic ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Zendesk API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const tickets: ZendeskTicket[] = data.tickets || [];
      const users: ZendeskUser[] = data.users || [];

      // Create a map of user IDs to user info for quick lookup
      const userMap = new Map<number, ZendeskUser>();
      users.forEach((user) => {
        userMap.set(user.id, user);
      });

      // Insert tickets into database
      for (const ticket of tickets) {
        const user = userMap.get(ticket.requester_id);
        const customerId = user?.email || `zendesk_user_${ticket.requester_id}`;

        try {
          await query(
            `INSERT INTO support_tickets (
              organization_id,
              external_ticket_id,
              customer_id,
              subject,
              message,
              status,
              priority,
              ticket_timestamp
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (organization_id, external_ticket_id) DO UPDATE SET
              subject = EXCLUDED.subject,
              message = EXCLUDED.message,
              status = EXCLUDED.status,
              priority = EXCLUDED.priority`,
            [
              organizationId,
              `zendesk_${ticket.id}`,
              customerId,
              ticket.subject || '(No Subject)',
              ticket.description || '',
              ticket.status,
              ticket.priority,
              new Date(ticket.created_at),
            ]
          );
          ticketsSynced++;
        } catch (err) {
          console.error(`Error inserting ticket ${ticket.id}:`, err);
        }
      }

      // Check for pagination
      hasMore = !!data.next_page;
      nextPage = data.next_page;

      // Zendesk rate limiting: be nice to their API
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Update last sync timestamp
    await query(
      'UPDATE organizations SET last_sync_at = NOW() WHERE id = $1',
      [organizationId]
    );

    console.log(`✓ Synced ${ticketsSynced} tickets from Zendesk for org ${organizationId}`);

    return { ticketsSynced };

  } catch (error) {
    console.error('Zendesk sync error:', error);
    throw error;
  }
}

/**
 * Load Zendesk configuration from database
 */
export async function getZendeskConfig(organizationId: string): Promise<ZendeskConfig | null> {
  const result = await query(
    'SELECT zendesk_subdomain, zendesk_email, zendesk_api_token FROM organizations WHERE id = $1',
    [organizationId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const org = result.rows[0];

  if (!org.zendesk_subdomain || !org.zendesk_email || !org.zendesk_api_token) {
    return null;
  }

  return {
    subdomain: org.zendesk_subdomain,
    email: org.zendesk_email,
    apiToken: org.zendesk_api_token,
  };
}

/**
 * Sync tickets from Zendesk for an organization
 */
export async function syncZendeskTickets(organizationId: string): Promise<{ ticketsSynced: number }> {
  const config = await getZendeskConfig(organizationId);

  if (!config) {
    throw new Error('Zendesk not configured for this organization');
  }

  // Get last sync time to only fetch new tickets
  const lastSyncResult = await query(
    'SELECT last_sync_at FROM organizations WHERE id = $1',
    [organizationId]
  );

  const lastSyncAt = lastSyncResult.rows[0]?.last_sync_at;

  return await fetchZendeskTickets(organizationId, config, lastSyncAt);
}
