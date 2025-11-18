'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Ensures a user has a profile in the profiles table
 * Creates one if it doesn't exist
 */
export async function ensureUserProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (existingProfile) {
    return existingProfile
  }

  // Create profile if it doesn't exist
  const { data: newProfile, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Player',
      avatar_url: user.user_metadata?.avatar_url,
      current_elo: 1500,
      peak_elo: 1500,
      games_played: 0,
      wins: 0,
      losses: 0,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating profile:', error)
    throw error
  }

  return newProfile
}
