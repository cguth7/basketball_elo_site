"use client"

import * as React from "react"
import Link from "next/link"
import { MapPin, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface NavbarProps {
  user?: {
    id: string
    email: string
    display_name?: string
    avatar_url?: string
    current_elo?: number
  } | null
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()

  const getInitials = (name?: string) => {
    if (!name) return "?"
    return name
      .substring(0, 2)
      .toUpperCase()
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const handleProfileClick = () => {
    if (user?.id) {
      router.push(`/players/${user.id}`)
    }
  }

  return (
    <header className="bg-[#011F5B] text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer"
          >
            <MapPin className="h-5 w-5 text-[#990000]" />
            <span className="font-black text-lg tracking-tight">
              Pottruck<span className="text-[#990000]">King</span>
            </span>
          </Link>

          {/* Desktop Navigation - hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-blue-200 hover:text-white transition-colors"
            >
              Courts
            </Link>
            <Link
              href="/leaderboard"
              className="text-sm font-medium text-blue-200 hover:text-white transition-colors"
            >
              Leaderboard
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <div
                  className="flex items-center gap-2 px-3 py-1 bg-blue-800/50 rounded-full border border-blue-700 cursor-pointer hover:bg-blue-800 transition-colors"
                  onClick={handleProfileClick}
                  title="View Profile"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user.avatar_url} alt={user.display_name || user.email} />
                    <AvatarFallback className="bg-[#990000] text-white text-[10px] font-bold">
                      {getInitials(user.display_name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:block">
                    {user.display_name || user.email.split("@")[0]}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-blue-300 hover:text-white transition-colors"
                  title="Log out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
