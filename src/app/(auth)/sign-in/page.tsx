'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) { setError('Invalid email or password'); setLoading(false) }
    else window.location.href = '/dashboard'
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--void)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ fontFamily:'system-ui', fontSize:11, fontWeight:900, letterSpacing:'.4em', color:'var(--gold)', textTransform:'uppercase', marginBottom:40 }}>ORVIX</div>

      <div style={{ width:'100%', maxWidth:380, background:'var(--chamber)', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:32 }}>
        <h2 style={{ fontFamily:'Georgia,serif', fontSize:24, fontWeight:400, color:'var(--ivory)', marginBottom:6 }}>Welcome back</h2>
        <p style={{ fontSize:13, color:'var(--fog)', marginBottom:24 }}>Sign in to your creator universe</p>

        {/* Social logins */}
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

        {error && <div style={{ padding:'10px 14px', background:'rgba(170,24,40,.08)', border:'1px solid rgba(170,24,40,.2)', borderRadius:6, marginBottom:16, fontSize:13, color:'#ff8080' }}>{error}</div>}

        <form onSubmit={handleEmail}>
          <div style={{ marginBottom:12 }}>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div style={{ marginBottom:20 }}>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary w-full" type="submit" disabled={loading} style={{ padding:'13px' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ fontSize:12, color:'var(--fog)', textAlign:'center', marginTop:16 }}>
          No account? <a href="/sign-up" style={{ color:'var(--gold)' }}>Sign up free</a>
        </p>
      </div>
    </div>
  )
}
