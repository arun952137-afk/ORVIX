import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Simple demo auth - in production connect to your DB
        const demoUser = { id: '1', name: 'Creator', email: credentials?.email as string }
        if (credentials?.email && credentials?.password) {
          return demoUser
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: '/sign-in',
    signUp: '/sign-up',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isApp = nextUrl.pathname.startsWith('/dashboard') ||
                    nextUrl.pathname.startsWith('/create') ||
                    nextUrl.pathname.startsWith('/library')
      if (isApp) return isLoggedIn
      return true
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'orvix-secret-2026-change-in-production',
})
