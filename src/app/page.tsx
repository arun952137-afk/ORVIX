import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { LandingPage } from '@/components/layout/LandingPage'

export default async function HomePage() {
  const { userId } = await auth()
  
  // Redirect signed-in users to dashboard
  if (userId) {
    redirect('/dashboard')
  }

  return <LandingPage />
}
