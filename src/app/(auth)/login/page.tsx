import { SignIn } from '@clerk/nextjs'

export default function LoginPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 40, position: 'absolute', top: '15%' }}>
        <div style={{ fontFamily: 'var(--san)', fontSize: 13, fontWeight: 800, letterSpacing: '.3em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 8 }}>ORVIX</div>
        <div style={{ fontFamily: 'var(--ser)', fontSize: 28, fontWeight: 300, color: 'var(--ivory)' }}>Enter the universe.</div>
      </div>
      <SignIn
        appearance={{
          layout: { logoImageUrl: undefined, socialButtonsVariant: 'blockButton' },
          elements: {
            rootBox: { marginTop: 60 },
            card: { background: 'var(--chamber)', border: '1px solid rgba(194,154,64,.1)', boxShadow: '0 40px 80px rgba(0,0,0,.5)', borderRadius: 12 },
            headerTitle: { color: 'var(--ivory)', fontFamily: 'var(--ser)', fontWeight: 300, fontSize: 24 },
            headerSubtitle: { color: 'var(--fog)' },
            socialButtonsBlockButton: { background: 'var(--deep)', border: '1px solid rgba(255,255,255,.08)', color: 'var(--ivory)', borderRadius: 6 },
            socialButtonsBlockButtonText: { color: 'var(--ivory)' },
            dividerLine: { background: 'rgba(255,255,255,.08)' },
            dividerText: { color: 'var(--fog)' },
            formFieldInput: { background: 'var(--deep)', border: '1px solid rgba(255,255,255,.08)', color: 'var(--ivory)', borderRadius: 5 },
            formFieldLabel: { color: 'var(--fog)' },
            formButtonPrimary: { background: 'var(--gold)', borderRadius: 4, fontWeight: 700 },
            footerActionText: { color: 'var(--fog)' },
            footerActionLink: { color: 'var(--gold)' },
          },
        }}
      />
    </div>
  )
}
