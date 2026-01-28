# Manual Service Guide

How to validate demand by offering Support Intelligence as a manual service before building more features.

## The Process (Simple 4 Steps)

### Step 1: Find a Potential Customer

**Where to post:**
- Reddit: r/startups, r/SaaS, r/entrepreneur
- LinkedIn: Post on your feed
- Direct outreach: Email SaaS founders you know

**What to say:**
```
I built an AI that analyzes support tickets to predict which customers
are about to churn. Looking for 2 SaaS companies to try it FREE this week.

You send me 50-100 tickets (CSV export), I send back a detailed report
showing which customers are at highest risk and why.

Interested? DM me.
```

**Why this works:** Free + specific value + low effort for them

---

### Step 2: Get Their Tickets

When someone responds:

**Email them:**
```
Great! Here's what I need:

1. Export 50-100 recent support tickets as CSV
   (From Zendesk/Intercom/Freshdesk - usually under Reports > Export)

2. CSV should have 3 columns:
   - customer_id (or email)
   - subject
   - message

3. Send it via email or Dropbox link

I'll analyze them with AI and send you a full report within 24 hours
showing which customers are at churn risk and why.
```

---

### Step 3: Run the Analysis

When you receive their CSV file:

```bash
# 1. Import their tickets
cd /Users/adrianfolkeson/Projekt/support-intelligence
node scripts/import-customer-csv.js customer_tickets.csv "Acme Corp"

# This will output an organization ID like:
# Organization ID: abc-123-def-456

# 2. Run AI analysis
npm run analyze -- abc-123-def-456

# 3. Generate report
node scripts/generate-report.js abc-123-def-456 > acme_report.txt
```

**Time required:** 5-10 minutes total

---

### Step 4: Send Them the Report

**Email template:**
```
Subject: Your Support Intelligence Report - 87 tickets analyzed

Hi [Name],

I've finished analyzing your 87 support tickets. Here's what the AI found:

🚨 5 customers at HIGH RISK of churning (detailed below)
😤 12 customers showing frustration
📊 Average churn risk: 4.2/10

I've attached the full report with:
- Top 10 highest-risk customers (with evidence)
- Sentiment breakdown
- Category analysis
- Recommended actions

[Paste the key highlights from the report here]

---

This took me 5 minutes to run. If you'd like weekly reports
like this automatically, I'm offering it at $99/month.

Interested?

Best,
[Your name]
```

**Attach:** The full report text file or paste it in the email

---

## What You're Looking For

### ✅ **GOOD RESPONSE (Real demand)**
- "This is amazing! Can you do this weekly?"
- "How do I pay you?"
- "Can you analyze 500 more tickets?"

### ⚠️ **WEAK RESPONSE (No demand)**
- "Interesting, let me think about it"
- "Can you make it free for 3 months first?"
- No response after you send the report

---

## The Goal

**Get 2 people to pay $99-199/month** for you to do this manually.

Once you have 2 paying customers:
1. You're making $200-400/month
2. You know exactly what they value
3. You can NOW build the automated dashboard
4. You automate what you're doing manually
5. You scale to 10+ customers

**Why this is smart:**
- You're getting paid to validate demand
- You learn what features they actually need
- No wasted development time
- Real revenue before building more

---

## Pricing Strategy

**First 2 customers:** $99/month (easy yes)
**Next 3 customers:** $149/month (proven value)
**After 5 customers:** $249/month (full price)

**Service:** Weekly reports via email until you build the dashboard

---

## When to Build the Dashboard

Only build the automated dashboard when:
- ✅ You have 2+ paying customers
- ✅ They're renewing month 2
- ✅ You know exactly what they look at in the reports
- ✅ They're asking "can I see this in a dashboard?"

Until then, just run the scripts manually once a week.

---

## FAQ

**Q: What if they want daily reports?**
A: Charge $299/month or say weekly only for now

**Q: What if they want their own login?**
A: Say "building that next, for now I'll email reports"

**Q: What if they want Zendesk integration?**
A: Say "manual CSV for now, integration coming in v2"

**Q: What if no one responds to my posts?**
A: Try different subreddits, post on LinkedIn, or cold email 20 SaaS founders

**Q: How long should I do this manually?**
A: Until you have 2-3 paying customers for 2+ months

---

## Example Timeline

**Week 1:** Post on Reddit/LinkedIn, get 2-3 interested people
**Week 2:** Send them free reports, 1 says "I'll pay for weekly"
**Week 3:** Send invoice, get $99, deliver weekly report
**Week 4:** Find 1 more customer, now at $198 MRR
**Month 2:** Both customers renew, validated demand ✅
**Month 3:** Build automated dashboard to scale to 10+ customers

---

## Scripts You Have

1. **import-customer-csv.js** - Load their tickets into your database
2. **generate-report.js** - Create beautiful text report
3. **npm run analyze** - Run AI analysis (you already have this)

All scripts are in: `/Users/adrianfolkeson/Projekt/support-intelligence/scripts/`

---

## Ready to Start?

1. Write your Reddit/LinkedIn post
2. Wait for responses
3. Run the scripts when you get their CSV
4. Send the report
5. Ask if they want weekly reports

**You can do this TODAY.** No more coding needed to validate demand.
