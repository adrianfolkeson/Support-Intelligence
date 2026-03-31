# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for Support-Intel after migrating from Clerk.

## Prerequisites

- A Supabase account (free tier works)
- Basic understanding of OAuth providers (optional)

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Configure your project:
   - **Name**: support-intel (or your preferred name)
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to your users (EU West/Stockholm recommended)
4. Wait for project to be provisioned (2-3 minutes)

## Step 2: Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following credentials:

```
Project URL: https://xxxxx.supabase.co
anon/public key: eyJhbGc...
service_role key: eyJhbGc...
```

## Step 3: Configure Environment Variables

Add the following to your `.env` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important**: Never commit `SUPABASE_SERVICE_ROLE_KEY` to version control. It bypasses RLS!

## Step 4: Configure Database Connection

Update your `DATABASE_URL` in `.env`:

```env
# Use your Supabase database connection string
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project.supabase.co:5432/postgres
```

You can find this in:
- Supabase Dashboard → **Settings** → **Database** → **Connection String** → **URI**
- Replace `[YOUR-PASSWORD]` with the password you created in Step 1

## Step 5: Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase (or run migrations)
npx prisma db push

# OR if using migrations
npx prisma migrate deploy
```

## Step 6: Set Up Row Level Security (RLS)

1. In Supabase Dashboard, go to **SQL Editor**
2. Open the file `prisma/rls_policies.sql` from this project
3. Copy and paste the entire SQL into the SQL Editor
4. Click **Run** to execute

This will create all necessary RLS policies to ensure users can only access their own organization's data.

## Step 7: Configure OAuth Providers (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
5. Application type: Web application
6. Authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (dev)
   - `https://yourdomain.com/auth/callback` (prod)
7. Copy **Client ID** and **Client Secret**

8. In Supabase Dashboard → **Authentication** → **Providers** → **Google**:
   - Enable provider
   - Paste Client ID and Secret
   - Save

### GitHub OAuth

1. Go to GitHub → **Settings** → **Developer settings** → **OAuth Apps**
2. Click **New OAuth App**
3. Fill in:
   - Application name: Support-Intel
   - Homepage URL: `http://localhost:3000` (dev) or your production URL
   - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy **Client ID** and generate **Client Secret**

5. In Supabase Dashboard → **Authentication** → **Providers** → **GitHub**:
   - Enable provider
   - Paste Client ID and Secret
   - Save

## Step 8: Configure Redirect URLs

In Supabase Dashboard → **Authentication** → **URL Configuration**:

**Allowed Redirect URLs:**
```
http://localhost:3000/auth/callback
https://yourdomain.com/auth/callback
```

**Redirect Wildcards (optional):**
```
http://localhost:3000/*
https://yourdomain.com/*
```

## Step 9: Enable Email Confirmation (Optional)

1. In Supabase Dashboard → **Authentication** → **Email Auth**
2. Enable **Confirm email**
3. Customize email templates in **Email Templates** section
4. Test signup flow to ensure emails are delivered

## Step 10: Test Authentication Flow

### Sign Up Flow
1. Navigate to `/sign-up`
2. Test email/password signup
3. Check email for confirmation (if enabled)
4. Verify redirect to `/pricing` or `/dashboard`

### Sign In Flow
1. Navigate to `/sign-in`
2. Test email/password signin
3. Test Google OAuth (if configured)
4. Test GitHub OAuth (if configured)
5. Verify session persistence

### Protected Routes
1. Try accessing `/dashboard` while logged out → should redirect to `/sign-in`
2. Sign in and verify you can access protected routes
3. Test API routes work with authenticated session

## Troubleshooting

### "Database connection failed"
- Verify `DATABASE_URL` is correct
- Check password includes special characters are URL-encoded
- Ensure Supabase project is active (not paused)

### "Unauthorized" errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Check browser console for authentication errors
- Ensure cookies are enabled in your browser

### OAuth not working
- Verify redirect URLs match exactly (including protocol and port)
- Check OAuth provider console for errors
- Ensure provider is enabled in Supabase Dashboard

### RLS blocking legitimate access
- Run `SELECT * FROM pg_policies` in SQL Editor to verify policies exist
- Check `auth.uid()` returns correct user ID
- Test with service role key (bypasses RLS) to verify data exists

## Production Checklist

- [ ] Change Supabase project password from default
- [ ] Rotate API keys if they were exposed during development
- [ ] Enable email confirmation
- [ ] Configure production OAuth redirect URLs
- [ ] Set up custom email templates (optional)
- [ ] Enable 2FA on your Supabase account
- [ ] Configure rate limiting in Supabase Dashboard
- [ ] Set up database backups
- [ ] Review RLS policies for any security issues
- [ ] Test all authentication flows in production environment

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## Support

If you encounter issues:
1. Check Supabase Dashboard → **Logs** for error details
2. Review browser console for client-side errors
3. Check server logs for API route errors
4. Consult Supabase documentation or community forums
