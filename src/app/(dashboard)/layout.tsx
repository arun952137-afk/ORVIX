import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { DashboardNav } from '@/components/layout/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--void)' }}>
      <DashboardSidebar />
      <div style={{ flex: 1, marginLeft: '220px', display: 'flex', flexDirection: 'column' }}>
        <DashboardNav />
        <main style={{ flex: 1, marginTop: '58px', padding: '32px', maxWidth: '1400px', width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
