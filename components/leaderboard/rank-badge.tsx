import { Badge } from "@/components/ui/badge"
import { Trophy, Medal } from "lucide-react"
import { cn } from "@/lib/utils"

interface RankBadgeProps {
  rank: number
  className?: string
  showIcon?: boolean
}

export function RankBadge({ rank, className, showIcon = true }: RankBadgeProps) {
  // Special styling for top 3
  if (rank === 1) {
    return (
      <Badge className={cn("bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold", className)}>
        {showIcon && <Trophy className="mr-1 h-3 w-3" />}
        #1
      </Badge>
    )
  }

  if (rank === 2) {
    return (
      <Badge className={cn("bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold", className)}>
        {showIcon && <Medal className="mr-1 h-3 w-3" />}
        #2
      </Badge>
    )
  }

  if (rank === 3) {
    return (
      <Badge className={cn("bg-orange-400 hover:bg-orange-500 text-orange-900 font-bold", className)}>
        {showIcon && <Medal className="mr-1 h-3 w-3" />}
        #3
      </Badge>
    )
  }

  // Standard rank badge for others
  return (
    <Badge variant="outline" className={cn("font-semibold", className)}>
      #{rank}
    </Badge>
  )
}
