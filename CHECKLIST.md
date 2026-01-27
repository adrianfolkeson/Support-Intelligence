# Setup Checklist for Support Intelligence

Copy this checklist and check off items as you complete them.

---

## Prerequisites (One-time setup)

- [ ] **Install Homebrew**
  ```bash
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  ```

- [ ] **Add Homebrew to PATH** (after installation)
  ```bash
  echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
  eval "$(/opt/homebrew/bin/brew shellenv)"
  ```

- [ ] **Install Node.js**
  ```bash
  brew install node
  ```
  Verify: `node --version` should show v20.x.x+

- [ ] **Install Docker Desktop**
  - Download: https://www.docker.com/products/docker-desktop
  - Install and start Docker Desktop app

- [ ] **Get Anthropic API Key**
  - Sign up: https://console.anthropic.com/
  - Create API key
  - Copy key (starts with `sk-ant-...`)

---

## Project Setup

- [ ] **Edit .env file**
  ```bash
  cd /Users/adrianfolkeson/Projekt/support-intelligence
  nano .env
  ```
  Add your `ANTHROPIC_API_KEY=sk-ant-...`

- [ ] **Run quick start script**
  ```bash
  ./QUICK_START.sh
  ```
  This installs dependencies, builds code, starts database, runs migrations

---

## Create Test Organization

- [ ] **Connect to database**
  ```bash
  docker exec -it support-intelligence-db psql -U postgres -d support_intelligence
  ```

- [ ] **Insert organization**
  ```sql
  INSERT INTO organizations (name, external_api_key, external_api_url)
  VALUES ('Test Company', 'test_key', 'https://api.example.com/tickets')
  RETURNING id;
  ```
  **Write down the ID:** _______________

- [ ] **Exit database**
  ```
  \q
  ```

---

## Add Test Data

- [ ] **Connect to database again**
  ```bash
  docker exec -it support-intelligence-db psql -U postgres -d support_intelligence
  ```

- [ ] **Insert test tickets**
  (Copy from INSTALL_INSTRUCTIONS.md Step 7, replace `<ORG_ID_HERE>` with your ID)

- [ ] **Exit database**
  ```
  \q
  ```

---

## Test the System

- [ ] **Run AI analysis**
  ```bash
  npm run analyze <YOUR_ORG_ID>
  ```
  Should see: "Analysis complete. Total tickets analyzed: 5"

- [ ] **Generate report**
  ```bash
  npm run report <YOUR_ORG_ID>
  ```
  Should see: Weekly report with insights and recommendations

- [ ] **Start API server** (optional)
  ```bash
  npm run api
  ```
  Visit: http://localhost:3000/health

- [ ] **Query API** (in new terminal)
  ```bash
  curl http://localhost:3000/api/organizations/<YOUR_ORG_ID>/dashboard
  ```

---

## Start Production System

- [ ] **Start scheduler**
  ```bash
  npm start
  ```
  Or run everything in Docker:
  ```bash
  docker-compose up
  ```

---

## Verify It's Working

- [ ] Scheduler is running (check terminal output)
- [ ] Database has tickets:
  ```bash
  docker exec -it support-intelligence-db psql -U postgres -d support_intelligence -c "SELECT COUNT(*) FROM support_tickets;"
  ```
- [ ] Analysis results exist:
  ```bash
  docker exec -it support-intelligence-db psql -U postgres -d support_intelligence -c "SELECT COUNT(*) FROM ticket_analysis;"
  ```
- [ ] Reports generated:
  ```bash
  docker exec -it support-intelligence-db psql -U postgres -d support_intelligence -c "SELECT * FROM weekly_reports ORDER BY created_at DESC LIMIT 1;"
  ```

---

## Next Steps

- [ ] Customize ingestion for your support platform (edit `src/services/ingestion.ts`)
- [ ] Tune AI analysis prompts (edit `src/services/analysis.ts`)
- [ ] Adjust scheduler timing (edit `src/scheduler/index.ts`)
- [ ] Build frontend dashboard (React/Next.js)
- [ ] Deploy to production (see README.md)

---

## Troubleshooting

If something doesn't work:

1. **Check logs**: Look at terminal output for errors
2. **Verify database**: `docker ps` should show PostgreSQL running
3. **Check .env**: Make sure ANTHROPIC_API_KEY is set
4. **Rebuild**: `npm run build` then retry
5. **Restart Docker**: `docker-compose down && docker-compose up -d`

---

## Time Estimate

- ✓ Prerequisites: 5-7 minutes (one-time)
- ✓ Project setup: 3 minutes
- ✓ Test data: 2 minutes
- ✓ Testing: 2 minutes
- **Total: ~15 minutes**

---

## Documentation References

- **INSTALL_INSTRUCTIONS.md** - Detailed step-by-step guide
- **QUICK_START.sh** - Automated setup script
- **README.md** - Complete documentation
- **PROJECT_OVERVIEW.md** - Technical architecture

---

✅ = Completed
⏳ = In progress
❌ = Blocked/needs attention

Good luck! 🚀
