# Migration Testing Checklist

Use this checklist to verify the Clerk → Supabase migration is working correctly.

## Pre-Setup Verification ✅

- [ ] Supabase project created
- [ ] Environment variables configured (.env)
- [ ] Database connection verified (can connect via Prisma)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] RLS policies applied (ran `prisma/rls_policies.sql` in Supabase SQL Editor)

## Authentication Tests 🔐

### Email/Password Sign Up
- [ ] Navigate to `/sign-up`
- [ ] Fill out form (name, email, password)
- [ ] Submit form
- [ ] If email confirmation enabled: receive email and click link
- [ ] If email confirmation disabled: redirect to pricing/dashboard
- [ ] User created in `auth.users` (check Supabase Dashboard)
- [ ] User profile created in `user_profile` table

### Email/Password Sign In
- [ ] Navigate to `/sign-in`
- [ ] Enter email and password
- [ ] Submit form
- [ ] Redirect to `/dashboard`
- [ ] Session persists across page refresh
- [ ] Can access protected routes

### OAuth (Google/GitHub) - If Configured
- [ ] Click "Continue with Google" or "Continue with GitHub"
- [ ] Redirect to OAuth provider
- [ ] Authorize the app
- [ ] Redirect back to `/auth/callback`
- [ ] Redirect to `/dashboard`
- [ ] User profile created with OAuth data

