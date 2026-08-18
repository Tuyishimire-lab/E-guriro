import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)', padding: '24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '7rem', fontWeight: 900, color: 'var(--brand-green)', lineHeight: 1, marginBottom: 8 }}>
        404
      </div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: 420, lineHeight: 1.6, marginBottom: 32 }}>
        The page you are looking for does not exist or has been moved.
        Let us get you back to shopping.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/" className="btn btn-primary">Back to Home</Link>
        <Link href="/products" className="btn btn-secondary">Browse Products</Link>
      </div>
      <p style={{ marginTop: 40, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        Rwanda<span style={{ color: 'var(--brand-green)' }}>Buy</span> — Rwanda's Electronics Marketplace
      </p>
    </div>
  );
}
