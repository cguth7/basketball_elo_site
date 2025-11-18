import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Trophy, Target } from "lucide-react"

interface Stat {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

interface StatsGridProps {
  stats: Stat[]
  columns?: 2 | 3 | 4
}

export function StatsGrid({ stats, columns = 4 }: StatsGridProps) {
  const gridColsClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
  }

  return (
    <div className={`grid gap-4 ${gridColsClass[columns]}`}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {stat.trend && stat.trendValue && (
                    <span className={`flex items-center text-xs font-medium ${
                      stat.trend === "up" ? "text-green-600" :
                      stat.trend === "down" ? "text-red-600" :
                      "text-muted-foreground"
                    }`}>
                      {stat.trend === "up" && <TrendingUp className="h-3 w-3 mr-1" />}
                      {stat.trend === "down" && <TrendingDown className="h-3 w-3 mr-1" />}
                      {stat.trendValue}
                    </span>
                  )}
                </div>
              </div>
              {stat.icon && (
                <div className="text-muted-foreground">
                  {stat.icon}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Preset stats for common use cases
export function PlayerStatsGrid({
  gamesPlayed,
  wins,
  winRate,
  eloRating,
  eloChange
}: {
  gamesPlayed: number
  wins: number
  winRate: number
  eloRating: number
  eloChange?: number
}) {
  const stats: Stat[] = [
    {
      label: "Games Played",
      value: gamesPlayed,
      icon: <Target className="h-5 w-5" />
    },
    {
      label: "Wins",
      value: wins,
      icon: <Trophy className="h-5 w-5" />
    },
    {
      label: "Win Rate",
      value: `${winRate}%`,
      trend: winRate >= 50 ? "up" : winRate < 50 ? "down" : "neutral",
      trendValue: winRate >= 50 ? "Above average" : "Below average"
    },
    {
      label: "ELO Rating",
      value: eloRating,
      trend: eloChange ? (eloChange > 0 ? "up" : eloChange < 0 ? "down" : "neutral") : undefined,
      trendValue: eloChange ? `${eloChange > 0 ? '+' : ''}${eloChange}` : undefined
    }
  ]

  return <StatsGrid stats={stats} columns={4} />
}
