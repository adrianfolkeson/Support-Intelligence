# Installation Instructions - Manual Steps Required

## ⚠️ Why I Can't Install Automatically

Installing Node.js, PostgreSQL, and Homebrew requires **administrator privileges** that I don't have access to through automation. You'll need to run these commands yourself in your Terminal.

**Good news:** It takes about 5 minutes and I've prepared everything else!

---

## 🚀 3-Step Installation (Copy & Paste Each Block)

### Step 1: Install Homebrew (Package Manager)

Open **Terminal** and run:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**What will happen:**
- It will ask for your macOS password
- Press Enter when prompted
- Installation takes 2-3 minutes

After installation completes, run these two commands to add Homebrew to your PATH:

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

**Verify Homebrew is installed:**
```bash
brew --version
```

---

### Step 2: Install Node.js

```bash
brew install node
```

This installs Node.js 20+ and npm (takes 1-2 minutes).

**Verify Node.js is installed:**
```bash
node --version  # Should show v20.x.x or higher
npm --version   # Should show 10.x.x or higher
```

---

### Step 3: Install PostgreSQL with Docker (Easiest Option)

**Option A: Install Docker Desktop (Recommended - No PostgreSQL setup needed)**

1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Install it (drag to Applications folder)
3. Open Docker Desktop app
4. Wait for it to start (whale icon in menu bar)

**Verify Docker is running:**
```bash
docker --version
```

**Option B: Install PostgreSQL Directly (Alternative)**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Verify PostgreSQL:**
```bash
psql --version
```

---

## ✅ After Installation is Complete

Once Node.js and Docker/PostgreSQL are installed, continue with the setup:

### 1. Install Project Dependencies

```bash
cd /Users/adrianfolkeson/Projekt/support-intelligence
npm install
```

This will take 1-2 minutes and install all required packages.

---

### 2. Get Your Anthropic API Key

1. Go to: https://console.anthropic.com/
2. Sign up or log in
3. Click "API Keys" in the left sidebar
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-...`)

---

### 3. Configure Environment Variables

Edit the `.env` file (already created for you):

```bash
nano .env
```

Update these values:

```bash
# Required - Add your Claude API key here
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here

# If using Docker (default, recommended):
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/support_intelligence

# If using local PostgreSQL:
# DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/support_intelligence

# Optional - for connecting to your support ticket system later
SUPPORT_API_URL=https://api.example.com/tickets
SUPPORT_API_KEY=your_support_api_key

PORT=3000
NODE_ENV=development
ENABLE_SCHEDULER=true
```

Press `Ctrl+X`, then `Y`, then `Enter` to save.

---

### 4. Start Database

**If using Docker (recommended):**
```bash
docker-compose up -d
```

This starts PostgreSQL in a Docker container.

**If using local PostgreSQL:**
```bash
createdb support_intelligence
```

---

### 5. Build and Run Migrations

```bash
# Compile TypeScript to JavaScript
npm run build

