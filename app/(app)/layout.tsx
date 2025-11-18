import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/helpers'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  // Pages handle their own navigation now
  return <>{children}</>
}
