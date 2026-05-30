import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
      <div style={{ fontFamily: 'system-ui', fontSize: 11, fontWeight: 900, letterSpacing: '.4em', color: 'var(--gold)', textTransform: 'uppercase' }}>ORVIX</div>
      <SignIn />
    </div>
  )
}
