# Support Intelligence - Frontend

Modern Next.js dashboard for Support Intelligence AI-powered ticket analysis.

## Getting Started

### 1. Install Dependencies

```bash
cd web
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
web/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard with ticket list
│   └── ticket/
│       └── [id]/
│           └── page.tsx      # Ticket detail page
├── components/
│   └── ui/                   # Shadcn UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── badge.tsx
└── lib/
    └── utils.ts              # Utility functions

```

## Features Implemented

✅ **Landing Page**
- Hero section with pricing
- Feature highlights
- Call-to-action

✅ **Dashboard**
- Ticket list with filters (All, High Risk, Frustrated)
- Stats cards (Total, High Risk, Avg Confidence)
- Sentiment and churn risk badges
- Click to view details

✅ **Ticket Detail Page**
- Risk assessment visualization
- Evidence-based AI insights
- Quality check (critique results)
- Categories and key issues
- Recommended actions

## What's Next

To complete the Pro plan features, you need to:

### 1. Connect to Backend API
Currently using mock data. Replace with actual API calls:

**Dashboard:** `app/dashboard/page.tsx` line 20
```typescript
// Replace mock data with:
const response = await fetch('/api/tickets');
const tickets = await response.json();
```

**Ticket Detail:** `app/ticket/[id]/page.tsx` line 39
```typescript
// Replace mock data with:
const response = await fetch(`/api/tickets/${params.id}`);
const ticket = await response.json();
```

### 2. Add Authentication (Clerk)
```bash
npm install @clerk/nextjs
```

Add Clerk provider to `app/layout.tsx` and protect routes.

### 3. CSV Upload
Create `app/dashboard/upload` page with file upload component.

### 4. Stripe Billing
```bash
npm install stripe @stripe/stripe-js
```

Add subscription management and payment flow.

### 5. Deploy to Vercel
```bash
npm install -g vercel
vercel
```

## Current State

- ✅ UI/UX fully designed
- ✅ Responsive layout
- ✅ Shadcn UI components
- ✅ TypeScript types
- ⏳ API integration (mock data)
- ⏳ Authentication
- ⏳ File upload
- ⏳ Billing

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn UI (Radix UI primitives)
- **Icons:** Lucide React (built into Shadcn)
- **Charts:** Recharts (for future analytics)

## Notes

- Backend API runs on port 3000
- Frontend dev server runs on port 3000 (uses proxy in next.config.js)
- For production, deploy frontend separately (Vercel) and update API base URL
# Deployment fre 30 jan. 2026 12:44:15 CET
# tors  5 feb. 2026 22:43:00 CET
