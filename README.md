# Support Intelligence

AI-powered support ticket analysis for SaaS founders. Automatically ingests tickets, analyzes them with Claude, and generates executive summaries showing what's broken, what causes churn risk, and what to fix next.

## What This Product Does

**Support Intelligence** is a B2B micro-SaaS that helps founders understand what's happening in their support queue without manually reading every ticket.

### Core Features

1. **Automated Ticket Ingestion** - Fetches tickets from your support platform API daily
2. **AI Analysis** - Claude analyzes sentiment, frustration, churn risk, and extracts feature requests
3. **Weekly Executive Reports** - Get actionable insights: what's broken, who's at risk, what to build next
4. **REST API** - Query your data, trigger jobs manually, build dashboards
5. **Zero Maintenance** - Runs on autopilot via cron scheduler

### What You Get

Every Monday morning, you receive a report like this:

```
## Weekly Support Overview
Total tickets: 127
Average frustration level: 4.2/10
Average churn risk: 3.1/10

## ⚠️ Critical: 8 High Churn Risk Tickets
These customers need immediate attention.

## 🔥 What's Broken
- Login page not loading on Safari
- Payment processor timing out
- Dashboard shows wrong data after timezone change

## 📊 Top Issue Categories
- bug: 45 tickets
- feature_request: 32 tickets
- billing: 18 tickets

## 💡 Feature Requests
- Dark mode for dashboard
- CSV export for reports
- Slack integration

## ✅ Recommended Actions for Next Week
1. **Urgent:** Reach out to 8 at-risk customers personally
2. **Fix immediately:** Login page not loading on Safari
3. **Address:** bug (45 tickets)
4. **Consider:** Evaluate feasibility of "Dark mode for dashboard"
```

## Architecture

```
Cron Scheduler
    │
    ├─> Daily (2 AM): Ingest tickets → Analyze with Claude
    └─> Weekly (Mon 3 AM): Generate executive report
         │
         ↓
    PostgreSQL Database
         ↑
    REST API (Port 3000)
```

### Services

