# Deployment Checklist - Support Intelligence

This checklist covers everything needed to deploy Support Intelligence to production.

---

## Phase 1: Pre-Deployment (Complete Before Deploying)

### 1.1 Security Hardening

- [ ] **Rotate Anthropic API Key**
  - Go to: https://console.anthropic.com/settings/keys
  - Create new key
  - Update `.env.production` with new key
  - Delete old key

- [ ] **Rotate Stripe Keys**
  - Go to: https://dashboard.stripe.com/apikeys
  - Use live mode keys (sk_live_..., whsec_...)
  - Update `.env.production`

- [ ] **Rotate Resend API Key**
  - Go to: https://resend.com/api-keys
  - Create production API key
  - Update `.env.production`

- [ ] **Verify .env is not in git**
  ```bash
  git ls-files | grep .env
  # Should return nothing
  ```

### 1.2 Environment Configuration

- [ ] **Copy production template**
  ```bash
  cp .env.production .env
  ```

- [ ] **Fill in all required values in .env:**
  - [ ] `ANTHROPIC_API_KEY` (with credits)
  - [ ] `STRIPE_SECRET_KEY` (live mode)
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `STRIPE_PRICE_ID`
  - [ ] `RESEND_API_KEY`
  - [ ] `EMAIL_FROM`
  - [ ] `SUPPORT_API_URL`
  - [ ] `SUPPORT_API_KEY`
  - [ ] `CORS_ORIGINS` (your domain)
  - [ ] `LOG_LEVEL=info`

### 1.3 Support Platform Integration

- [ ] **Choose your platform:**
  - [ ] Zendesk
  - [ ] Freshdesk
  - [ ] Intercom
  - [ ] Custom API

- [ ] **Update `src/services/ingestion.ts`**
  - Uncomment the appropriate integration function
  - Update API URL and credentials
  - Test with staging data

### 1.4 Database Setup

- [ ] **Ensure PostgreSQL 15 is running**
  ```bash
  docker ps | grep postgres
  ```

- [ ] **Run migrations**
  ```bash
  npm run migrate
  ```

- [ ] **Verify tables exist**
  ```bash
  docker exec -it support-intelligence-db psql -U postgres -d support_intelligence -c "\\dt"
  ```

---

## Phase 2: Build & Test

### 2.1 Build Application

- [ ] **Install dependencies**
  ```bash
  npm ci
  ```

- [ ] **Build TypeScript**
  ```bash
  npm run build
  ```

- [ ] **Fix any build errors**
  ```bash
  npm run typecheck
  ```

### 2.2 Test Integration

- [ ] **Test API connection**
  ```bash
  npm run api &
  curl http://localhost:3000/health
  # Should return: {"status":"ok"}
  ```

- [ ] **Test ticket ingestion**
  ```bash
  npm run ingest <organization_id>
  ```

- [ ] **Test AI analysis**
  ```bash
  npm run analyze <organization_id>
  ```

- [ ] **Test report generation**
  ```bash
  npm run report <organization_id>
  ```

---

## Phase 3: Production Deployment

### 3.1 Docker Deployment (Recommended)

- [ ] **Stop development services**
  ```bash
  docker-compose down
  ```

- [ ] **Update docker-compose.yml if needed**
  - Set proper environment variables
  - Configure restart policy
  - Set up logging

- [ ] **Build and start production**
  ```bash
  docker-compose up -d --build
  ```

- [ ] **Verify services are running**
  ```bash
  docker-compose ps
  docker logs support-intelligence-app
  ```

### 3.2 Manual Deployment (Alternative)

- [ ] **Set up server (Ubuntu 20.04+)**
  ```bash
  # Install Node.js
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs

  # Install Docker
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh

  # Install PostgreSQL
  sudo apt-get install postgresql-15
  ```

- [ ] **Configure PostgreSQL**
  ```bash
  sudo -u postgres createdb support_intelligence
  psql -d support_intelligence -f migrations/001_initial_schema.sql
  ```

