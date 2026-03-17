# Aurora Integration for Support-Intel

This directory contains the Aurora API integration for the Support-Intel system.

## Overview

Aurora provides enterprise-grade AI for customer churn prediction and retention. This integration allows Support-Intel to send customer data to Aurora and receive churn risk predictions, recommended actions, and real-time alerts.

## Setup

### 1. Environment Variables

Add these variables to your `.env` file:

```bash
# Aurora API Configuration
AURORA_API_URL=http://localhost:3000
AURORA_API_KEY=your_api_key_here
WEBHOOK_SECRET=your_webhook_secret
```

### 2. API Endpoints

Once configured, you'll have access to these endpoints:

#### `POST /api/aurora/predict`

Analyze a single customer's churn risk.

**Request:**
```json
{
  "customerId": "customer_abc123",
  "organizationId": "org_xyz789",
  "customer": {
    "id": "customer_abc123",
    "email": "customer@example.com",
    "plan": "enterprise",
    "arr": 50000,
    "paymentIssues": false,
    "complaints": 1
  },
  "supportData": [
    {
      "id": "ticket_123",
      "createdAt": "2024-03-01T10:00:00Z",
      "severity": "high"
    }
  ],
  "usageData": {
    "current": 150,
    "previous": 200,
    "featureUsage": {
      "feature_a": 50,
      "feature_b": 100
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "customerId": "customer_abc123",
  "prediction": {
    "churnRisk": 78,
    "riskLevel": "high",
    "confidence": 85,
    "predictedChurnDate": "2024-05-15T00:00:00.000Z",
    "keyFactors": [
      { "name": "Low login frequency", "impact": "high" },
      { "name": "High support ticket volume", "impact": "high" }
    ],
    "recommendedActions": [
      {
        "priority": "immediate",
        "action": "Schedule executive outreach call",
        "owner": "Customer Success"
      }
    ]
  },
  "analyzedAt": "2024-03-17T10:30:00.000Z"
}
```

#### `GET /api/aurora/predict`

Check Aurora connection status.

