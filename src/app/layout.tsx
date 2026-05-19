import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { Syne, JetBrains_Mono } from 'next/font/google'
import { Providers } from '@/components/layout/Providers'
import '@/styles/globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['300', '400', '500'],
})

export const metadata: Metadata = {
  title: { default: 'ORVIX — The Living Creator Universe', template: '%s | ORVIX' },
  description: 'The cinematic creator OS. From prompt to viral reel in 60 seconds. AI scripting, voice synthesis, viral intelligence — one living workspace.',
  keywords: ['AI video generator', 'viral content', 'creator OS', 'TikTok automation', 'AI reels', 'short form video'],
  authors: [{ name: 'ORVIX Inc.' }],
  creator: 'ORVIX',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://orvix.io'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://orvix.io',
    title: 'ORVIX — The Living Creator Universe',
    description: 'The cinematic creator OS. From prompt to viral reel in 60 seconds.',
    siteName: 'ORVIX',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'ORVIX' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ORVIX — The Living Creator Universe',
    description: 'The cinematic creator OS. From prompt to viral reel in 60 seconds.',
    images: ['/og-image.png'],
    creator: '@orvixhq',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
  icons: { icon: '/favicon.ico', shortcut: '/favicon-16x16.png', apple: '/apple-touch-icon.png' },
}

export const viewport: Viewport = {
  themeColor: '#030305',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark, variables: { colorPrimary: '#c29a40', colorBackground: '#030305', colorText: '#e4e0d4', colorInputBackground: '#09091a', colorInputText: '#e4e0d4', borderRadius: '4px' } }}>
      <html lang="en" className={`${syne.variable} ${mono.variable}`} suppressHydrationWarning>
        <body suppressHydrationWarning>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
