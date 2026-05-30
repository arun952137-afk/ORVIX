import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/sign-in')

  return (
    <div className="app-shell">
      <Sidebar user={session.user} />
      <div className="main-area">{children}</div>
    </div>
  )
}
