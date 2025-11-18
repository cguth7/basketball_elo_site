import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth/helpers'
import { signOut } from '@/lib/auth/actions'

async function UserNav({ user }: { user: any }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-3">
        {user.user_metadata?.avatar_url && (
          <img
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata?.full_name || 'User avatar'}
            className="h-8 w-8 rounded-full"
          />
        )}
        <div className="hidden sm:block text-sm">
          <p className="font-medium text-gray-900">
            {user.user_metadata?.full_name || user.email}
          </p>
          <p className="text-gray-500 text-xs">{user.email}</p>
        </div>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          Sign out
        </button>
      </form>
    </div>
  )
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div>
                <Link href="/" className="text-xl font-bold text-orange-600">
                  Pottruck Basketball ELO
                </Link>
                <p className="text-xs text-gray-500 hidden sm:block">Penn Campus Rec</p>
              </div>
              <div className="hidden md:flex gap-1">
                <Link
                  href="/"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Games
                </Link>
                <Link
                  href="/leaderboard"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Leaderboard
                </Link>
              </div>
            </div>
            <UserNav user={user} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
