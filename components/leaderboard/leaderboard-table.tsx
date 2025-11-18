"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RankBadge } from "./rank-badge"
import { EloBadge } from "@/components/players/elo-badge"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Player {
  id: string
  full_name: string
  avatar_url?: string | null
  elo_rating: number
  games_played: number
  wins: number
  win_rate: number
}

interface LeaderboardTableProps {
  players: Player[]
  currentUserId?: string
  onPlayerClick?: (playerId: string) => void
}

type SortField = "elo_rating" | "games_played" | "win_rate"
type SortDirection = "asc" | "desc"

export function LeaderboardTable({ players, currentUserId, onPlayerClick }: LeaderboardTableProps) {
  const [sortField, setSortField] = React.useState<SortField>("elo_rating")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const sortedPlayers = React.useMemo(() => {
    return [...players].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [players, sortField, sortDirection])

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-8 p-0 hover:bg-transparent"
    >
      {children}
      {sortField === field ? (
        sortDirection === "desc" ? (
          <ArrowDown className="ml-2 h-4 w-4" />
        ) : (
          <ArrowUp className="ml-2 h-4 w-4" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  )

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>
              <SortButton field="elo_rating">ELO</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="games_played">Games</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="win_rate">Win Rate</SortButton>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedPlayers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No players found.
              </TableCell>
            </TableRow>
          ) : (
            sortedPlayers.map((player, index) => {
              const rank = index + 1
              const isCurrentUser = player.id === currentUserId
              const isTopThree = rank <= 3

              return (
                <TableRow
                  key={player.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isCurrentUser && "bg-primary/5",
                    isTopThree && "bg-gradient-to-r from-transparent via-primary/5 to-transparent"
                  )}
                  onClick={() => onPlayerClick?.(player.id)}
                >
                  <TableCell>
                    <RankBadge rank={rank} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={player.avatar_url || undefined} alt={player.full_name} />
                        <AvatarFallback>{getInitials(player.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {player.full_name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <EloBadge elo={player.elo_rating} showLabel={false} />
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{player.games_played}</span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({player.wins}W)
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{player.win_rate}%</span>
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full transition-all",
                            player.win_rate >= 60 ? "bg-green-500" :
                            player.win_rate >= 40 ? "bg-yellow-500" :
                            "bg-red-500"
                          )}
                          style={{ width: `${player.win_rate}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
