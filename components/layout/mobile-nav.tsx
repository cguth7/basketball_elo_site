"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Trophy, Plus } from "lucide-react"

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleCreateGame = async () => {
    try {
      const { createGame } = await import("@/lib/actions/games")
      const gameId = await createGame(5) // Default to 5v5
      router.push(`/games/${gameId}`)
      router.refresh()
    } catch (error) {
      console.error("Error creating game:", error)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 md:hidden flex justify-around p-3 pb-6 z-40 safe-area-inset-bottom">
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 ${
          pathname === "/" ? "text-[#990000]" : "text-slate-400"
        }`}
      >
        <LayoutDashboard className="h-6 w-6" />
        <span className="text-[10px] font-medium">Courts</span>
      </Link>

      <div className="relative -top-6">
        <button
          onClick={handleCreateGame}
          className="h-14 w-14 bg-[#990000] rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/40 ring-4 ring-slate-50 hover:bg-red-700 transition-colors"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>

      <Link
        href="/leaderboard"
        className={`flex flex-col items-center gap-1 ${
          pathname === "/leaderboard" ? "text-[#990000]" : "text-slate-400"
        }`}
      >
        <Trophy className="h-6 w-6" />
        <span className="text-[10px] font-medium">Rank</span>
      </Link>
    </div>
  )
}
