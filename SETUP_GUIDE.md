# Support Intelligence - Setup Guide

Complete guide to set up and deploy your Support Intelligence SaaS.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Stripe account
- Anthropic API key
- (Optional) Zendesk account for testing

## Step 1: Database Setup

1. **Install PostgreSQL** (if not already installed):
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt-get install postgresql
```

2. **Create the database**:
```bash
createdb support_intelligence
```

3. **Update `.env` file**:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/support_intelligence
```

4. **Run migrations**:
```bash
npm install
npm run build
npm run migrate
```

## Step 2: Stripe Setup

### Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Switch to **Test Mode** (toggle in top right)

### Create Product and Price

1. Go to **Products** → **Add Product**
2. Name: "Support Intelligence Pro"
3. Description: "AI-powered support ticket analysis"
4. Price: $249/month (recurring)
5. Click **Save product**
6. Copy the **Price ID** (starts with `price_`)

### Get API Keys

1. Go to **Developers** → **API keys**
2. Copy **Secret key** (starts with `sk_test_`)
3. Copy **Publishable key** (starts with `pk_test_`)

### Setup Webhooks (For Production)

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-api-domain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** (starts with `whsec_`)

### Update `.env` File

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_your_actual_key_here
STRIPE_PRICE_ID=price_your_actual_price_id_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here  # For production only
```

## Step 3: Start the Application

### Install Dependencies

```bash
# Backend dependencies
npm install

# Frontend dependencies
cd web
npm install
cd ..
```

### Build Backend

```bash
npm run build
```

### Start Services

**Option A: Run in separate terminals**

Terminal 1 - Backend API:
```bash
npm run api
```

Terminal 2 - Frontend:
```bash
cd web
npm run dev
```

**Option B: Use a process manager**

Install PM2:
```bash
npm install -g pm2
```

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'api',
      script: 'dist/api/server.js',
      env: {
        NODE_ENV: 'production',
        API_PORT: 3001
      }
    },
    {
      name: 'scheduler',
      script: 'dist/scheduler/index.js',
      env: {
        NODE_ENV: 'production',
        ENABLE_SCHEDULER: 'true'
      }
    }
  ]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
```

## Step 4: Test the Application

1. **Open frontend**: http://localhost:3000
2. **Upload a test CSV** with format:
   ```csv
   customer_id,subject,message
   user123,Login issue,I can't log in to my account
   user456,Feature request,Would love dark mode
   user789,Billing problem,I was charged twice
   ```
3. **Check analysis**: Go to dashboard and view analyzed tickets
4. **Test Stripe**: Go to Settings → Click "Start 7-Day Free Trial"
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC

## Step 5: Zendesk Integration (Optional)

1. **Get Zendesk API Token**:
   - Log in to your Zendesk account
   - Go to Admin Center (gear icon)
   - Navigate to Apps and integrations → APIs → Zendesk API
   - Click "Settings" tab
   - Enable "Token Access"
   - Click "Add API Token"
   - Copy the token

2. **Configure in Settings**:
   - Go to Settings page
   - Enter your subdomain (e.g., "yourcompany" from yourcompany.zendesk.com)
   - Enter your email
   - Paste API token
   - Click "Save Zendesk Settings"
   - Click "Sync Tickets Now" to test

## Step 6: Email Alerts Setup (Optional)

For MVP, email alerts are logged to console. To enable real emails:

### Option A: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Update `src/services/email-alerts.ts`:

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

async function sendEmail(config: EmailConfig): Promise<void> {
  await sgMail.send({
    to: config.to,
    from: 'alerts@yourdomain.com', // Must be verified in SendGrid
    subject: config.subject,
    html: config.html,
  });
}
```

4. Add to `.env`:
```bash
SENDGRID_API_KEY=your_sendgrid_api_key
ALERT_EMAIL=your-email@example.com
```

### Option B: Resend

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Install: `npm install resend`
4. Update email service similarly

## Deployment

### Deploy Backend (Render.com)

1. **Create account** at [render.com](https://render.com)

2. **Create PostgreSQL database**:
   - Click "New" → "PostgreSQL"
   - Name: support-intelligence-db
   - Copy **Internal Database URL**

3. **Create Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - Name: support-intelligence-api
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/api/server.js`
   - Add environment variables:
     ```
     DATABASE_URL=<your internal database URL>
     ANTHROPIC_API_KEY=<your key>
     STRIPE_SECRET_KEY=<your key>
     STRIPE_PRICE_ID=<your price ID>
     STRIPE_WEBHOOK_SECRET=<your webhook secret>
     API_PORT=3001
     NODE_ENV=production
     ```

4. **Create Background Worker** (for scheduler):
   - Click "New" → "Background Worker"
   - Same repo
   - Start Command: `node dist/scheduler/index.js`
   - Add same environment variables plus:
     ```
     ENABLE_SCHEDULER=true
     ```

### Deploy Frontend (Vercel)

1. **Create account** at [vercel.com](https://vercel.com)

2. **Import project**:
   - Click "New Project"
   - Import your GitHub repo
   - Root Directory: `web`
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add environment variables**:
   ```
   NEXT_PUBLIC_API_URL=https://your-render-api-url.onrender.com
   ```

4. **Update API URLs** in frontend:
   - Replace all instances of `http://localhost:3001` with `process.env.NEXT_PUBLIC_API_URL`

5. **Deploy**: Click "Deploy"

### Update Stripe Webhook

Once deployed, update your Stripe webhook endpoint to use your production URL:
- Go to Stripe Dashboard → Webhooks
- Update endpoint URL to: `https://your-api-url.onrender.com/api/stripe/webhook`

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql postgresql://postgres:postgres@localhost:5432/support_intelligence
```

### Stripe Webhook Testing

Use Stripe CLI for local testing:
```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

### Migration Issues

If migrations fail, check:
1. Database exists
2. Connection URL is correct
3. User has permissions

Reset migrations (CAUTION: Deletes all data):
```bash
psql support_intelligence
DROP TABLE IF EXISTS schema_migrations CASCADE;
# Then run migrations again
npm run migrate
```

## Production Checklist

Before launching:

- [ ] Switch Stripe to live mode
- [ ] Update all Stripe keys in `.env`
- [ ] Set up real email service (SendGrid/Resend)
- [ ] Configure custom domain
- [ ] Enable HTTPS everywhere
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Test full user flow
- [ ] Backup database strategy
- [ ] Set up analytics (PostHog, Mixpanel)

## Support

For issues or questions:
- Check logs: `pm2 logs` (if using PM2)
- Check database: `psql support_intelligence`
- Review Stripe dashboard for payment issues
- Check Anthropic API usage limits

## Next Steps

1. Test with real Zendesk data
2. Customize email templates
3. Add more features based on user feedback
4. Launch on Reddit (r/SaaS)
