import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type GameStatus = "pending" | "in_progress" | "completed"

interface GameStatusBadgeProps {
  status: GameStatus
  className?: string
}

export function GameStatusBadge({ status, className }: GameStatusBadgeProps) {
  const statusConfig: Record<GameStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
    pending: {
      label: "Pending",
      variant: "secondary",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    },
    in_progress: {
      label: "In Progress",
      variant: "default",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    },
    completed: {
      label: "Completed",
      variant: "outline",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    }
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
