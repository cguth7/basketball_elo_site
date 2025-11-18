import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

/**
 * Get the current authenticated user
 * This function is cached to avoid multiple calls to Supabase
 */
export const getUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/**
 * Get the current user's session
 */
export const getSession = cache(async () => {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
})

/**
 * Check if the user is authenticated
 */
export async function isAuthenticated() {
  const user = await getUser()
  return !!user
}
