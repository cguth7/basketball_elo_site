'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateTeamRatings } from '@/lib/elo'
import { ensureUserProfile } from './ensure-profile'

export async function createGame(teamSize: number = 5) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Ensure user has a profile before creating game
  await ensureUserProfile()

  const { data: game, error } = await supabase
    .from('games')
    .insert({
      host_id: user.id,
      status: 'pending',
      team_size: teamSize,
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/')
  return game.id
}

export async function joinGame(gameId: string, team: 'team_a' | 'team_b') {
  console.log('Attempting to join game:', { gameId, team })
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('Join game failed: Not authenticated')
    throw new Error('Not authenticated')
  }

  // Ensure user has a profile
  console.log('Ensuring profile for user:', user.id)
  const profile = await ensureUserProfile()
  if (!profile) {
    console.error('Join game failed: Could not create/fetch profile')
    throw new Error('Failed to create profile')
  }

  console.log('Inserting participant record...')
  const { error } = await supabase
    .from('game_participants')
    .insert({
      game_id: gameId,
      player_id: user.id,
      team: team,
      elo_before: profile.current_elo,
    })

  if (error) {
    console.error('Join game failed: Database error', error)
    throw error
  }

  console.log('Successfully joined game')
  revalidatePath(`/games/${gameId}`)
  revalidatePath('/')
}

export async function leaveGame(gameId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('game_participants')
    .delete()
    .eq('game_id', gameId)
    .eq('player_id', user.id)

  if (error) throw error

  revalidatePath(`/games/${gameId}`)
  revalidatePath('/')
}

export async function submitGameResult(gameId: string, winningTeam: 'team_a' | 'team_b', teamAScore?: number, teamBScore?: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Verify user is the host
  const { data: game } = await supabase
    .from('games')
    .select('host_id')
    .eq('id', gameId)
    .single()

  if (!game || game.host_id !== user.id) {
    throw new Error('Only the host can submit results')
  }

  // Update game status
  const { error: updateError } = await supabase
    .from('games')
    .update({
      status: 'completed',
      winning_team: winningTeam,
      team_a_score: teamAScore,
      team_b_score: teamBScore,
      completed_at: new Date().toISOString(),
    })
    .eq('id', gameId)

  if (updateError) throw updateError

  // Call database function to update ELO ratings
  const { data: eloData, error: eloError } = await supabase.rpc('update_elo_ratings', {
    p_game_id: gameId
  })

  if (eloError) {
    console.error('ELO update error:', eloError)
    throw new Error(`Failed to update ELO ratings: ${eloError.message}`)
  }

  console.log('ELO update successful:', eloData)

  revalidatePath(`/games/${gameId}`)
  revalidatePath('/')
  redirect('/')
}

export async function deleteGame(gameId: string) {
  console.log('Attempting to delete game:', gameId)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('Delete game failed: Not authenticated')
    throw new Error('Not authenticated')
  }

  // Verify user is the host
  const { data: game } = await supabase
    .from('games')
    .select('host_id')
    .eq('id', gameId)
    .single()

  if (!game || game.host_id !== user.id) {
    console.error('Delete game failed: User is not host', { userId: user.id, hostId: game?.host_id })
    throw new Error('Only the host can delete the game')
  }

  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', gameId)

  if (error) {
    console.error('Delete game failed: Database error', error)
    throw error
  }

  console.log('Successfully deleted game')
  revalidatePath('/')
  redirect('/')
}
