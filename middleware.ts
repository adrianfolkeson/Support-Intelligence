import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Check if Supabase is configured
  const isSupabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project')

  if (!isSupabaseConfigured) {
    // If not configured, just pass through
    return NextResponse.next()
  }

  // Public routes that don't require authentication
  const publicPaths = [
    '/',
    '/pricing',
    '/churn-calculator',
    '/compare',
    '/demo',
    '/blog',
    '/documentation',
    '/api-reference',
    '/integration-guide',
    '/support',
    '/privacy',
    '/terms',
    '/status',
    '/sign-in',
    '/sign-up',
    '/api/webhook',
    '/api/stripe',
    '/api/checkout',
  ]

  const isPublicPath = publicPaths.some(
    (path) => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(path)
  )

  if (isPublicPath) {
    return NextResponse.next()
  }

  return await updateSession(req)
}

export const config = {
  matcher: ['/((?!_next|.*\\..*|favicon.ico).*)'],
}