- [ ] **Deploy application**
  ```bash
  git clone <your-repo>
  cd support-intelligence
  cp .env.production .env
  npm ci --production
  npm run build
  npm start
  ```

- [ ] **Set up process manager (PM2)**
  ```bash
  sudo npm install -g pm2
  pm2 start npm --name "support-intelligence" -- run start
  pm2 startup
  pm2 save
  ```

### 3.3 Configure Reverse Proxy

- [ ] **Set up Nginx**
  ```bash
  sudo apt-get install nginx
  sudo nano /etc/nginx/sites-available/support-intelligence
  ```

  ```nginx
  server {
      listen 80;
      server_name yourdomain.com;
      return 301 https://$server_name$request_uri;
  }

  server {
      listen 443 ssl;
      server_name yourdomain.com;

      ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
      ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

      location / {
          proxy_pass http://localhost:3000;
          proxy_http_version 1.1;
          proxy_set_header Upgrade $http_upgrade;
          proxy_set_header Connection 'upgrade';
          proxy_set_header Host $host;
          proxy_cache_bypass $http_upgrade;
      }
  }
  ```

  ```bash
  sudo ln -s /etc/nginx/sites-available/support-intelligence /etc/nginx/sites-enabled/
  sudo nginx -t
  sudo systemctl reload nginx
  ```

- [ ] **Set up SSL with Let's Encrypt**
  ```bash
  sudo apt-get install certbot python3-certbot-nginx
  sudo certbot --nginx -d yourdomain.com
  ```

---

## Phase 4: Post-Deployment Verification

### 4.1 Health Checks

- [ ] **API health check**
  ```bash
  curl https://yourdomain.com/health
  ```

- [ ] **Database connectivity**
  ```bash
  curl https://yourdomain.com/api/health/db
  ```

- [ ] **Scheduler status**
  ```bash
  curl https://yourdomain.com/api/health/scheduler
  ```

### 4.2 Functional Tests

- [ ] **Create test organization**
  ```sql
  INSERT INTO organizations (name, external_api_url, external_api_key)
  VALUES ('Test Org', 'https://api.example.com', 'test_key')
  RETURNING id;
  ```

- [ ] **Run ingestion for test org**
  ```bash
  npm run ingest <org_id>
  ```

- [ ] **Run analysis for test org**
  ```bash
  npm run analyze <org_id>
  ```

- [ ] **Generate report for test org**
  ```bash
  npm run report <org_id>
  ```

### 4.3 Monitoring Setup

- [ ] **Set up logging**
  - Configure log aggregation (Datadog, CloudWatch, etc.)
  - Set up alerts for errors

- [ ] **Set up uptime monitoring**
  - Use: UptimeRobot, Pingdom, or similar
  - Monitor: https://yourdomain.com/health

- [ ] **Configure error tracking**
  - Sentry or similar for TypeScript errors

---

## Phase 5: Stripe Webhook Setup

### 5.1 Configure Webhook

- [ ] **Go to Stripe Dashboard**
  - https://dashboard.stripe.com/webhooks

- [ ] **Add endpoint**
  - URL: https://yourdomain.com/api/stripe/webhook
  - Events:
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.paid`
    - `invoice.payment_failed`

- [ ] **Copy webhook signing secret**
  - Add to `.env` as `STRIPE_WEBHOOK_SECRET`

### 5.2 Test Webhook

- [ ] **Use Stripe CLI for testing**
  ```bash
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  ```

---

## Rollback Plan

If something goes wrong:

### Docker Deployment
```bash
docker-compose down
docker-compose up -d postgres
# Fix issue
docker-compose up -d --build app
```

### Manual Deployment
```bash
pm2 stop all
pm2 restart support-intelligence
# Or rollback to previous version
git checkout <previous-version>
npm ci
npm run build
pm2 restart support-intelligence
```

---

## Quick Reference Commands

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Restart app only
docker-compose restart app

# Run migrations
npm run migrate

# Check database
docker exec -it support-intelligence-db psql -U postgres -d support_intelligence
```

---

**Deployment Date:** ________________
**Version:** ________________
**Deployed by:** ________________
