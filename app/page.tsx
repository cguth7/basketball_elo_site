import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default async function Home() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  const supabase = await createClient()

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch active games (pending or in_progress)
  const { data: activeGames } = await supabase
    .from('games')
    .select(`
      *,
      host:profiles!games_host_id_fkey(id, display_name, current_elo),
      participants:game_participants(
        id,
        team_number,
        player:profiles(id, display_name, current_elo, avatar_url)
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
        team_number,
        elo_change,
        player:profiles(id, display_name, current_elo, avatar_url)
      )
    `)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(10)

  return (
    <>
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
