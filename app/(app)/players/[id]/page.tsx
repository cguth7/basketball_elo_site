import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PlayerCard } from '@/components/players/player-card'
import { PlayerStatsGrid } from '@/components/players/stats-grid'
import { GameCard } from '@/components/games/game-card'

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch player profile
    const { data: player, error: playerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

    if (playerError || !player) {
        notFound()
    }

    // Fetch recent games
    const { data: recentGames } = await supabase
        .from('game_participants')
        .select(`
      team,
      games (
        id,
        created_at,
        status,
        winning_team,
        team_a_score,
        team_b_score,
        game_participants (
          team,
          profiles (
            id,
            full_name,
            avatar_url,
            current_elo
          )
        )
      )
    `)
        .eq('player_id', id)
        .order('created_at', { ascending: false })
        .limit(10)

    // Transform games data
    const games = recentGames?.map((g: any) => ({
        ...g.games,
        participants: g.games.game_participants.map((p: any) => ({
            ...p,
            player: p.profiles
        }))
    })) || []

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Player Card */}
                <div className="md:col-span-1">
                    <PlayerCard
                        player={{
                            id: player.id,
                            full_name: player.full_name,
                            avatar_url: player.avatar_url,
                            elo_rating: player.current_elo,
                            games_played: player.games_played,
                            wins: player.wins,
                            win_rate: player.games_played ? Math.round((player.wins / player.games_played) * 100) : 0
                        }}
                    />
                </div>

                {/* Right Column: Stats & History */}
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Stats</h2>
                        <PlayerStatsGrid
                            gamesPlayed={player.games_played || 0}
                            wins={player.wins || 0}
                            winRate={player.games_played ? Math.round((player.wins / player.games_played) * 100) : 0}
                            eloRating={player.current_elo}
                        />
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Recent Games</h2>
                        <div className="space-y-4">
                            {games.length > 0 ? (
                                games.map((game: any) => (
                                    <GameCard
                                        key={game.id}
                                        game={game}
                                        currentUserId={id} // Show from perspective of profile owner
                                    />
                                ))
                            ) : (
                                <p className="text-muted-foreground">No games played yet.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
