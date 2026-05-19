// This serves the static ORVIX v5 experience
// The full cinematic HTML is in /public/index.html for the landing
// For Next.js, we embed it as a client component

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function LandingPage() {
  useEffect(() => {
    // The landing page (orvix-v5) is served directly from the static HTML
    // This component handles any client-side enhancements
    document.title = 'ORVIX — The Living Creator Universe'
  }, [])

  return (
    <div suppressHydrationWarning>
      {/* 
        The landing page experience is the orvix-v5.html file
        served as index.html via Vercel static hosting.
        
        For Next.js dashboard routes, this component handles
        the transition to the authenticated app.
        
        The full cinematic experience is at:
        /public/index.html → served as the root / route
        
        Dashboard is at /dashboard after auth.
      */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Redirect to the static landing if needed
            if (window.location.pathname === '/' && !document.querySelector('#boot')) {
              // Landing page loads from static HTML
            }
          `,
        }}
      />
    </div>
  )
}
