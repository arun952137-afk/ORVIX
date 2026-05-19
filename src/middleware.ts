import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/api/webhooks(.*)',
  '/api/payments/razorpay/webhook(.*)',
  '/api/cron(.*)',
])

const isDashboardRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/studio(.*)',
  '/editor(.*)',
  '/analytics(.*)',
  '/scheduler(.*)',
  '/library(.*)',
  '/team(.*)',
  '/billing(.*)',
  '/settings(.*)',
  '/onboarding(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }

  // Redirect unauthenticated users from dashboard to login
  if (isDashboardRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
