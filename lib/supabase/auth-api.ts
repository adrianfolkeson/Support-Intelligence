import { createClient } from './server'
import { NextResponse } from 'next/server'

/**
 * Helper function to get authenticated user from Supabase in API routes
 * Returns either the user ID or throws an error response
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return {
    user,
    userId: user.id,
    response: null,
  }
}
