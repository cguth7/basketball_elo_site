import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EloBadge } from "./elo-badge"
import { cn } from "@/lib/utils"

interface PlayerAvatarProps {
  player: {
    full_name: string
    avatar_url?: string | null
    elo_rating: number
  }
  size?: "sm" | "md" | "lg"
  showElo?: boolean
  className?: string
}

export function PlayerAvatar({ player, size = "md", showElo = true, className }: PlayerAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-24 w-24"
  }

  const badgeSizeClasses = {
    sm: "bottom-0 right-0 translate-x-1/4 translate-y-1/4",
    md: "bottom-0 right-0 translate-x-1/4 translate-y-1/4",
    lg: "bottom-0 right-0 translate-x-1/4 translate-y-1/4"
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={player.avatar_url || undefined} alt={player.full_name} />
        <AvatarFallback className="text-lg font-semibold">
          {getInitials(player.full_name)}
        </AvatarFallback>
      </Avatar>
      {showElo && (
        <div className={cn("absolute", badgeSizeClasses[size])}>
          <EloBadge elo={player.elo_rating} showLabel={false} className="text-xs px-1.5 py-0.5" />
        </div>
      )}
    </div>
  )
}