- **Ingestion Service**: Fetches tickets from external API, deduplicates, stores in PostgreSQL
- **Analysis Service**: Sends tickets to Claude in batches, extracts structured insights
- **Report Generator**: Aggregates weekly insights into executive summary
- **REST API**: CRUD operations, manual triggers, dashboard data
- **Scheduler**: Automates the pipeline (daily ingestion/analysis, weekly reports)

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Database**: PostgreSQL
- **AI**: Claude 3.5 Sonnet (Anthropic API)
- **Scheduler**: node-cron
- **API**: Express

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Anthropic API key ([get one here](https://console.anthropic.com/))
- Support ticket API access (e.g., Zendesk, Intercom, Help Scout)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env`:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/support_intelligence
ANTHROPIC_API_KEY=sk-ant-xxx
SUPPORT_API_URL=https://your-support-api.com/tickets
SUPPORT_API_KEY=your_api_key
PORT=3000
NODE_ENV=production
ENABLE_SCHEDULER=true
```

### 3. Create Database

```bash
createdb support_intelligence
```

### 4. Run Migrations

```bash
npm run build
npm run migrate
```

### 5. Add Your Organization

```bash
psql support_intelligence
```

```sql
INSERT INTO organizations (name, external_api_key, external_api_url)
VALUES ('Your Company', 'your_api_key', 'https://api.example.com/tickets')
RETURNING id;
```

**Save this organization ID** - you'll need it.

### 6. Test Ingestion

```bash
npm run build
node dist/services/ingestion.js <your_org_id>
```

### 7. Test Analysis

```bash
node dist/services/analysis.js <your_org_id>
```

### 8. Generate Test Report

```bash
node dist/services/report-generator.js <your_org_id>
```

### 9. Start the Full System

**Option A: Scheduler Only**

```bash
npm start
```

This runs the automated scheduler (daily ingestion/analysis at 2 AM, weekly reports on Monday at 3 AM).

**Option B: API Server + Scheduler**

Terminal 1:
```bash
npm run api
```

Terminal 2:
```bash
npm start
```

## API Endpoints

### Organizations

- `GET /api/organizations` - List all organizations
- `POST /api/organizations` - Create new organization
- `GET /api/organizations/:id` - Get organization details
- `GET /api/organizations/:id/dashboard` - Get dashboard metrics

### Tickets

- `GET /api/organizations/:id/tickets` - Get tickets (paginated)
- `GET /api/organizations/:id/churn-risk` - Get high churn risk tickets

### Reports

- `GET /api/organizations/:id/reports` - Get weekly reports
- `GET /api/reports/:reportId` - Get specific report

### Manual Triggers

- `POST /api/organizations/:id/ingest` - Trigger ingestion
- `POST /api/organizations/:id/analyze` - Trigger analysis
- `POST /api/organizations/:id/generate-report` - Generate report now

### Example: Get Churn Risk Tickets

```bash
curl http://localhost:3000/api/organizations/<org_id>/churn-risk
```

## Deployment

### Option 1: VPS (Recommended for New Owners)

**1. Provision a server** (DigitalOcean, Linode, Hetzner)
   - Ubuntu 22.04 LTS
   - 2 GB RAM minimum
   - Install PostgreSQL

**2. Set up the app**

```bash
# SSH into server
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs postgresql

# Clone/upload your code
cd /opt
# (upload code via scp, git clone, etc.)
cd support-intelligence

# Install dependencies
npm install

# Set up .env
cp .env.example .env
nano .env  # Add your credentials

# Run migrations
npm run build
npm run migrate

# Test it
npm run ingest <org_id>
npm run analyze <org_id>
```

**3. Set up systemd service**

Create `/etc/systemd/system/support-intelligence.service`:

```ini
[Unit]
Description=Support Intelligence
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/support-intelligence
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
systemctl daemon-reload
systemctl enable support-intelligence
systemctl start support-intelligence
systemctl status support-intelligence
```

**4. Optional: Set up API service**

Create `/etc/systemd/system/support-intelligence-api.service` (same as above, but `ExecStart=/usr/bin/npm run api`).

### Option 2: Docker

```bash
# Build image
docker build -t support-intelligence .

# Run container
docker run -d \
  --name support-intelligence \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e ANTHROPIC_API_KEY="..." \
  -e ENABLE_SCHEDULER=true \
  support-intelligence
```

### Option 3: Platform-as-a-Service

- **Railway**: Connect GitHub repo, set env vars, deploy
- **Fly.io**: `fly launch`, configure database, deploy
- **Heroku**: `heroku create`, add Postgres addon, push

## Configuration

### Scheduler Timing

Edit `src/scheduler/index.ts`:

```typescript
// Daily job at 2 AM
cron.schedule('0 2 * * *', async () => { ... });

// Weekly job Monday 3 AM
cron.schedule('0 3 * * 1', async () => { ... });
```

[Cron format](https://crontab.guru/): `minute hour day month weekday`

### Analysis Tuning

Edit `src/services/analysis.ts`:

- `BATCH_SIZE` - Tickets per API call (default: 10)
- `RATE_LIMIT_DELAY` - ms between calls (default: 1000)
- Claude model - Change `claude-3-5-sonnet-20241022` to `claude-3-opus-20240229` for deeper analysis

### Churn Risk Threshold

Edit `src/services/report-generator.ts`:

```typescript
// Default threshold: 7/10
WHERE ta.churn_risk >= 7
```

## Adapting to Your Support Platform

The ingestion service works with any REST API. Edit `src/services/ingestion.ts`:

### Example: Zendesk

```typescript
async function fetchTicketsFromAPI(apiUrl: string, apiKey: string, since?: Date) {
  const url = `https://yourcompany.zendesk.com/api/v2/tickets.json`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${Buffer.from(apiKey).toString('base64')}`,
    },
  });

  const data = await response.json();
  return data.tickets;
}
```

### Example: Intercom

```typescript
async function fetchTicketsFromAPI(apiUrl: string, apiKey: string, since?: Date) {
  const url = `https://api.intercom.io/conversations`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Intercom-Version': '2.10',
    },
  });

  const data = await response.json();
  return data.conversations;
}
```

Adjust the `normalizeTicket()` function to map your API's field names.

## Maintenance

### Database Backups

```bash
# Backup
pg_dump support_intelligence > backup.sql

# Restore
psql support_intelligence < backup.sql
```

### View Logs

```bash
# Systemd
journalctl -u support-intelligence -f

