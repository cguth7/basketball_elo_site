import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { createGame } from '@/lib/actions/games'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default async function NewGamePage() {
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

  return (
    <>
      <Navbar user={profile} />
      <div className="min-h-screen bg-slate-50 pb-24">
        <main className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Start a New Game</h1>
            <p className="mt-2 text-slate-600">
              Choose the team size and get started at Pottruck
            </p>
          </div>

          <Card className="p-6">
            <form action={createGame} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-4">
                  Team Size
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '1v1', value: '1' },
                    { label: '2v2', value: '2' },
                    { label: '3v3', value: '3' },
                    { label: '4v4', value: '4' },
                    { label: '5v5', value: '5' },
                  ].map((size) => (
                    <label
                      key={size.value}
                      className="relative flex cursor-pointer rounded-lg border border-slate-300 bg-white p-4 shadow-sm focus:outline-none hover:border-[#990000] transition-colors has-[:checked]:border-[#990000] has-[:checked]:ring-2 has-[:checked]:ring-[#990000]"
                    >
                      <input
                        type="radio"
                        name="team_size"
                        value={size.value}
                        className="sr-only"
                        required
                      />
                      <span className="flex flex-1">
                        <span className="flex flex-col">
                          <span className="block text-lg font-medium text-slate-900">
                            {size.label}
                          </span>
                          <span className="mt-1 flex items-center text-sm text-slate-500">
                            {size.value} players per team
                          </span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-blue-400 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">How it works</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>You&apos;ll be the game host</li>
                        <li>Players can join teams after you create the lobby</li>
                        <li>Once teams are ready, submit the final score</li>
                        <li>ELO ratings update automatically</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href="/" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="flex-1 bg-[#990000] hover:bg-red-700">
                  Start Game
                </Button>
              </div>
            </form>
          </Card>
        </main>
      </div>
      <MobileNav />
    </>
  )
}