**Response:**
```json
{
  "status": "connected",
  "aurora": {
    "status": "healthy",
    "timestamp": "2024-03-17T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

#### `POST /api/aurora/batch`

Process multiple customers for churn prediction (up to 100).

**Request:**
```json
{
  "customers": [
    {
      "customerId": "customer_1",
      "organizationId": "org_1",
      "customerData": {
        "loginFrequency": 0.5,
        "supportTickets": 5,
        "usageDecline": 20,
        "paymentIssues": false,
        "complaints": 0
      }
    },
    {
      "customerId": "customer_2",
      "organizationId": "org_1",
      "customerData": {
        "loginFrequency": 0.2,
        "supportTickets": 15,
        "usageDecline": 60,
        "paymentIssues": true,
        "complaints": 3
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "batchId": "batch_1710678000000",
  "summary": {
    "totalCustomers": 2,
    "highRiskCount": 1,
    "criticalCount": 1,
    "avgRiskScore": 64.5
  },
  "predictions": [...],
  "processedIn": 523
}
```

## Usage Examples

### Example 1: Analyze Customer Churn Risk

```typescript
import { sendChurnPrediction } from '@/lib/aurora-api';

const prediction = await sendChurnPrediction({
  customerId: 'customer_123',
  organizationId: 'org_abc',
  customerData: {
    loginFrequency: 0.3,
    supportTickets: 12,
    usageDecline: 45,
    paymentIssues: true,
    complaints: 2
  }
});

console.log(`Churn Risk: ${prediction.prediction.churnRisk}%`);
console.log(`Risk Level: ${prediction.prediction.riskLevel}`);

// Trigger actions if high risk
if (prediction.prediction.churnRisk >= 50) {
  // Send alert to customer success team
  // Schedule follow-up
  // Create retention task
}
```

### Example 2: Send Real-Time Alert

```typescript
import { sendChurnAlert } from '@/lib/aurora-api';

// When detecting critical churn risk
await sendChurnAlert({
  customerId: 'customer_123',
  organizationId: 'org_abc',
  riskLevel: 'critical',
  riskScore: 92
});
```

### Example 3: Batch Processing

```typescript
import { batchChurnPrediction } from '@/lib/aurora-api';

const customers = [
  { customerId: 'cust1', organizationId: 'org1', customerData: {...} },
  { customerId: 'cust2', organizationId: 'org1', customerData: {...} },
  // ... up to 100 customers
];

const predictions = await batchChurnPrediction(customers);

predictions.forEach(pred => {
  if (pred.prediction.churnRisk >= 50) {
    console.log(`High risk: ${pred.customerId} - ${pred.prediction.churnRisk}%`);
  }
});
```

### Example 4: Using the Helper Function

```typescript
import { collectCustomerMetrics, sendChurnPrediction } from '@/lib/aurora-api';

// Automatically calculate metrics from your data
const metrics = collectCustomerMetrics(customer, supportData, usageData);

const prediction = await sendChurnPrediction({
  customerId: customer.id,
  organizationId: customer.organizationId,
  customerData: metrics
});
```

## Risk Levels

| Score | Level | Action Required |
|-------|-------|-----------------|
| 0-29 | Low | Normal monitoring |
| 30-49 | Medium | Increase monitoring, consider outreach |
| 50-74 | High | Immediate outreach required |
| 75-100 | Critical | Executive intervention needed |

## Webhook Events

The integration sends webhook events to Aurora for real-time notifications:

- `churn_alert` - High-risk customer detected
- `usage_spike` - Unusual usage pattern detected
- `support_escalation` - Support ticket escalated
- `batch_prediction_complete` - Batch processing finished

## Customer Metrics

The `collectCustomerMetrics` helper automatically calculates:

| Metric | Description | Calculation |
|--------|-------------|-------------|
| `loginFrequency` | 0-1 ratio | Based on days since last login |
| `supportTickets` | Count | Tickets in last 30 days |
| `usageDecline` | Percentage | Previous vs current usage |
| `paymentIssues` | Boolean | From customer record |
| `complaints` | Count | Formal complaints logged |
| `accountValue` | Number | ARR or MRR |
| `tenure` | Days | Days since signup |

## Testing

### Test Connection

```bash
curl http://localhost:3000/api/aurora/predict
```

### Test Single Prediction

```bash
curl -X POST http://localhost:3000/api/aurora/predict \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "test_123",
    "organizationId": "org_test",
    "customer": {
      "id": "test_123",
      "email": "test@example.com",
      "plan": "pro"
    },
    "supportData": [],
    "usageData": {
      "current": 100,
      "previous": 150
    }
  }'
```

### Test Batch Processing

```bash
curl -X POST http://localhost:3000/api/aurora/batch \
  -H "Content-Type: application/json" \
  -d '{
    "customers": [
      {
        "customerId": "test1",
        "organizationId": "org1",
        "customerData": {
          "loginFrequency": 0.8,
          "supportTickets": 2,
          "usageDecline": 10,
          "paymentIssues": false,
          "complaints": 0
        }
      },
      {
        "customerId": "test2",
        "organizationId": "org1",
        "customerData": {
          "loginFrequency": 0.2,
          "supportTickets": 15,
          "usageDecline": 60,
          "paymentIssues": true,
          "complaints": 4
        }
      }
    ]
  }'
```

## Files

- `lib/aurora-api.ts` - Main API client with helper functions
- `app/api/aurora/predict/route.ts` - Single customer prediction endpoint
- `app/api/aurora/batch/route.ts` - Batch processing endpoint

## Troubleshooting

**Connection Failed**: Ensure Aurora is running on configured port
```bash
# Check Aurora health
curl http://localhost:3000/api/health
```

**Unauthorized**: Verify API key in environment variables
```bash
echo $AURORA_API_KEY
```

**Timeout**: Increase `AI_TIMEOUT_MS` in `.env` if processing large batches

## Security

- API key authentication (configure `AURORA_API_KEY`)
- Webhook signature verification (configure `WEBHOOK_SECRET`)
- All requests require authentication via Clerk
- Rate limiting applied to prevent abuse

## Next Steps

1. Configure production Aurora API URL
2. Set up API key authentication
3. Configure webhook signature verification
4. Add monitoring for failed predictions
5. Set up alerts for high-risk customers
6. Integrate with CRM for automatic task creation
