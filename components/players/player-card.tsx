import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayerAvatar } from "./player-avatar"
import { EloBadge } from "./elo-badge"
import { Trophy, TrendingUp } from "lucide-react"

interface PlayerCardProps {
  player: {
    id: string
    full_name: string
    avatar_url?: string | null
    elo_rating: number
    games_played?: number
    wins?: number
    win_rate?: number
  }
  rank?: number
  onViewProfile?: () => void
  compact?: boolean
}

export function PlayerCard({ player, rank, onViewProfile, compact = false }: PlayerCardProps) {
  const winRate = player.win_rate || (player.games_played && player.wins
    ? Math.round((player.wins / player.games_played) * 100)
    : 0)

  if (compact) {
    return (
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {rank && (
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                  #{rank}
                </div>
              </div>
            )}
            <PlayerAvatar player={player} size="sm" showElo={false} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{player.full_name}</p>
              <div className="flex items-center gap-2 mt-1">
                <EloBadge elo={player.elo_rating} showLabel={false} className="text-xs" />
                {player.games_played !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    {player.games_played} games
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <PlayerAvatar player={player} size="lg" showElo={false} />
            <div className="space-y-1">
              <h3 className="text-xl font-bold">{player.full_name}</h3>
              <EloBadge elo={player.elo_rating} />
            </div>
          </div>
          {rank && (
            <div className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl font-bold ${
              rank === 1 ? "bg-yellow-400 text-yellow-900" :
              rank === 2 ? "bg-gray-300 text-gray-900" :
              rank === 3 ? "bg-orange-400 text-orange-900" :
              "bg-muted text-muted-foreground"
            }`}>
              #{rank}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{player.games_played || 0}</div>
            <div className="text-xs text-muted-foreground">Games</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <Trophy className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold">{player.wins || 0}</div>
            <div className="text-xs text-muted-foreground">Wins</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{winRate}%</div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
        </div>
      </CardContent>

      {onViewProfile && (
        <CardFooter>
          <Button onClick={onViewProfile} variant="outline" className="w-full">
            View Profile
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
