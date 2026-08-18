'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <html lang="en">
      <body style={{ background: 'var(--bg-primary)', margin: 0, fontFamily: 'Inter, sans-serif' }}>
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center',
        }}>
          <div style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--color-error)', lineHeight: 1, marginBottom: 12 }}>
            Oops
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>
            Something went wrong
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 400, lineHeight: 1.6, marginBottom: 28 }}>
            An unexpected error occurred. You can try refreshing or go back to the homepage.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={reset} className="btn btn-primary">Try Again</button>
            <Link href="/" className="btn btn-ghost">Go Home</Link>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <pre style={{ marginTop: 24, fontSize: '0.72rem', color: 'var(--color-error)', maxWidth: 600, overflowX: 'auto', textAlign: 'left' }}>
              {error.message}
            </pre>
          )}
        </div>
      </body>
    </html>
  );
}
