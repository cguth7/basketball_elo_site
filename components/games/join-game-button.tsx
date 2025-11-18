"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface JoinGameButtonProps {
  gameId: string
  teamAFull: boolean
  teamBFull: boolean
  onJoin: (team: "team_a" | "team_b") => Promise<void>
  isLoading?: boolean
}

export function JoinGameButton({
  gameId,
  teamAFull,
  teamBFull,
  onJoin,
  isLoading
}: JoinGameButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedTeam, setSelectedTeam] = React.useState<"team_a" | "team_b" | "">("")

  const handleJoin = async () => {
    if (!selectedTeam) return
    await onJoin(selectedTeam)
    setOpen(false)
    setSelectedTeam("")
  }

  // If only one team is available, auto-select it
  React.useEffect(() => {
    if (teamAFull && !teamBFull) {
      setSelectedTeam("team_b")
    } else if (!teamAFull && teamBFull) {
      setSelectedTeam("team_a")
    }
  }, [teamAFull, teamBFull])

  const bothTeamsFull = teamAFull && teamBFull

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={bothTeamsFull}>
          {bothTeamsFull ? "Game Full" : "Join Game"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Game</DialogTitle>
          <DialogDescription>
            Select which team you want to join.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="team">Team</Label>
            <Select
              value={selectedTeam}
              onValueChange={(value) => setSelectedTeam(value as "team_a" | "team_b")}
            >
              <SelectTrigger id="team">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {!teamAFull && (
                  <SelectItem value="team_a">Team A</SelectItem>
                )}
                {!teamBFull && (
                  <SelectItem value="team_b">Team B</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleJoin} disabled={!selectedTeam || isLoading}>
            {isLoading ? "Joining..." : "Join Team"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
