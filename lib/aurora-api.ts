/**
 * Aurora API Integration
 *
 * This module handles communication between Support-Intel and Aurora
 * for churn predictions and real-time alerts.
 */

const AURORA_API_URL = process.env.AURORA_API_URL || "http://localhost:3000";
const AURORA_API_KEY = process.env.AURORA_API_KEY || "";

export interface CustomerMetrics {
  loginFrequency: number;      // 0-1 ratio of expected to actual logins
  supportTickets: number;       // Count in last 30 days
  usageDecline: number;         // Percentage decline
  paymentIssues: boolean;       // Had payment failures
  complaints: number;           // Number of formal complaints
  lastLogin?: string;           // ISO date string
  accountValue?: number;        // ARR/MRR value
  planTier?: string;            // 'basic', 'pro', 'enterprise'
  tenure?: number;              // Days as customer
  featureUsage?: Record<string, number>;  // Feature -> usage count
}

export interface ChurnPredictionRequest {
  customerId: string;
  organizationId: string;
  customerData: CustomerMetrics;
}

export interface ChurnPredictionResponse {
  customerId: string;
  organizationId: string;
  prediction: {
    churnRisk: number;           // 0-100 score
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;          // 0-100
    predictedChurnDate: string | null;  // ISO date or null
    keyFactors: Array<{
      name: string;
      impact: 'low' | 'medium' | 'high' | 'critical';
    }>;
    recommendedActions: Array<{
      priority: 'immediate' | 'high' | 'medium' | 'ongoing';
      action: string;
      owner: string;
    }>;
  };
  timestamp: string;
}

export interface WebhookEvent {
  eventType: 'churn_alert' | 'usage_spike' | 'support_escalation' | 'batch_prediction_complete';
  timestamp: string;
  data: any;
}

/**
 * Send churn prediction request to Aurora
 */
export async function sendChurnPrediction(
  request: ChurnPredictionRequest
): Promise<ChurnPredictionResponse> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (AURORA_API_KEY) {
      headers['Authorization'] = `Bearer ${AURORA_API_KEY}`;
    }

    const response = await fetch(`${AURORA_API_URL}/api/predict-churn`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Aurora API request failed: ${response.status} - ${errorText}`);
    }

    const prediction = await response.json();
    return prediction;
  } catch (error: any) {
    console.error('Failed to send churn prediction to Aurora:', error);
    throw new Error(`Aurora integration error: ${error.message}`);
  }
}

/**
 * Send webhook event to Aurora
 */
export async function sendWebhookAlert(
  eventType: WebhookEvent['eventType'],
  data: any
): Promise<any> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (AURORA_API_KEY) {
      headers['Authorization'] = `Bearer ${AURORA_API_KEY}`;
    }

    // Add webhook signature if secret is configured
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (webhookSecret) {
      headers['X-Webhook-Signature'] = generateSignature(data, webhookSecret);
    }

    const response = await fetch(`${AURORA_API_URL}/api/webhook`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        eventType,
        timestamp: new Date().toISOString(),
        data,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Aurora webhook failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Failed to send webhook to Aurora:', error);
    throw new Error(`Aurora webhook error: ${error.message}`);
  }
}

/**
 * Check Aurora API health status
 */
export async function checkAuroraHealth(): Promise<{
  status: string;
  timestamp: string;
  services: any;
}> {
  try {
    const response = await fetch(`${AURORA_API_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('Aurora health check failed:', error);
    throw error;
  }
}

/**
 * Send churn alert webhook
 */
export async function sendChurnAlert(data: {
  customerId: string;
  organizationId: string;
  riskLevel: string;
  riskScore: number;
}): Promise<any> {
  return sendWebhookAlert('churn_alert', data);
}

/**
 * Send usage spike alert
 */
export async function sendUsageSpike(data: {
  customerId: string;
  spikePercentage: number;
  feature: string;
}): Promise<any> {
  return sendWebhookAlert('usage_spike', data);
}

/**
 * Send support escalation alert
 */
export async function sendSupportEscalation(data: {
  ticketId: string;
  customerId: string;
  severity: string;
  issue: string;
}): Promise<any> {
  return sendWebhookAlert('support_escalation', data);
}

/**
 * Send batch prediction complete notification
 */
export async function sendBatchComplete(data: {
  batchId: string;
  totalCustomers: number;
  highRiskCount: number;
  processedAt: string;
}): Promise<any> {
  return sendWebhookAlert('batch_prediction_complete', data);
}

/**
 * Generate HMAC signature for webhooks
 */
function generateSignature(data: any, secret: string): string {
  const crypto = require('crypto');
  const payload = JSON.stringify(data);
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Batch process multiple customers for churn prediction
 */
export async function batchChurnPrediction(
  customers: Array<{ customerId: string; organizationId: string; customerData: CustomerMetrics }>
): Promise<ChurnPredictionResponse[]> {
  const predictions: ChurnPredictionResponse[] = [];

  // Process in parallel batches
  const batchSize = 10;
  for (let i = 0; i < customers.length; i += batchSize) {
    const batch = customers.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(customer => sendChurnPrediction(customer))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        predictions.push(result.value);
      } else {
        console.error(`Failed to predict churn for customer ${batch[index].customerId}:`, result.reason);
      }
    });
  }

  return predictions;
}

/**
 * Customer data collector helper
 */
export function collectCustomerMetrics(
  customer: any,
  supportData: any,
  usageData: any
): CustomerMetrics {
  const lastLogin = customer.lastLoginAt || customer.updatedAt;
  const now = new Date();
  const lastLoginDate = new Date(lastLogin);
  const daysSinceLogin = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate login frequency (expected: daily)
  const loginFrequency = Math.max(0, Math.min(1, 1 - (daysSinceLogin / 30)));

  // Count support tickets in last 30 days
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const supportTickets = supportData.filter((ticket: any) =>
    new Date(ticket.createdAt) > thirtyDaysAgo
  ).length;

  // Calculate usage decline
  const usageDecline = calculateUsageDecline(usageData);

  return {
    loginFrequency,
    supportTickets,
    usageDecline,
    paymentIssues: customer.paymentIssues || false,
    complaints: customer.complaints || 0,
    lastLogin: lastLogin,
    accountValue: customer.arr || customer.mrr,
    planTier: customer.plan || 'basic',
    tenure: customer.tenantDays || Math.floor((now.getTime() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    featureUsage: usageData.featureUsage || {},
  };
}

/**
 * Calculate usage decline percentage
 */
function calculateUsageDecline(usageData: any): number {
  if (!usageData.current || !usageData.previous) {
    return 0;
  }

  const current = usageData.current;
  const previous = usageData.previous;

  if (previous === 0) return 0;

  const decline = ((previous - current) / previous) * 100;
  return Math.max(0, Math.min(100, decline));
}
