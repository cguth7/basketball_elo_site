import { getUser } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function LeaderboardPage() {
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

  // Fetch all players sorted by ELO
  const { data: players } = await supabase
    .from('profiles')
    .select('*')
    .order('current_elo', { ascending: false })

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <>
      <Navbar user={profile} />
      <div className="min-h-screen bg-slate-50 pb-24">
        <main className="max-w-5xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Pottruck Leaders</h2>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3 font-medium">Rank</th>
                    <th className="px-6 py-3 font-medium">Player</th>
                    <th className="px-6 py-3 font-medium text-right">Rating</th>
                    <th className="px-6 py-3 font-medium text-right">W - L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {players && players.length > 0 ? (
                    players.map((player, index) => (
                      <tr
                        key={player.id}
                        className={`hover:bg-slate-50 cursor-pointer transition-colors group ${
                          player.id === user.id ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 font-medium text-slate-600">
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                                index === 0
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : index === 1
                                  ? 'bg-slate-200 text-slate-700'
                                  : index === 2
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'text-slate-500'
                              }`}
                            >
                              {index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/players/${player.id}`}>
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-[#990000]/10 text-[#990000] flex items-center justify-center text-xs font-bold mr-3 border border-[#990000]/20">
                                {getInitials(player.display_name)}
                              </div>
                              <span className="font-medium text-slate-900 group-hover:text-[#990000] transition-colors">
                                {player.display_name}
                              </span>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-700">
                          {player.current_elo}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-500">
                          <span className="text-green-600 font-medium">{player.wins}</span> -{' '}
                          <span className="text-red-600 font-medium">{player.losses}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <svg
                            className="h-12 w-12 text-slate-400 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                          <h3 className="text-lg font-medium text-slate-900">No players yet</h3>
                          <p className="text-slate-500">The leaderboard will populate as players record games</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </main>
      </div>
      <MobileNav />
    </>
  )
}
