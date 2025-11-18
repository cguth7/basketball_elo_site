import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { GameStatusBadge } from "./game-status-badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users } from "lucide-react"
import { format } from "date-fns"

interface GameCardProps {
  game: {
    id: string
    status: "pending" | "in_progress" | "completed"
    team_size: number
    team_a_score?: number | null
    team_b_score?: number | null
    winning_team?: "team_a" | "team_b" | null
    created_at: string
    played_at?: string | null
    team_a_players?: Array<{ id: string; full_name: string; elo_rating: number }>
    team_b_players?: Array<{ id: string; full_name: string; elo_rating: number }>
  }
  onJoin?: () => void
  onView?: () => void
  onSubmitResult?: () => void
  currentUserId?: string
}

export function GameCard({ game, onJoin, onView, onSubmitResult, currentUserId }: GameCardProps) {
  const teamAPlayers = game.team_a_players || []
  const teamBPlayers = game.team_b_players || []
  const totalPlayers = teamAPlayers.length + teamBPlayers.length
  const maxPlayers = game.team_size * 2
  const isUserInGame = currentUserId && (
    teamAPlayers.some(p => p.id === currentUserId) ||
    teamBPlayers.some(p => p.id === currentUserId)
  )

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {game.team_size}v{game.team_size} Game
          </CardTitle>
          <GameStatusBadge status={game.status} />
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Teams */}
          <div className="grid grid-cols-2 gap-4">
            {/* Team A */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Team A</h4>
                <span className="text-xs text-muted-foreground">
                  {teamAPlayers.length}/{game.team_size}
                </span>
              </div>
              <div className="space-y-1">
                {teamAPlayers.map((player) => (
                  <div key={player.id} className="text-sm text-muted-foreground truncate">
                    {player.full_name}
                  </div>
                ))}
                {Array.from({ length: game.team_size - teamAPlayers.length }).map((_, i) => (
                  <div key={`empty-a-${i}`} className="text-sm text-muted-foreground/50 italic">
                    Empty slot
                  </div>
                ))}
              </div>
            </div>

            {/* Team B */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Team B</h4>
                <span className="text-xs text-muted-foreground">
                  {teamBPlayers.length}/{game.team_size}
                </span>
              </div>
              <div className="space-y-1">
                {teamBPlayers.map((player) => (
                  <div key={player.id} className="text-sm text-muted-foreground truncate">
                    {player.full_name}
                  </div>
                ))}
                {Array.from({ length: game.team_size - teamBPlayers.length }).map((_, i) => (
                  <div key={`empty-b-${i}`} className="text-sm text-muted-foreground/50 italic">
                    Empty slot
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Score (if completed) */}
          {game.status === "completed" && game.team_a_score !== null && game.team_b_score !== null && (
            <div className="flex items-center justify-center gap-4 rounded-lg bg-muted p-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${game.winning_team === "team_a" ? "text-green-600" : ""}`}>
                  {game.team_a_score}
                </div>
                <div className="text-xs text-muted-foreground">Team A</div>
              </div>
              <div className="text-2xl font-bold text-muted-foreground">-</div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${game.winning_team === "team_b" ? "text-green-600" : ""}`}>
                  {game.team_b_score}
                </div>
                <div className="text-xs text-muted-foreground">Team B</div>
              </div>
            </div>
          )}

          {/* Game info */}
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(game.created_at), "MMM d, yyyy")}
            </div>
            {game.played_at && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(game.played_at), "h:mm a")}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        {game.status === "pending" && !isUserInGame && totalPlayers < maxPlayers && onJoin && (
          <Button onClick={onJoin} className="flex-1">
            Join Game
          </Button>
        )}
        {game.status === "pending" && isUserInGame && totalPlayers === maxPlayers && onSubmitResult && (
          <Button onClick={onSubmitResult} className="flex-1">
            Submit Result
          </Button>
        )}
        {onView && (
          <Button onClick={onView} variant="outline" className={game.status === "pending" && !isUserInGame && totalPlayers < maxPlayers ? "flex-1" : "w-full"}>
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
