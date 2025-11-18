import { notFound, redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { joinGame, leaveGame, submitGameResult, deleteGame } from '@/lib/actions/games'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Trophy, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface GamePageProps {
  params: Promise<{
    id: string
  }>
}

// Enable dynamic params for runtime game IDs
export const dynamic = 'force-dynamic'
export const dynamicParams = true

export default async function GamePage({ params }: GamePageProps) {
  const { id } = await params

  const user = await getUser()
  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch game details
  const { data: game, error } = await supabase
    .from('games')
    .select(`
      *,
      host:profiles!games_host_id_fkey(id, display_name, current_elo),
      participants:game_participants(
        id,
        team_number,
        elo_before,
        elo_after,
        elo_change,
        player:profiles!game_participants_player_id_fkey(id, display_name, current_elo, avatar_url)
      )
    `)
    .eq('id', id)
    .single()

  if (error || !game) {
    notFound()
  }

  const isHost = game.host_id === user.id
  const team1 = game.participants?.filter((p: any) => p.team_number === 1) || []
  const team2 = game.participants?.filter((p: any) => p.team_number === 2) || []
  const currentUserParticipant = game.participants?.find((p: any) => p.player.id === user.id)
  const isCompleted = game.status === 'completed'

  return (
    <>
      <Navbar user={profile} />
      <div className="min-h-screen bg-slate-50 pb-24">
        <main className="max-w-5xl mx-auto px-4 py-8">
          <Link href="/" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to courts
          </Link>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">{game.team_size} Game</h1>
            <Badge variant={isCompleted ? 'secondary' : 'default'}>
              {isCompleted ? 'Completed' : game.status === 'in_progress' ? 'In Progress' : 'Open'}
            </Badge>
          </div>
          {isHost && !isCompleted && (
            <form action={async () => {
              'use server'
              await deleteGame(game.id)
            }}>
              <Button variant="destructive" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel Game
              </Button>
            </form>
          )}
        </div>
        <p className="text-gray-600">
          Hosted by {game.host.display_name} {isHost && '(You)'}
        </p>
      </div>

      {/* Teams Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Team 1 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Team A
              {isCompleted && game.winning_team === 'team_a' && (
                <Trophy className="h-5 w-5 text-yellow-600" />
              )}
            </h2>
            {!isCompleted && !currentUserParticipant && (
              <form action={async () => {
                'use server'
                await joinGame(game.id, 'team_a')
              }}>
                <Button size="sm">Join</Button>
              </form>
            )}
          </div>
          <div className="space-y-3">
            {team1.length > 0 ? (
              team1.map((participant: any) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {participant.player.avatar_url && (
                      <img
                        src={participant.player.avatar_url}
                        alt={participant.player.display_name}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {participant.player.display_name}
                        {participant.player.id === user.id && ' (You)'}
                      </p>
                      <p className="text-sm text-gray-500">
                        ELO: {isCompleted ? participant.elo_before : participant.player.current_elo}
                        {isCompleted && participant.elo_change && (
                          <span className={participant.elo_change > 0 ? 'text-green-600' : 'text-red-600'}>
                            {' '}({participant.elo_change > 0 ? '+' : ''}{participant.elo_change})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {!isCompleted && participant.player.id === user.id && (
                    <form action={leaveGame.bind(null, game.id)}>
                      <Button variant="ghost" size="sm">
                        Leave
                      </Button>
                    </form>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No players yet</p>
            )}
          </div>
        </Card>

        {/* Team 2 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Team B
              {isCompleted && game.winning_team === 'team_b' && (
                <Trophy className="h-5 w-5 text-yellow-600" />
              )}
            </h2>
            {!isCompleted && !currentUserParticipant && (
              <form action={async () => {
                'use server'
                await joinGame(game.id, 'team_b')
              }}>
                <Button size="sm" variant="secondary">Join</Button>
              </form>
            )}
          </div>
          <div className="space-y-3">
            {team2.length > 0 ? (
              team2.map((participant: any) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {participant.player.avatar_url && (
                      <img
                        src={participant.player.avatar_url}
                        alt={participant.player.display_name}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {participant.player.display_name}
                        {participant.player.id === user.id && ' (You)'}
                      </p>
                      <p className="text-sm text-gray-500">
                        ELO: {isCompleted ? participant.elo_before : participant.player.current_elo}
                        {isCompleted && participant.elo_change && (
                          <span className={participant.elo_change > 0 ? 'text-green-600' : 'text-red-600'}>
                            {' '}({participant.elo_change > 0 ? '+' : ''}{participant.elo_change})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  {!isCompleted && participant.player.id === user.id && (
                    <form action={leaveGame.bind(null, game.id)}>
                      <Button variant="ghost" size="sm">
                        Leave
                      </Button>
                    </form>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No players yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Submit Result (Host Only) */}
      {isHost && !isCompleted && team1.length > 0 && team2.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Submit Game Result</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <form action={async () => {
              'use server'
              await submitGameResult(game.id, 'team_a')
            }}>
              <Button className="w-full bg-[#990000] hover:bg-red-700" size="lg">
                Team A Won
              </Button>
            </form>
            <form action={async () => {
              'use server'
              await submitGameResult(game.id, 'team_b')
            }}>
              <Button className="w-full" size="lg" variant="secondary">
                Team B Won
              </Button>
            </form>
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            ELO ratings will be updated automatically
          </p>
        </Card>
      )}

      {/* Game Info */}
      {isCompleted && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Game Complete</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>Completed at: {new Date(game.completed_at).toLocaleString()}</p>
            <p>Winner: Team {game.winning_team}</p>
            <p className="text-gray-500">ELO ratings have been updated for all participants</p>
          </div>
        </Card>
      )}
        </main>
      </div>
      <MobileNav />
    </>
  )
}
