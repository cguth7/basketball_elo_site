import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Player {
  id: string
  full_name: string
  avatar_url?: string | null
  elo_rating: number
}

interface TeamRosterProps {
  teamName: string
  players: Player[]
  teamSize: number
  isWinner?: boolean
}

export function TeamRoster({ teamName, players, teamSize, isWinner }: TeamRosterProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const emptySlots = teamSize - players.length

  return (
    <Card className={isWinner ? "border-green-500 border-2" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{teamName}</CardTitle>
          {isWinner && (
            <Badge className="bg-green-500 hover:bg-green-600">
              Winner
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {players.map((player) => (
            <div key={player.id} className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={player.avatar_url || undefined} alt={player.full_name} />
                <AvatarFallback>{getInitials(player.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{player.full_name}</p>
                <p className="text-xs text-muted-foreground">ELO: {player.elo_rating}</p>
              </div>
            </div>
          ))}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div key={`empty-${i}`} className="flex items-center gap-3 opacity-50">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-muted">?</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm italic text-muted-foreground">Empty slot</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
