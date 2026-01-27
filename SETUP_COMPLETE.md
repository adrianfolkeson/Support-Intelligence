# Support Intelligence - Setup Klar! ✅

## Vad jag har gjort:

### 1. ✅ Installerade Dependencies
- Installerade 181 npm-paket
- Byggde TypeScript-koden
- Inga fel!

### 2. ✅ Startade PostgreSQL
- Docker container igång
- Database: support_intelligence
- Port: 5432
- Status: Healthy

### 3. ✅ Körde Migrations
- Skapade alla tabeller:
  - organizations
  - support_tickets
  - ticket_analysis
  - weekly_reports
  - schema_migrations

### 4. ✅ Skapade Testdata
- Organisation: Test Company
- ID: `ce0864de-6d0c-4b2a-8b3d-7dcb9c712458`
- 3 test-tickets skapade

### 5. ✅ Testade Systemet
- API connection: Funkar
- Database queries: Funkar
- Claude AI: Behöver API-credits

## 📊 Din Organisation

**ID**: `ce0864de-6d0c-4b2a-8b3d-7dcb9c712458`
**Namn**: Test Company
**Tickets**: 3 st

## 🚀 Hur du använder det:

### Starta API-servern:
```bash
cd /Users/adrianfolkeson/Projekt/support-intelligence
export PATH="/opt/homebrew/bin:$PATH"
npm run api
```
Sedan öppna: http://localhost:3000/health

### Köra AI-analys:
```bash
export PATH="/opt/homebrew/bin:$PATH"
npm run analyze ce0864de-6d0c-4b2a-8b3d-7dcb9c712458
```

### Generera rapport:
```bash
export PATH="/opt/homebrew/bin:$PATH"
npm run report ce0864de-6d0c-4b2a-8b3d-7dcb9c712458
```

### Starta scheduler (auto-körning):
```bash
export PATH="/opt/homebrew/bin:$PATH"
npm start
```

## 📝 Viktigt om Claude API

Din API-nyckel finns i `.env` men behöver credits för att fungera:
1. Gå till: https://console.anthropic.com/
2. Gå till Plans & Billing
3. Köp credits (startar från $5)

**Kostnad**: ~$1.50 per 1000 tickets

## 🗄️ Database Access

**Koppla till databasen**:
```bash
docker exec -it support-intelligence-db psql -U postgres -d support_intelligence
```

**Visa alla tickets**:
```sql
SELECT * FROM support_tickets;
```

**Visa organisationer**:
```sql
SELECT * FROM organizations;
```

**Avsluta**: Skriv `\q`

## 🐳 Docker Commands

**Stoppa database**:
```bash
docker-compose down
```

**Starta database**:
```bash
docker-compose up -d postgres
```

**Se status**:
```bash
docker ps
```

## 📚 API Endpoints

När API-servern kör (npm run api):

- `GET /health` - Status check
- `GET /api/organizations/:id/tickets` - Hämta tickets
- `GET /api/organizations/:id/dashboard` - Dashboard data
- `GET /api/organizations/:id/reports` - Alla rapporter
- `POST /api/organizations/:id/analyze` - Kör analys manuellt

Full dokumentation i README.md

## ✅ Allt som funkar:

- [x] Node.js installerat (v25.4.0)
- [x] Dependencies installerade
- [x] TypeScript kompilerat
- [x] PostgreSQL igång
- [x] Database migrations körda
- [x] Tabeller skapade
- [x] Test-organisation skapad
- [x] Test-tickets insatta
- [x] System testat

## ⚠️ Nästa steg:

1. **Lägg till Claude API credits** (om du vill använda AI-analys)
2. **Testa API-servern**: `npm run api`
3. **Koppla till din egentliga support-system** (redigera src/services/ingestion.ts)
4. **Bygg en frontend** (valfritt)
5. **Deploya till produktion** (se README.md)

## 🎯 Systemstatus

**Miljö**: Development
**Database**: PostgreSQL 15
**Node**: v25.4.0
**Port**: 3000
**Status**: Redo att köras!

---

**Allt är klart! 🎉**

För att börja använda systemet, kör bara:
```bash
cd /Users/adrianfolkeson/Projekt/support-intelligence
export PATH="/opt/homebrew/bin:$PATH"
npm run api
```
