'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Users } from 'lucide-react'
import { deleteGame, joinGame, leaveGame } from '@/lib/actions/games'

interface GameActionsProps {
  gameId: string
  isHost: boolean
  isCompleted: boolean
}

export function CancelGameButton({ gameId, isHost, isCompleted }: GameActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  if (!isHost || isCompleted) return null

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to cancel this game?')) return

    setIsLoading(true)
    try {
      await deleteGame(gameId)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error deleting game:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to delete game: ${errorMessage}`)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isLoading}
    >
      <X className="h-4 w-4 mr-2" />
      {isLoading ? 'Canceling...' : 'Cancel Game'}
    </Button>
  )
}

interface JoinTeamButtonProps {
  gameId: string
  team: 'team_a' | 'team_b'
  currentUserParticipant: any
  isCompleted: boolean
}

export function JoinTeamButton({ gameId, team, currentUserParticipant, isCompleted }: JoinTeamButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  if (isCompleted || currentUserParticipant) return null

  const handleJoin = async () => {
    setIsLoading(true)
    try {
      await joinGame(gameId, team)
      router.refresh()
    } catch (error) {
      console.error('Error joining game:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to join game: ${errorMessage}`)
      setIsLoading(false)
    }
  }

  return (
    <Button
      size="sm"
      onClick={handleJoin}
      disabled={isLoading}
    >
      <Users className="h-4 w-4 mr-2" />
      {isLoading ? 'Joining...' : 'Join'}
    </Button>
  )
}

interface LeaveGameButtonProps {
  gameId: string
  participantId: string
  currentUserId: string
}

export function LeaveGameButton({ gameId, participantId, currentUserId }: LeaveGameButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLeave = async () => {
    setIsLoading(true)
    try {
      await leaveGame(gameId)
      router.refresh()
    } catch (error) {
      console.error('Error leaving game:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to leave game: ${errorMessage}`)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLeave}
      disabled={isLoading}
    >
      {isLoading ? 'Leaving...' : 'Leave'}
    </Button>
  )
}
