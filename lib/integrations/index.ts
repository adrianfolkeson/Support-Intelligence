// Integration Provider Interface
// This abstraction allows you to easily swap out API providers

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: Date;
  customerEmail: string;
  customerName?: string;
  externalUrl: string;
}

export interface IntegrationConfig {
  type: 'zendesk' | 'intercom' | 'helpscout' | 'custom';
  enabled: boolean;
  config: Record<string, any>;
}

export interface IntegrationProvider {
  type: string;
  name: string;
  test(config: Record<string, any>): Promise<{ success: boolean; error?: string }>;
  fetchTickets(config: Record<string, any>, options?: any): Promise<Ticket[]>;
  // Add more methods as needed
}

// ============================================
// ZENDESK PROVIDER
// ============================================
import { fetchTicketsFromZendesk, testZendeskConnection } from './zendesk';

const zendeskProvider: IntegrationProvider = {
  type: 'zendesk',
  name: 'Zendesk',

  async test(config) {
    return await testZendeskConnection(config);
  },

  async fetchTickets(config, options = {}) {
    const tickets = await fetchTicketsFromZendesk(config, options);
    return tickets.map(t => ({
      id: t.id.toString(),
      subject: t.subject,
      description: t.description,
      status: t.status,
      priority: t.priority.toString(),
      createdAt: new Date(t.created_at),
      customerEmail: t.requester_id.toString(),
      externalUrl: `https://${config.subdomain}.zendesk.com/agent/tickets/${t.id}`,
    }));
  },
};

// ============================================
// CUSTOM PROVIDER (For your own APIs)
// ============================================
class CustomProvider implements IntegrationProvider {
  type = 'custom';
  name = 'Custom API';

  async test(config) {
    try {
      // Test your custom API
      const response = await fetch(config.apiUrl + '/health', {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      });

      if (response.ok) {
        return { success: true };
      }

      return { success: false, error: `Status ${response.status}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async fetchTickets(config, options = {}) {
    // Implement your custom API logic here
    const response = await fetch(config.apiUrl + '/tickets', {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.status}`);
    }

    const data = await response.json();

    // Map your API response to our Ticket interface
    return data.tickets.map((t: any) => ({
      id: t.id.toString(),
      subject: t.subject,
      description: t.description,
      status: t.status,
      priority: t.priority || 'medium',
      createdAt: new Date(t.created_at),
      customerEmail: t.customer_email,
      customerName: t.customer_name,
      externalUrl: t.url || `${config.apiUrl}/tickets/${t.id}`,
    }));
  }
}

// ============================================
// PROVIDER REGISTRY
// ============================================
const providers: Record<string, IntegrationProvider> = {
  zendesk: zendeskProvider,
  custom: new CustomProvider(),
};

export function getProvider(type: string): IntegrationProvider {
  if (!providers[type]) {
    throw new Error(`Unknown integration type: ${type}`);
  }
  return providers[type];
}

// Helper function to sync tickets from any integration
export async function syncTicketsFromIntegration(
  organizationId: string,
  integrationType: string,
  config: Record<string, any>
) {
  const provider = getProvider(integrationType);

  const tickets = await provider.fetchTickets(config, {
    limit: 200,
  });

  // Import tickets (deduplicated by external URL)
  let imported = 0;
  let updated = 0;

  for (const ticket of tickets) {
    // Check if ticket exists by external URL
    // You would use prisma here to save to database
    // This is just the sync logic
  }

  return {
    provider: provider.name,
    imported,
    updated,
    total: tickets.length,
  };
}
