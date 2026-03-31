# Clerk → Supabase Migration: Quick Start Guide

## 🚀 Quick Start (5 Steps)

### 1. Create Supabase Project
- Go to https://supabase.com
- Create project: "support-intel"
- Copy credentials (URL, anon key, service role key)

### 2. Update Environment Variables
```bash
# Add to .env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
```

### 3. Push Database Schema
```bash
npx prisma db push
npx prisma generate
```

### 4. Set Up RLS (Security)
- Open Supabase Dashboard → SQL Editor
- Run the SQL from `prisma/rls_policies.sql`

### 5. Test It
```bash
npm run dev
# Visit http://localhost:3000/sign-up
```

## 📚 Full Documentation
- **Detailed Setup:** `SUPABASE_SETUP.md`
- **Migration Summary:** `MIGRATION_SUMMARY.md`

## 🔑 Key Files Reference

| File | Purpose |
|------|---------|
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | Server Supabase client |
| `lib/supabase/auth-api.ts` | API route auth helper |
| `app/sign-in/page.tsx` | Custom sign-in page |
| `app/sign-up/page.tsx` | Custom sign-up page |
| `middleware.ts` | Route protection |

## 🔄 Common Tasks

### Get Authenticated User in API Routes
```typescript
import { getAuthenticatedUser } from "@/lib/supabase/auth-api"

export async function GET(req: NextRequest) {
  const { userId, response } = await getAuthenticatedUser()
  if (response) return response

  // userId is available here
}
```

### Get Authenticated User in Client Components
```typescript
import { useUserProfile } from "@/lib/hooks/use-user-profile"

export default function MyComponent() {
  const { user, loading } = useUserProfile()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>

  return <div>Welcome {user.email}</div>
}
```

### Check User Session in Server Components
```typescript
import { createClient } from "@/lib/supabase/server"

export default async function ServerComponent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please sign in</div>
  }

  return <div>Welcome {user.email}</div>
}
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Unauthorized" errors | Check env vars, verify Supabase URL |
| Database connection fails | Verify DATABASE_URL, check password |
| OAuth not working | Check redirect URLs in provider console |
| Can't access data | Run RLS policies in SQL Editor |

## ✅ Testing Checklist

- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign out works
- [ ] Protected routes redirect when logged out
- [ ] API routes enforce authentication
- [ ] Can't access other orgs' data (RLS)

## 📞 Need Help?

1. Check `SUPABASE_SETUP.md` for detailed instructions
2. View Supabase Dashboard → Logs
3. Read [Supabase Docs](https://supabase.com/docs)