### Sign Out
- [ ] Click sign out in navbar user menu
- [ ] Redirect to home page
- [ ] Can't access protected routes
- [ ] Session cleared (can't access /dashboard directly)

## Protected Route Tests 🛡️

### Middleware Protection
- [ ] Visit `/dashboard` while logged out → redirect to `/sign-in`
- [ ] Visit `/tickets` while logged out → redirect to `/sign-in`
- [ ] Visit `/reports` while logged out → redirect to `/sign-in`
- [ ] Visit `/settings` while logged out → redirect to `/sign-in`
- [ ] Visit `/admin` while logged out → redirect to `/sign-in`

### Post-Login Redirect
- [ ] Navigate to protected route while logged out
- [ ] Sign in
- [ ] Redirect to intended page (not just dashboard)

## API Route Tests 🌐

### Unauthenticated Access
- [ ] `GET /api/organizations` without auth → 401
- [ ] `GET /api/tickets` without auth → 401
- [ ] `POST /api/upload` without auth → 401

### Authenticated Access
- [ ] `GET /api/organizations` with auth → 200
- [ ] `POST /api/organizations` with auth → creates org
- [ ] `GET /api/tickets` with auth → returns tickets
- [ ] `POST /api/upload` with auth → uploads file

### Response Format
- [ ] Error responses include `{ error: "message" }`
- [ ] Success responses include expected data
- [ ] No clerkUserId in responses (should be supabaseUserId)

## Data Access Tests 🔒

### Organization Isolation (Critical!)
- [ ] Create organization as User A
- [ ] Sign in as User B
- [ ] User B cannot see User A's organization
- [ ] User B cannot access User A's tickets
- [ ] User B cannot access User A's reports
- [ ] API returns 403 or empty results

### RLS Policy Verification
1. In Supabase SQL Editor, run:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```
- [ ] All tables show `rowsecurity = true`

2. Check policies exist:
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```
- [ ] Multiple policies listed for each table

## UI Tests 🎨

### Navbar
- [ ] Shows "Sign In" and "Get Started" when logged out
- [ ] Shows user menu when logged in
- [ ] User menu displays user email/name
- [ ] Sign out button works
- [ ] Dashboard links appear when logged in

### Sign In Page
- [ ] Page loads without errors
- [ ] Email/password form works
- [ ] OAuth buttons display (if configured)
- [ ] Validation works (email format, password length)
- [ ] Error messages display correctly

### Sign Up Page
- [ ] Page loads without errors
- [ ] Form validation works
- [ ] Success message displays after signup
- [ ] Redirects correctly after signup

### Dashboard
- [ ] Loads without errors when authenticated
- [ ] Shows organization stats
- [ ] Displays charts/graphs
- [ ] Ticket list loads

## Edge Cases 🧪

### Session Expiry
- [ ] Let session expire (wait 1 hour or manually expire)
- [ ] Try to access protected route
- [ ] Redirect to sign-in
- [ ] Can re-authenticate successfully

### Concurrent Sessions
- [ ] Sign in on multiple browsers
- [ ] Changes in one browser reflect in another
- [ ] Sign out affects both browsers

### Password Reset (If Enabled)
- [ ] Request password reset
- [ ] Receive email with reset link
- [ ] Reset password works
- [ ] Can sign in with new password

### Email Confirmation (If Enabled)
- [ ] Can't sign in without confirming email
- [ ] Confirmation link works
- [ ] Resend confirmation email works

## Performance Tests ⚡

- [ ] Sign in loads in < 2 seconds
- [ ] Dashboard loads in < 3 seconds
- [ ] API responses < 500ms for simple queries
- [ ] No console errors
- [ ] No memory leaks (check browser dev tools)

## Browser Compatibility 🌐

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browser (iOS Safari)
- [ ] Mobile browser (Android Chrome)

## Error Handling 🚨

### Network Errors
- [ ] Sign in fails gracefully when offline
- [ ] API requests fail gracefully when offline
- [ ] Error messages are user-friendly

### Invalid Credentials
- [ ] Wrong email shows error
- [ ] Wrong password shows error
- [ ] Empty form shows validation errors

### Server Errors
- [ ] 500 errors show helpful message
- [ ] No raw stack traces exposed to users

## Security Verification 🔐

### Headers
- [ ] No sensitive data in localStorage
- [ ] Auth tokens stored securely (httpOnly cookies)
- [ ] CSRF protection working

### SQL Injection
- [ ] Try SQL injection in forms (should be blocked by Prisma)
- [ ] Try malicious payloads in API requests

### XSS Prevention
- [ ] Try XSS in user inputs
- [ ] HTML is properly escaped

## Data Migration Verification 📊

If migrating existing data:
- [ ] Old users migrated to `user_profile`
- [ ] `clerkUserId` → `supabaseUserId` mapping correct
- [ ] All foreign keys updated
- [ ] No orphaned records
- [ ] Data integrity maintained

## Rollback Test 🔄

(Optional but recommended)
- [ ] Document current Supabase state
- [ ] Test rollback procedure
- [ ] Verify can restore Clerk if needed
- [ ] Document rollback time

## Sign-Off ✍️

**Tester:** _______________
**Date:** _______________
**Environment:** [ ] Dev [ ] Staging [ ] Production

**Overall Status:**
- [ ] ✅ All tests passed
- [ ] ⚠️ Minor issues found (list below)
- [ ] ❌ Critical issues found (STOP deployment)

**Issues Found:**
1. ___________________________
2. ___________________________
3. ___________________________

**Recommendation:**
[ ] Ready for production
[ ] Needs fixes before production
[ ] Needs more testing

---

## Quick Test Script

```bash
# Run these commands to verify setup

# 1. Check environment variables
echo "Checking .env..."
grep -q "NEXT_PUBLIC_SUPABASE_URL" .env && echo "✅ Supabase URL set" || echo "❌ Missing Supabase URL"
grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env && echo "✅ Anon key set" || echo "❌ Missing anon key"
grep -q "SUPABASE_SERVICE_ROLE_KEY" .env && echo "✅ Service role key set" || echo "❌ Missing service role key"

# 2. Check Prisma
echo -e "\nChecking Prisma..."
npx prisma generate && echo "✅ Prisma client generated" || echo "❌ Prisma generation failed"

# 3. Check database connection
echo -e "\nChecking database..."
npx prisma db pull --print > /dev/null 2>&1 && echo "✅ Database connection works" || echo "❌ Can't connect to database"

# 4. Check for remaining Clerk references
echo -e "\nChecking for Clerk references..."
CLERK_COUNT=$(grep -r "@clerk" app components lib 2>/dev/null | grep -v node_modules | wc -l)
if [ $CLERK_COUNT -eq 1 ]; then
  echo "✅ Only checkout route uses Clerk (expected)"
else
  echo "⚠️ Found $CLERK_COUNT Clerk references (expected: 1)"
fi

echo -e "\n✅ Basic checks complete!"
```

## Next Steps

1. **Fix any failed tests** above
2. **Run through checklist again**
3. **Test with staging data** (if available)
4. **Deploy to production** (with backup!)
5. **Monitor for issues** for 48 hours

Good luck! 🚀
