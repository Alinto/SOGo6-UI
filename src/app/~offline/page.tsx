import Link from 'next/link'

/**
 * Service-worker document fallback (no locale provider).
 * User-facing copy is English-only by design for this technical route.
 */
export default function OfflineFallbackRootPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '1.5rem',
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>You are offline</h1>
      <p style={{ maxWidth: '28rem', fontSize: '0.875rem', opacity: 0.75 }}>
        Reconnect or reopen SOGo after you have visited it online at least once.
      </p>
      <Link href="/" style={{ fontSize: '0.875rem' }}>
        Try again
      </Link>
    </main>
  )
}
