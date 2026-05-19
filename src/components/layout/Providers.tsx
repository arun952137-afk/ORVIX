'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0e0e1c',
            color: '#e4e0d4',
            border: '1px solid rgba(194,154,64,0.15)',
            borderRadius: '6px',
            fontFamily: 'var(--font-syne)',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#1a8050', secondary: '#e4e0d4' } },
          error: { iconTheme: { primary: '#c01e30', secondary: '#e4e0d4' } },
          duration: 4000,
        }}
      />
    </QueryClientProvider>
  )
}