# Docker
docker logs -f support-intelligence
```

### Monitor Performance

```sql
-- Tickets ingested today
SELECT COUNT(*) FROM support_tickets
WHERE DATE(created_at) = CURRENT_DATE;

-- Unanalyzed tickets
SELECT COUNT(*) FROM support_tickets st
LEFT JOIN ticket_analysis ta ON st.id = ta.ticket_id
WHERE ta.id IS NULL;

-- High churn risk customers
SELECT customer_id, COUNT(*) as tickets
FROM support_tickets st
JOIN ticket_analysis ta ON st.id = ta.ticket_id
WHERE ta.churn_risk >= 7
GROUP BY customer_id
ORDER BY tickets DESC;
```

## Costs

### Per Organization (Monthly)

- **Claude API**: ~$5-30 (depends on ticket volume)
  - 10k tickets/month ≈ $15
  - First 1000 tickets = ~$1.50
- **Server**: $6-20 (DigitalOcean, Linode)
- **Database**: $0 (PostgreSQL included) or $7 (managed)

**Total: $11-50/month per organization**

### Pricing Suggestion for Resale

- **Starter**: $49/month (1 organization, 1k tickets/month)
- **Growth**: $149/month (5k tickets/month)
- **Scale**: $299/month (20k tickets/month)

Profit margin: 50-80% after API costs.

## Selling This SaaS

### What to Highlight

1. **Fully automated** - Set it and forget it
2. **Actionable insights** - Not just data, tells you what to do
3. **Saves time** - Founders don't read 100+ tickets/week
4. **Reduces churn** - Identifies at-risk customers early
5. **Simple setup** - 30 minutes to deploy

### Ideal Customers

- SaaS founders with 50+ support tickets/week
- B2B companies with high-touch support
- Subscription businesses focused on retention
- Agencies managing multiple clients

### Marketing Angles

- "Stop reading every support ticket"
- "Know which customers are about to churn"
- "Your weekly war room report, automated"

## Troubleshooting

### "No tickets ingested"

- Check `external_api_url` and `external_api_key` in database
- Test API manually: `curl -H "Authorization: Bearer YOUR_KEY" YOUR_API_URL`
- Check logs for API errors

### "Analysis not running"

- Verify `ANTHROPIC_API_KEY` is set
- Check Claude API quota: https://console.anthropic.com/
- Ensure unanalyzed tickets exist: `SELECT COUNT(*) FROM support_tickets st LEFT JOIN ticket_analysis ta ON st.id = ta.ticket_id WHERE ta.id IS NULL`

### "Weekly report is empty"

- Reports cover the previous week (Monday-Sunday)
- Run `npm run report <org_id>` manually to test
- Check if tickets exist in that date range

## Taking Over This Business

Congrats on acquiring Support Intelligence! Here's what you need to know:

### Day 1

1. **Change credentials** - Update `.env` with your Anthropic API key
2. **Review database** - `psql support_intelligence` and explore tables
3. **Test the pipeline** - Run ingestion, analysis, report manually
4. **Check cron jobs** - Verify scheduler is running

### Week 1

1. **Set up monitoring** - Use Uptime Robot or Pingdom for health checks
2. **Configure backups** - Automate PostgreSQL backups (daily)
3. **Review costs** - Check Anthropic API usage in console
4. **Onboard first customer** - Add their organization, test full flow

### Month 1

1. **Customize prompts** - Tune Claude analysis in `src/services/analysis.ts`
2. **Build simple dashboard** - React/Next.js frontend for reports (optional)
3. **Add integrations** - Zendesk, Intercom, Help Scout connectors
4. **Improve reports** - Add charts, PDF export, email delivery

### Growth

- **Multi-tenancy**: Already built - each organization is isolated
- **White-label**: Rebrand, custom domains per customer
- **Integrations**: Connect to Slack, email, webhooks
- **Self-serve**: Build signup flow, billing (Stripe), onboarding

## License

MIT - Do whatever you want with this code.

## Support

This product is sold as-is. For questions about the code, read through:

1. `src/services/` - Core business logic
2. `src/api/server.ts` - API endpoints
3. `src/scheduler/index.ts` - Automation
4. `migrations/001_initial_schema.sql` - Database schema

Good luck building your SaaS empire! 🚀
