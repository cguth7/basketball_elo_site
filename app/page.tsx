import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { GameCard } from '@/components/games/game-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function Home() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Fetch active games (pending or in_progress)
  const { data: activeGames } = await supabase
    .from('games')
    .select(`
      *,
      host:profiles!games_host_id_fkey(id, display_name, current_elo),
      participants:game_participants(
        id,
        team_number,
        player:profiles(id, display_name, current_elo, avatar_url)
      )
    `)
    .in('status', ['pending', 'in_progress'])
    .order('created_at', { ascending: false })

  // Fetch recent completed games
  const { data: recentGames } = await supabase
    .from('games')
    .select(`
      *,
      host:profiles!games_host_id_fkey(id, display_name, current_elo),
      participants:game_participants(
        id,
        team_number,
        elo_change,
        player:profiles(id, display_name, current_elo, avatar_url)
      )
    `)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Active Games</h1>
            <p className="mt-1 text-sm text-gray-500">
              Join a game or start a new one at Pottruck
            </p>
          </div>
          <Link href="/games/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Start Game
            </Button>
          </Link>
        </div>

        {/* Active Games Section */}
        <div className="mb-12">
          {activeGames && activeGames.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  currentUserId={user.id}
                  onJoin={async () => {
                    'use server'
                    // Handled in game detail page
                  }}
                  onView={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="flex flex-col items-center">
                <svg
                  className="h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No active games
                </h3>
                <p className="text-gray-500 mb-6">
                  Be the first to start a game at Pottruck today!
                </p>
                <Link href="/games/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Start First Game
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Recent Games Section */}
        {recentGames && recentGames.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recent Games
            </h2>
            <div className="space-y-4">
              {recentGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.id}`}
                  className="block"
                >
                  <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">
                          {new Date(game.completed_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {game.team_size}
                        </div>
                        <div className="text-sm text-gray-500">
                          {game.participants?.filter((p: any) => p.team_number === game.winning_team).length} players won
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        View Details →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
