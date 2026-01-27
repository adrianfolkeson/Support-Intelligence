# Setup Guide for Support Intelligence

## ✅ Project Status

**All code is complete and ready!** Your `.env` file has been created.

However, you need to install prerequisites before running the app:

## 📋 Prerequisites to Install

### 1. Node.js (Required)

You need Node.js 18+ to run this application.

**Install via Homebrew (Recommended for macOS):**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Verify
node --version  # Should be 18.x or higher
npm --version
```

**Or download from:** https://nodejs.org/

### 2. PostgreSQL (Required for Database)

**Option A: Install PostgreSQL locally**
```bash
# Install via Homebrew
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15

# Verify
psql --version
```

**Option B: Use Docker (easier, recommended)**
```bash
# Install Docker Desktop
# Download from: https://www.docker.com/products/docker-desktop

# Verify
docker --version
```

With Docker, you can skip PostgreSQL installation - just use `docker-compose up -d` later.

### 3. Anthropic API Key (Required for AI Analysis)

1. Go to https://console.anthropic.com/
2. Sign up / Log in
3. Navigate to "API Keys"
4. Create a new key
5. Copy it (starts with `sk-ant-...`)

## 🚀 Once Prerequisites Are Installed

### Step 1: Install Dependencies
```bash
cd /Users/adrianfolkeson/Projekt/support-intelligence
npm install
```

### Step 2: Configure Environment

Edit `.env` file (already created):
```bash
nano .env
```

Add your credentials:
```bash
# Required
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/support_intelligence
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Optional (for testing)
SUPPORT_API_URL=https://api.example.com/tickets
SUPPORT_API_KEY=your_support_api_key
PORT=3000
NODE_ENV=development
ENABLE_SCHEDULER=true
```

### Step 3: Set Up Database

**Option A: Using Local PostgreSQL**
```bash
# Create database
createdb support_intelligence

# Build TypeScript
npm run build

# Run migrations
npm run migrate
```

**Option B: Using Docker (easier)**
```bash
# Start PostgreSQL in Docker
docker-compose up -d postgres

# Wait 5 seconds for PostgreSQL to start
sleep 5

# Build TypeScript
npm run build

# Run migrations
npm run migrate
```

### Step 4: Add Test Organization

```bash
# Connect to database
psql support_intelligence

# Or if using Docker:
docker exec -it support-intelligence-db psql -U postgres -d support_intelligence
```

Run this SQL:
```sql
INSERT INTO organizations (name, external_api_key, external_api_url)
VALUES (
    'Test Company',
    'test_api_key_12345',
    'https://api.example.com/tickets'
)
RETURNING id;
```

**Save the returned ID** - you'll use it for testing.

### Step 5: Test the Services

Replace `<org_id>` with the ID from Step 4:

```bash
# Test ingestion
npm run ingest <org_id>

# Test AI analysis
npm run analyze <org_id>

# Test report generation
npm run report <org_id>
```

### Step 6: Start the Full System

**Option A: Scheduler Only**
```bash
npm start
```

**Option B: API Server + Scheduler**

Terminal 1:
```bash
npm run api
```

Terminal 2:
```bash
npm start
```

**Option C: Everything in Docker**
```bash
docker-compose up
```

## 🧪 Quick Test Without Support API

If you don't have a support API yet, you can manually insert test tickets:

```sql
-- Insert test tickets
INSERT INTO support_tickets (
    organization_id,
    external_ticket_id,
    customer_id,
    subject,
    message,
    status,
    priority,
    ticket_timestamp
) VALUES
(
    '<your_org_id>',
    'TICKET-001',
    'customer@example.com',
    'App is broken',
    'I cant log in to the app. Keep getting 500 errors. This is really frustrating!',
    'open',
    'high',
    NOW() - INTERVAL '2 days'
),
(
    '<your_org_id>',
    'TICKET-002',
    'user@company.com',
    'Feature request',
    'Would love to see dark mode added. Many of us work at night.',
    'open',
    'medium',
    NOW() - INTERVAL '1 day'
),
(
    '<your_org_id>',
    'TICKET-003',
    'angry@customer.com',
    'Billing issue',
    'You charged me twice! I am canceling my subscription if this isnt fixed TODAY.',
    'open',
    'urgent',
    NOW()
);
```

Then run analysis:
```bash
npm run analyze <org_id>
npm run report <org_id>
```

## 📊 View Results

Check the weekly report in database:
```sql
SELECT * FROM weekly_reports ORDER BY created_at DESC LIMIT 1;
```

Or use the API:
```bash
curl http://localhost:3000/api/organizations/<org_id>/reports
```

## 🐛 Troubleshooting

### "command not found: npm"
- Node.js is not installed or not in PATH
- Install Node.js via Homebrew or nodejs.org

### "database does not exist"
- Run `createdb support_intelligence`
- Or use Docker: `docker-compose up -d postgres`

### "ANTHROPIC_API_KEY not set"
- Edit `.env` and add your API key
- Get key from https://console.anthropic.com/

### "Cannot connect to database"
- Check PostgreSQL is running: `brew services list`
- Or check Docker: `docker ps`
- Verify DATABASE_URL in `.env` is correct

### "No such file or directory: dist/"
- You need to build first: `npm run build`

## 📖 Next Steps

Once everything is running:

1. **Customize for your support platform** - Edit `src/services/ingestion.ts`
2. **Tune AI analysis** - Edit prompts in `src/services/analysis.ts`
3. **Adjust scheduler timing** - Edit `src/scheduler/index.ts`
4. **Build a frontend** - Create React/Next.js dashboard
5. **Deploy to production** - See README.md for deployment guides

## 🆘 Need Help?

All documentation is in:
- `README.md` - Complete guide (setup, API, deployment)
- `PROJECT_OVERVIEW.md` - Technical architecture
- `SETUP.md` - This file (getting started)

---

**You're almost there!** Just install Node.js and PostgreSQL/Docker, then follow the steps above.
