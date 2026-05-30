import Link from 'next/link'

export const metadata = { title: 'Library — ORVIX' }

export default function LibraryPage() {
  return (
    <div className="page-content fade-in">
      <div className="mb-6" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 400, color: 'var(--ivory)', marginBottom: 4 }}>
            My Library
          </h1>
          <p style={{ fontSize: 13, color: 'var(--fog)' }}>All your generated scripts and videos</p>
        </div>
        <Link href="/create" className="btn btn-primary">✦ New Video</Link>
      </div>

      <div style={{ padding: '60px 0', textAlign: 'center', border: '1px dashed rgba(255,255,255,.06)', borderRadius: 12 }}>
        <div style={{ fontSize: 32, marginBottom: 12, opacity: .3 }}>◫</div>
        <div style={{ fontSize: 15, color: 'var(--iron)', marginBottom: 8 }}>Library is empty</div>
        <div style={{ fontSize: 13, color: 'var(--fog)', marginBottom: 24, lineHeight: 1.6, maxWidth: 320, margin: '0 auto 24px' }}>
          Create your first video and it will appear here. Scripts, voiceovers, and video packages are all saved automatically.
        </div>
        <Link href="/create" className="btn btn-primary">Create First Video</Link>
      </div>
    </div>
  )
}
