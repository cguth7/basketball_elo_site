'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface GameRealtimeProps {
  gameId: string
}

export function GameRealtime({ gameId }: GameRealtimeProps) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to changes in game_participants for this game
    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'game_participants',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          console.log('Game participant change:', payload)
          // Refresh the page data when someone joins/leaves
          router.refresh()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          console.log('Game update:', payload)
          // Refresh when game status changes
          router.refresh()
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId, router])

  return null // This component doesn't render anything
}
