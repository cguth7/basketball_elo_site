import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface EloBadgeProps {
  elo: number
  className?: string
  showLabel?: boolean
}

export function EloBadge({ elo, className, showLabel = true }: EloBadgeProps) {
  // Color coding based on ELO ranges
  const getEloColor = (rating: number) => {
    if (rating >= 1800) return "bg-purple-500 hover:bg-purple-600 text-white"
    if (rating >= 1600) return "bg-blue-500 hover:bg-blue-600 text-white"
    if (rating >= 1400) return "bg-green-500 hover:bg-green-600 text-white"
    if (rating >= 1200) return "bg-yellow-500 hover:bg-yellow-600 text-white"
    return "bg-gray-500 hover:bg-gray-600 text-white"
  }

  const getEloRank = (rating: number) => {
    if (rating >= 1800) return "Elite"
    if (rating >= 1600) return "Advanced"
    if (rating >= 1400) return "Intermediate"
    if (rating >= 1200) return "Beginner"
    return "Novice"
  }

  return (
    <Badge className={cn(getEloColor(elo), className)}>
      {showLabel && <span className="mr-1 text-xs opacity-80">ELO:</span>}
      <span className="font-bold">{elo}</span>
      {showLabel && (
        <span className="ml-1 text-xs opacity-80">({getEloRank(elo)})</span>
      )}
    </Badge>
  )
}
