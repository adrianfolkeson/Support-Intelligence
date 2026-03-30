// Zendesk API Client

interface ZendeskTicket {
  id: number;
  subject: string;
  description: string;
  status: string;
  priority: number;
  created_at: string;
  updated_at: string;
  requester_id: number;
  organization_id: number;
  custom_fields: any[];
  via: {
    channel: string;
  };
}

interface ZendeskUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface ZendeskConfig {
  subdomain: string;
  email: string;
  apiToken: string;
}

export async function fetchTicketsFromZendesk(
  config: ZendeskConfig,
  options: { since?: Date; limit?: number } = {}
): Promise<ZendeskTicket[]> {
  const { subdomain, email, apiToken } = config;
  const { since, limit = 100 } = options;

  const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64');
  const baseUrl = `https://${subdomain}.zendesk.com/api/v2`;

  let url = `${baseUrl}/tickets.json`;
  const params = new URLSearchParams({
    per_page: limit.toString(),
  });

  if (since) {
    const sinceDate = new Date(since);
    params.append('sort_by', 'created_at');
    params.append('sort_order', 'desc');
  }

  if (params.toString()) {
    url += `?${params}`;
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Zendesk API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.tickets || [];
}

export async function fetchZendeskUser(
  config: ZendeskConfig,
  userId: number
): Promise<ZendeskUser | null> {
  const { subdomain, email, apiToken } = config;

  const auth = Buffer.from(`${email}/token:${apiToken}`).toString('base64');
  const baseUrl = `https://${subdomain}.zendesk.com/api/v2`;

  const response = await fetch(`${baseUrl}/users/${userId}.json`, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Zendesk API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.user;
}

export async function testZendeskConnection(
  config: ZendeskConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    const tickets = await fetchTicketsFromZendesk(config, { limit: 1 });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
