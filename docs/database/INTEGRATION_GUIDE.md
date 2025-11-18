# Database Integration Guide

This guide provides code examples for integrating the Basketball ELO database with your Next.js application.

## Table of Contents
- [Setup](#setup)
- [Type Definitions](#type-definitions)
- [Authentication & Profiles](#authentication--profiles)
- [Game Management](#game-management)
- [ELO System](#elo-system)
- [Leaderboard & Stats](#leaderboard--stats)
- [Real-time Subscriptions](#real-time-subscriptions)

---

## Setup

### Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Client

Create `/lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase'

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## Type Definitions

Create `/types/supabase.ts` (auto-generate with Supabase CLI):

```bash
supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

### Custom Types

Create `/types/database.ts`:

```typescript
import type { Database } from './supabase'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Game = Database['public']['Tables']['games']['Row']
export type GameInsert = Database['public']['Tables']['games']['Insert']
export type GameUpdate = Database['public']['Tables']['games']['Update']

export type GameParticipant = Database['public']['Tables']['game_participants']['Row']
export type GameParticipantInsert = Database['public']['Tables']['game_participants']['Insert']

export type EloHistory = Database['public']['Tables']['elo_history']['Row']

export type GameStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type Team = 'team_a' | 'team_b'
export type WinningTeam = 'team_a' | 'team_b' | 'draw'

// Enhanced types with relations
export type GameWithParticipants = Game & {
  participants: (GameParticipant & { profile: Profile })[]
  host: Profile
}

export type LeaderboardEntry = {
  id: string
  display_name: string
  avatar_url: string | null
  current_elo: number
  peak_elo: number
  games_played: number
  wins: number
  losses: number
  win_percentage: number
  created_at: string
}
```

---

## Authentication & Profiles

### Sign Up with Profile Creation

```typescript
import { createClient } from '@/lib/supabase/client'

export async function signUp(email: string, password: string, displayName: string) {
  const supabase = createClient()

  // 1. Sign up the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('No user returned')

  // 2. Create profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      display_name: displayName,
    })
    .select()
    .single()

  if (profileError) throw profileError

  return { user: authData.user, profile }
}
```

### Get Current User Profile

```typescript
export async function getCurrentProfile() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return profile
}
```

### Update Profile

```typescript
import type { ProfileUpdate } from '@/types/database'

export async function updateProfile(userId: string, updates: ProfileUpdate) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Get Profile by ID

```typescript
export async function getProfile(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}
```

---

## Game Management

### Create Game

```typescript
import type { GameInsert } from '@/types/database'

export async function createGame(hostId: string, teamSize: number) {
  const supabase = createClient()

  const { data: game, error } = await supabase
    .from('games')
    .insert({
      host_id: hostId,
      team_size: teamSize,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return game
}
```

### Join Game

```typescript
import type { Team } from '@/types/database'

export async function joinGame(gameId: string, playerId: string, team: Team, currentElo: number) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('game_participants')
    .insert({
      game_id: gameId,
      player_id: playerId,
      team,
      elo_before: currentElo,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Leave Game

```typescript
export async function leaveGame(gameId: string, playerId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('game_participants')
    .delete()
    .eq('game_id', gameId)
    .eq('player_id', playerId)

  if (error) throw error
}
```

### Start Game

```typescript
export async function startGame(gameId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('games')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .eq('id', gameId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### Complete Game

```typescript
import type { WinningTeam } from '@/types/database'

export async function completeGame(
  gameId: string,
  teamAScore: number,
  teamBScore: number
) {
  const supabase = createClient()

  // Determine winner
  let winningTeam: WinningTeam
  if (teamAScore > teamBScore) {
    winningTeam = 'team_a'
  } else if (teamBScore > teamAScore) {
    winningTeam = 'team_b'
  } else {
    winningTeam = 'draw'
  }

  // Update game
  const { data: game, error: gameError } = await supabase
    .from('games')
    .update({
      status: 'completed',
      team_a_score: teamAScore,
      team_b_score: teamBScore,
      winning_team: winningTeam,
      completed_at: new Date().toISOString(),
    })
    .eq('id', gameId)
    .select()
    .single()

  if (gameError) throw gameError

  // Calculate ELO ratings
  const { error: eloError } = await supabase.rpc('update_elo_ratings', {
    p_game_id: gameId,
  })

  if (eloError) throw eloError

  return game
}
```

### Get Game with Participants

```typescript
export async function getGameWithParticipants(gameId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      host:profiles!games_host_id_fkey(*),
      participants:game_participants(
        *,
        profile:profiles(*)
      )
    `)
    .eq('id', gameId)
    .single()

  if (error) throw error
  return data
}
```

### Get Available Games

```typescript
export async function getAvailableGames() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      host:profiles!games_host_id_fkey(*),
      participants:game_participants(
        *,
        profile:profiles(*)
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

### Get Player's Games

```typescript
export async function getPlayerGames(playerId: string, limit = 10) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('game_participants')
    .select(`
      *,
      game:games(
        *,
        host:profiles!games_host_id_fkey(*)
      )
    `)
    .eq('player_id', playerId)
    .order('joined_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
```

---

## ELO System

### Get Player ELO History

```typescript
export async function getPlayerEloHistory(playerId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('elo_history')
    .select('*')
    .eq('player_id', playerId)
    .order('recorded_at', { ascending: true })

  if (error) throw error
  return data
}
```

### Format ELO History for Chart

```typescript
export function formatEloHistoryForChart(history: EloHistory[]) {
  return history.map(record => ({
    date: new Date(record.recorded_at).toLocaleDateString(),
    elo: record.elo_after,
    change: record.elo_change,
  }))
}
```

### Calculate Expected Win Probability

```typescript
export function calculateWinProbability(playerElo: number, opponentAvgElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentAvgElo - playerElo) / 400))
}
```

### Predict ELO Change

```typescript
const K_FACTOR = 32

export function predictEloChange(
  playerElo: number,
  opponentAvgElo: number,
  willWin: boolean
): number {
  const expectedScore = calculateWinProbability(playerElo, opponentAvgElo)
  const actualScore = willWin ? 1 : 0
  return Math.round(K_FACTOR * (actualScore - expectedScore))
}
```

---

## Leaderboard & Stats

### Get Leaderboard

```typescript
export async function getLeaderboard(limit = 50) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .limit(limit)

  if (error) throw error
  return data
}
```

### Get Player Rank

```typescript
export async function getPlayerRank(playerId: string): Promise<number> {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('current_elo')
    .eq('id', playerId)
    .single()

  if (!profile) return 0

  const { count } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gt('current_elo', profile.current_elo)
    .gt('games_played', 0)

  return (count || 0) + 1
}
```

### Get Platform Statistics

```typescript
export async function getPlatformStats() {
  const supabase = createClient()

  const [
    { count: totalPlayers },
    { count: activePlayers },
    { count: totalGames },
    { count: completedGames },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gt('games_played', 0),
    supabase.from('games').select('*', { count: 'exact', head: true }),
    supabase.from('games').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
  ])

  return {
    totalPlayers: totalPlayers || 0,
    activePlayers: activePlayers || 0,
    totalGames: totalGames || 0,
    completedGames: completedGames || 0,
  }
}
```

### Search Players

```typescript
export async function searchPlayers(query: string, limit = 10) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('display_name', `%${query}%`)
    .gt('games_played', 0)
    .order('current_elo', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
```

---

## Real-time Subscriptions

### Subscribe to Game Updates

```typescript
export function subscribeToGame(gameId: string, callback: (game: Game) => void) {
  const supabase = createClient()

  const subscription = supabase
    .channel(`game:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`,
      },
      (payload) => {
        callback(payload.new as Game)
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}
```

### Subscribe to Game Participants

```typescript
export function subscribeToGameParticipants(
  gameId: string,
  callback: (participants: GameParticipant[]) => void
) {
  const supabase = createClient()

  const subscription = supabase
    .channel(`game_participants:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_participants',
        filter: `game_id=eq.${gameId}`,
      },
      async () => {
        // Refetch all participants when changes occur
        const { data } = await supabase
          .from('game_participants')
          .select('*')
          .eq('game_id', gameId)

        if (data) callback(data)
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}
```

### Subscribe to Leaderboard Changes

```typescript
export function subscribeToLeaderboard(callback: () => void) {
  const supabase = createClient()

  const subscription = supabase
    .channel('leaderboard_changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
      },
      () => {
        callback()
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}
```

---

## Server Actions (Next.js App Router)

### Create Game Action

Create `/app/actions/game-actions.ts`:

```typescript
'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createGameAction(teamSize: number) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: game, error } = await supabase
    .from('games')
    .insert({
      host_id: user.id,
      team_size: teamSize,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/games')
  return game
}
```

### Complete Game Action

```typescript
'use server'

export async function completeGameAction(
  gameId: string,
  teamAScore: number,
  teamBScore: number
) {
  const supabase = createServerClient(/* ... */)

  // Determine winner
  let winningTeam: WinningTeam
  if (teamAScore > teamBScore) {
    winningTeam = 'team_a'
  } else if (teamBScore > teamAScore) {
    winningTeam = 'team_b'
  } else {
    winningTeam = 'draw'
  }

  // Update game
  const { error: gameError } = await supabase
    .from('games')
    .update({
      status: 'completed',
      team_a_score: teamAScore,
      team_b_score: teamBScore,
      winning_team: winningTeam,
      completed_at: new Date().toISOString(),
    })
    .eq('id', gameId)

  if (gameError) throw gameError

  // Calculate ELO
  const { error: eloError } = await supabase.rpc('update_elo_ratings', {
    p_game_id: gameId,
  })

  if (eloError) throw eloError

  revalidatePath(`/games/${gameId}`)
  revalidatePath('/leaderboard')
  revalidatePath('/profile')
}
```

---

## React Hooks Examples

### useProfile Hook

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw error
        setProfile(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  return { profile, loading, error }
}
```

### useLeaderboard Hook

```typescript
export function useLeaderboard(limit = 50) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .limit(limit)

      if (data) setLeaderboard(data)
      setLoading(false)
    }

    fetchLeaderboard()

    // Subscribe to changes
    const supabase = createClient()
    const subscription = supabase
      .channel('leaderboard')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchLeaderboard()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [limit])

  return { leaderboard, loading }
}
```

---

## Error Handling

### Custom Error Types

```typescript
export class GameError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GameError'
  }
}

export class EloError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EloError'
  }
}
```

### Error Handler

```typescript
export function handleSupabaseError(error: any): never {
  if (error.code === '23505') {
    throw new GameError('Player already joined this game')
  }
  if (error.code === '23503') {
    throw new GameError('Referenced record not found')
  }
  if (error.message.includes('ELO ratings already calculated')) {
    throw new EloError('ELO has already been calculated for this game')
  }
  throw new Error(error.message || 'An unexpected error occurred')
}
```

---

## Testing Helpers

### Mock Data

```typescript
export const mockProfile: Profile = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  display_name: 'Test Player',
  avatar_url: null,
  current_elo: 1500,
  peak_elo: 1500,
  games_played: 0,
  wins: 0,
  losses: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const mockGame: Game = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  host_id: mockProfile.id,
  status: 'pending',
  team_size: 3,
  team_a_score: null,
  team_b_score: null,
  winning_team: null,
  created_at: new Date().toISOString(),
  started_at: null,
  completed_at: null,
}
```

---

## Performance Tips

1. **Use select() wisely**: Only fetch columns you need
2. **Implement pagination**: Use `range()` for large datasets
3. **Cache leaderboard**: Consider caching for 1-5 minutes
4. **Batch operations**: Use batch inserts when adding multiple participants
5. **Use RPC for complex queries**: Let PostgreSQL do heavy lifting
6. **Index usage**: Queries on indexed columns are much faster
7. **Real-time subscriptions**: Unsubscribe when components unmount

---

## Security Checklist

- ✅ RLS policies enabled on all tables
- ✅ Server-side validation for critical operations
- ✅ User can only update their own profile
- ✅ Only game hosts can modify game data
- ✅ ELO calculations done server-side (cannot be manipulated)
- ✅ Proper foreign key constraints
- ✅ Input validation on team sizes and scores
- ⚠️ Consider rate limiting for game creation
- ⚠️ Consider anti-cheat measures (rapid game completion detection)

---

This integration guide covers the most common use cases. Refer to the Supabase documentation for advanced features like Edge Functions, Storage, and Auth providers.
