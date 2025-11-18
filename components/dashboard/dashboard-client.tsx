"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, History, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GameLobby } from "@/components/games/game-lobby"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface DashboardClientProps {
  initialActiveGames: any[]
  initialRecentGames: any[]
  currentUserId: string
}

export function DashboardClient({
  initialActiveGames,
  initialRecentGames,
  currentUserId,
}: DashboardClientProps) {
  const router = useRouter()
  const [dashboardTab, setDashboardTab] = useState<"live" | "history">("live")
  const [activeGames] = useState(initialActiveGames)
  const [recentGames] = useState(initialRecentGames)

  const handleCreateLobby = async () => {
    try {
      const { createGame } = await import("@/lib/actions/games")
      const gameId = await createGame(5) // Default to 5v5
      router.push(`/games/${gameId}`)
      router.refresh()
    } catch (error) {
      console.error("Error creating game:", error)
    }
  }

  const handleJoinTeam = async (gameId: string, teamNumber: number) => {
    const supabase = createClient()

    // First, check if user is already in any team
    const { data: existingParticipant } = await supabase
      .from("game_participants")
      .select("*")
      .eq("game_id", gameId)
      .eq("player_id", currentUserId)
      .single()

    if (existingParticipant) {
      // Update team if already in game
      await supabase
        .from("game_participants")
        .update({ team_number: teamNumber })
        .eq("id", existingParticipant.id)
    } else {
      // Insert new participant
      await supabase.from("game_participants").insert({
        game_id: gameId,
        player_id: currentUserId,
        team_number: teamNumber,
      })
    }

    router.refresh()
  }

  const handleLeaveGame = async (gameId: string) => {
    const supabase = createClient()
    await supabase
      .from("game_participants")
      .delete()
      .eq("game_id", gameId)
      .eq("player_id", currentUserId)

    router.refresh()
  }

  const handleFinishGame = async (gameId: string, teamAScore: number, teamBScore: number) => {
    const supabase = createClient()

    // Determine winner
    const winningTeam = teamAScore > teamBScore ? 'team_a' : teamBScore > teamAScore ? 'team_b' : 'draw'

    // Update game status
    const { error: updateError } = await supabase
      .from("games")
      .update({
        status: "completed",
        team_a_score: teamAScore,
        team_b_score: teamBScore,
        winning_team: winningTeam,
        completed_at: new Date().toISOString(),
      })
      .eq("id", gameId)

    if (updateError) {
      console.error('Error updating game:', updateError)
      return
    }

    // Call database function to update ELO ratings
    const { error: eloError } = await supabase.rpc('update_elo_ratings', {
      p_game_id: gameId
    })

    if (eloError) {
      console.error('Error updating ELO:', eloError)
    }

    router.refresh()
    setDashboardTab("history")
  }

  const handleDeleteLobby = async (gameId: string) => {
    const supabase = createClient()
    await supabase.from("games").delete().eq("id", gameId)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Tabs */}
      <div className="flex p-1 bg-slate-200 rounded-xl mb-6">
        <button
          onClick={() => setDashboardTab("live")}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            dashboardTab === "live"
              ? "bg-white text-[#011F5B] shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <RefreshCw className={`h-4 w-4 ${dashboardTab === "live" ? "" : ""}`} />
          Live Courts
          {activeGames.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
              {activeGames.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setDashboardTab("history")}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            dashboardTab === "history"
              ? "bg-white text-[#011F5B] shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <History className="h-4 w-4" />
          Past Games
        </button>
      </div>

      {dashboardTab === "live" && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="bg-[#011F5B] rounded-xl p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold mb-1">Who&apos;s got next?</h2>
                <p className="text-blue-200 text-sm">Start a lobby and wait for players to join.</p>
              </div>
              <Button
                onClick={handleCreateLobby}
                className="bg-[#990000] hover:bg-red-700 text-white border-none shadow-xl w-full md:w-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                Start New Game
              </Button>
            </div>
          </div>

          {/* Live Games */}
          <div className="space-y-4">
            {activeGames.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <div className="inline-flex p-3 bg-slate-50 rounded-full mb-3">
                  <RefreshCw className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Courts are empty</h3>
                <p className="text-slate-500">Be the first to start a game!</p>
              </div>
            )}

            {activeGames.map((game) => (
              <GameLobby
                key={game.id}
                game={game}
                currentUserId={currentUserId}
                onJoinTeam={handleJoinTeam}
                onLeaveGame={handleLeaveGame}
                onFinish={handleFinishGame}
                onDelete={handleDeleteLobby}
              />
            ))}
          </div>
        </div>
      )}

      {dashboardTab === "history" && (
        <div className="space-y-6">
          {recentGames.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="inline-flex p-3 bg-slate-50 rounded-full mb-3">
                <History className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No games yet</h3>
              <p className="text-slate-500">Complete a game to see history here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentGames.map((game: any) => (
                <Link key={game.id} href={`/games/${game.id}`} className="block">
                  <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-500">
                          {new Date(game.completed_at || game.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-sm font-medium text-slate-900">
                          {game.team_size}v{game.team_size}
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {game.team_a_score} - {game.team_b_score}
                        </div>
                      </div>
                      <div className="text-sm text-slate-500">View Details →</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
