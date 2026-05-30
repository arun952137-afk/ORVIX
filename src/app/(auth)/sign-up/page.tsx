'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Sign up = sign in with credentials (stores in session)
    const res = await signIn('credentials', { email, password, redirect: false })
    if (!res?.error) window.location.href = '/dashboard'
    else setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--void)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ fontFamily:'system-ui', fontSize:11, fontWeight:900, letterSpacing:'.4em', color:'var(--gold)', textTransform:'uppercase', marginBottom:40 }}>ORVIX</div>

      <div style={{ width:'100%', maxWidth:380, background:'var(--chamber)', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:32 }}>
        <h2 style={{ fontFamily:'Georgia,serif', fontSize:24, fontWeight:400, color:'var(--ivory)', marginBottom:6 }}>Begin your ascent</h2>
        <p style={{ fontSize:13, color:'var(--fog)', marginBottom:24 }}>Create your free ORVIX account</p>

        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
          <button className="btn btn-ghost w-full" onClick={() => signIn('google', { callbackUrl:'/dashboard' })}>
            Continue with Google
          </button>
          <button className="btn btn-ghost w-full" onClick={() => signIn('github', { callbackUrl:'/dashboard' })}>
            Continue with GitHub
          </button>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <div style={{ flex:1, height:1, background:'rgba(255,255,255,.06)' }}/>
          <span style={{ fontSize:11, color:'var(--fog)' }}>or email</span>
          <div style={{ flex:1, height:1, background:'rgba(255,255,255,.06)' }}/>
        </div>

        <form onSubmit={handleSignUp}>
          <div style={{ marginBottom:12 }}>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div style={{ marginBottom:20 }}>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required minLength={6} />
          </div>
          <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ padding:'13px' }}>
            {loading ? 'Creating account…' : 'Create Free Account'}
          </button>
        </form>

        <p style={{ fontSize:12, color:'var(--fog)', textAlign:'center', marginTop:16 }}>
          Already a creator? <a href="/sign-in" style={{ color:'var(--gold)' }}>Sign in</a>
        </p>
      </div>
    </div>
  )
}
