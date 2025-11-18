"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Trash2, UserMinus, UserPlus } from "lucide-react"

interface Player {
  id: string
  display_name: string
  avatar_url?: string | null
  current_elo: number
}

interface GameParticipant {
  id: string
  team_number: number
  player: Player
}

interface GameLobbyProps {
  game: {
    id: string
    created_at: string
    team_size: number
    host_id: string
    status: string
    participants?: GameParticipant[]
  }
  currentUserId: string
  onJoinTeam: (gameId: string, teamNumber: number) => Promise<void>
  onLeaveGame: (gameId: string) => Promise<void>
  onFinish: (gameId: string, teamAScore: number, teamBScore: number) => Promise<void>
  onDelete: (gameId: string) => Promise<void>
}

export function GameLobby({
  game,
  currentUserId,
  onJoinTeam,
  onLeaveGame,
  onFinish,
  onDelete,
}: GameLobbyProps) {
  const [scoreA, setScoreA] = useState("")
  const [scoreB, setScoreB] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isCreator = game.host_id === currentUserId
  const participants = game.participants || []

  const teamAPlayers = participants
    .filter((p) => p.team_number === 1)
    .map((p) => p.player)
  const teamBPlayers = participants
    .filter((p) => p.team_number === 2)
    .map((p) => p.player)

  const userTeam = participants.find((p) => p.player.id === currentUserId)?.team_number

  const teamAElo = teamAPlayers.length > 0
    ? Math.round(teamAPlayers.reduce((sum, p) => sum + p.current_elo, 0) / teamAPlayers.length)
    : 0

  const teamBElo = teamBPlayers.length > 0
    ? Math.round(teamBPlayers.reduce((sum, p) => sum + p.current_elo, 0) / teamBPlayers.length)
    : 0

  const handleSubmitScore = async () => {
    if (scoreA && scoreB) {
      setIsSubmitting(true)
      try {
        await onFinish(game.id, parseInt(scoreA), parseInt(scoreB))
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Card className="border-l-4 border-l-[#990000] animate-in fade-in slide-in-from-bottom-4 duration-300 overflow-visible p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Live Game</span>
            <span className="text-xs text-slate-400">
              • {new Date(game.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900">Pottruck Court #{game.id.slice(-2)}</h3>
        </div>

        {isCreator && (
          <Button
            onClick={() => onDelete(game.id)}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-red-500 hover:bg-red-50 self-end md:self-auto"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Cancel
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-8 mb-8">
        {/* TEAM A */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <h4 className="font-black text-slate-900">TEAM A</h4>
            <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
              ELO: {teamAElo || "-"}
            </span>
          </div>

          <div className="space-y-2 min-h-[80px]">
            {teamAPlayers.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-[#990000]/5 border border-[#990000]/20 p-2 rounded-lg shadow-sm"
              >
                <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-[#990000] border border-[#990000]/30">
                  {getInitials(p.display_name)}
                </div>
                <span className="text-sm font-medium text-slate-900 truncate">{p.display_name}</span>
              </div>
            ))}
            {teamAPlayers.length === 0 && (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-4">
                <span className="text-xs text-slate-400 italic">Empty</span>
              </div>
            )}
          </div>

          {userTeam === 1 ? (
            <Button
              onClick={() => onLeaveGame(game.id)}
              variant="outline"
              size="sm"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <UserMinus className="h-3 w-3 mr-1" />
              Leave
            </Button>
          ) : (
            <Button
              onClick={() => onJoinTeam(game.id, 1)}
              disabled={!!userTeam}
              variant="outline"
              size="sm"
              className="w-full hover:border-[#990000] hover:text-[#990000]"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Join Team A
            </Button>
          )}
        </div>

        {/* TEAM B */}
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <h4 className="font-black text-slate-900">TEAM B</h4>
            <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
              ELO: {teamBElo || "-"}
            </span>
          </div>

          <div className="space-y-2 min-h-[80px]">
            {teamBPlayers.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 bg-slate-100 border border-slate-200 p-2 rounded-lg shadow-sm"
              >
                <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-slate-700 border border-slate-200">
                  {getInitials(p.display_name)}
                </div>
                <span className="text-sm font-medium text-slate-900 truncate">{p.display_name}</span>
              </div>
            ))}
            {teamBPlayers.length === 0 && (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-4">
                <span className="text-xs text-slate-400 italic">Empty</span>
              </div>
            )}
          </div>

          {userTeam === 2 ? (
            <Button
              onClick={() => onLeaveGame(game.id)}
              variant="outline"
              size="sm"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <UserMinus className="h-3 w-3 mr-1" />
              Leave
            </Button>
          ) : (
            <Button
              onClick={() => onJoinTeam(game.id, 2)}
              disabled={!!userTeam}
              variant="outline"
              size="sm"
              className="w-full hover:border-slate-500 hover:text-slate-700"
            >
              <UserPlus className="h-3 w-3 mr-1" />
              Join Team B
            </Button>
          )}
        </div>
      </div>

      {/* Host Controls */}
      {isCreator && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-400 uppercase text-center">
              Record Final Score
            </label>
            <div className="flex items-center justify-center gap-3">
              <input
                type="number"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                placeholder="A"
                className="w-16 h-12 text-center font-bold text-xl border border-slate-300 rounded-lg focus:border-[#990000] focus:ring-1 focus:ring-[#990000] outline-none"
              />
              <span className="font-bold text-slate-300">-</span>
              <input
                type="number"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                placeholder="B"
                className="w-16 h-12 text-center font-bold text-xl border border-slate-300 rounded-lg focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none"
              />
              <Button
                onClick={handleSubmitScore}
                disabled={!scoreA || !scoreB || isSubmitting}
                className="ml-2 bg-[#990000] hover:bg-red-700"
              >
                <Trophy className="h-4 w-4 mr-1" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
