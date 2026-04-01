import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle errors from Supabase
  if (error) {
    console.error('Auth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(errorDescription || 'Authentication failed')}`, requestUrl)
    )
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Error exchanging code for session:', exchangeError)
        return NextResponse.redirect(
          new URL(`/sign-in?error=${encodeURIComponent('Failed to sign in')}`, requestUrl)
        )
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        return NextResponse.redirect(
          new URL('/sign-in?error=No user found', requestUrl)
        )
      }

      // Redirect to onboarding if user is new, otherwise dashboard
      const redirectUrl = new URL('/welcome', requestUrl)
      return NextResponse.redirect(redirectUrl)
    } catch (err) {
      console.error('Auth callback error:', err)
      return NextResponse.redirect(
        new URL(`/sign-in?error=${encodeURIComponent('Authentication failed')}`, requestUrl)
      )
    }
  }

  // No code parameter - just redirect to dashboard
  return NextResponse.redirect(new URL('/dashboard', requestUrl))
}
