import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { DashboardRealtime } from '@/components/dashboard/dashboard-realtime'
import { ensureUserProfile } from '@/lib/actions/ensure-profile'

export default async function Home() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  // Ensure user has a profile (create if doesn't exist)
  const profile = await ensureUserProfile()

  const supabase = await createClient()

  // Fetch active games (pending or in_progress)
  const { data: activeGames } = await supabase
    .from('games')
    .select(`
      *,
      host:profiles!games_host_id_fkey(id, display_name, current_elo),
      participants:game_participants(
        id,
        team,
        player:profiles!game_participants_player_id_fkey(id, display_name, current_elo, avatar_url)
      )
    `)
    .in('status', ['pending', 'in_progress'])
    .order('created_at', { ascending: false })

  // Fetch recent completed games
  const { data: recentGames } = await supabase
    .from('games')
    .select(`
      *,
      host:profiles!games_host_id_fkey(id, display_name, current_elo),
      participants:game_participants(
        id,
        team,
        elo_change,
        player:profiles!game_participants_player_id_fkey(id, display_name, current_elo, avatar_url)
      )
    `)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(10)

  return (
    <>
      <DashboardRealtime />
      <Navbar user={profile} />
      <div className="min-h-screen bg-slate-50 pb-24">
        <main className="max-w-5xl mx-auto px-4 py-6">
          <DashboardClient
            initialActiveGames={activeGames || []}
            initialRecentGames={recentGames || []}
            currentUserId={user.id}
          />
        </main>
      </div>
      <MobileNav />
    </>
  )
}