# Create database tables
npm run migrate
```

You should see output like:
```
✓ Migration 001_initial_schema.sql completed
All migrations completed successfully
```

---

### 6. Add a Test Organization

Connect to the database:

**Using Docker:**
```bash
docker exec -it support-intelligence-db psql -U postgres -d support_intelligence
```

**Using local PostgreSQL:**
```bash
psql support_intelligence
```

Run this SQL command:
```sql
INSERT INTO organizations (name, external_api_key, external_api_url)
VALUES (
    'Test Company',
    'test_key_123',
    'https://api.example.com/tickets'
)
RETURNING id;
```

**Copy the ID that's returned** (you'll use it in the next step).

Type `\q` and press Enter to exit psql.

---

### 7. Insert Test Tickets

Let's create some sample tickets to test the AI analysis:

```bash
docker exec -it support-intelligence-db psql -U postgres -d support_intelligence
```

Replace `<ORG_ID_HERE>` with the ID from Step 6:

```sql
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
    '<ORG_ID_HERE>',
    'TICKET-001',
    'frustrated@customer.com',
    'App completely broken',
    'I have been trying to log in for 2 hours. Nothing works. Getting 500 errors everywhere. This is unacceptable! I need this fixed NOW or I am canceling my subscription.',
    'open',
    'urgent',
    NOW() - INTERVAL '3 days'
),
(
    '<ORG_ID_HERE>',
    'TICKET-002',
    'user@example.com',
    'Feature request: Dark mode',
    'Hey team, would love to see a dark mode option. I work late nights and the bright UI hurts my eyes. Thanks!',
    'open',
    'low',
    NOW() - INTERVAL '2 days'
),
(
    '<ORG_ID_HERE>',
    'TICKET-003',
    'billing@company.com',
    'Double charged',
    'You charged my credit card twice this month. I see two charges for $99 each. Please refund one immediately.',
    'open',
    'high',
    NOW() - INTERVAL '1 day'
),
(
    '<ORG_ID_HERE>',
    'TICKET-004',
    'happy@user.com',
    'Love the new update!',
    'Just wanted to say the new dashboard looks amazing. Great work team!',
    'open',
    'low',
    NOW()
),
(
    '<ORG_ID_HERE>',
    'TICKET-005',
    'churning@customer.com',
    'Canceling subscription',
    'Too many bugs. Too slow. Support does not respond. I am switching to your competitor.',
    'open',
    'urgent',
    NOW()
);
```

Type `\q` to exit.

---

### 8. Test AI Analysis

Replace `<ORG_ID>` with your organization ID:

```bash
# Analyze the tickets with Claude
npm run analyze <ORG_ID>
```

You should see output showing each ticket being analyzed. This will take about 10-15 seconds.

---

### 9. Generate Test Report

```bash
npm run report <ORG_ID>
```

You'll see a beautiful markdown report showing:
- Total tickets
- High churn risk customers
- What's broken
- Feature requests
- Recommended actions

---

### 10. View Results

**Check the database:**
```bash
docker exec -it support-intelligence-db psql -U postgres -d support_intelligence -c "SELECT * FROM ticket_analysis;"
```

**Or start the API and query it:**
```bash
# Terminal 1: Start API server
npm run api

# Terminal 2: Query the API
curl http://localhost:3000/api/organizations/<ORG_ID>/dashboard
```

---

### 11. Start Full System

To run the automated scheduler (daily ingestion + analysis, weekly reports):

```bash
npm start
```

Or to run everything in Docker:

```bash
docker-compose up
```

---

## 🎉 You're Done!

The system is now:
- ✅ Analyzing support tickets with AI
- ✅ Detecting churn risk
- ✅ Extracting feature requests
- ✅ Generating weekly executive reports

### What Happens Next

The scheduler will automatically:
- **Daily at 2 AM**: Ingest new tickets and analyze them
- **Monday at 3 AM**: Generate weekly executive report

---

## 🔧 Customization

Now that it's running, you can:

1. **Connect to your real support API** - Edit `src/services/ingestion.ts`
2. **Tune the AI analysis** - Edit prompts in `src/services/analysis.ts`
3. **Change scheduler timing** - Edit `src/scheduler/index.ts`
4. **Build a dashboard** - Create React/Next.js frontend
5. **Deploy to production** - See README.md for deployment guides

---

## 🐛 Common Issues

### "Cannot find module..."
```bash
npm install
npm run build
```

### "database does not exist"
```bash
docker-compose up -d
# Wait 5 seconds
npm run migrate
```

### "ANTHROPIC_API_KEY not set"
- Edit `.env` and add your API key from console.anthropic.com

### "Connection refused to localhost:5432"
- Start Docker: `docker-compose up -d`
- Or start PostgreSQL: `brew services start postgresql@15`

---

## 📚 Documentation

- **README.md** - Complete guide (API reference, deployment, etc.)
- **PROJECT_OVERVIEW.md** - Technical architecture
- **SETUP.md** - Getting started guide

---

## ⏱️ Time Required

- **Installation**: 5-7 minutes (one-time)
- **Setup**: 3-5 minutes
- **Testing**: 2 minutes
- **Total**: ~15 minutes to fully operational

---

Ready to deploy a SaaS in under 15 minutes? Let's go! 🚀
