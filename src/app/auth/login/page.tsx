'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UilSignInAlt, UilEnvelope, UilLock, UilUser, UilStore, UilShield } from '@/components/Icons';
import styles from './page.module.css';

// Google "G" logo — official brand colours, no emoji
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push(redirect);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      const messages: Record<string, string> = {
        'auth/user-not-found':         'No account found with this email.',
        'auth/wrong-password':         'Incorrect password. Please try again.',
        'auth/invalid-credential':     'Incorrect email or password.',
        'auth/invalid-email':          'Please enter a valid email address.',
        'auth/too-many-requests':      'Too many failed attempts. Please try again later.',
        'auth/user-disabled':          'This account has been suspended.',
        'auth/network-request-failed': 'Network error. Check your connection.',
      };
      setError(messages[code] ?? (err instanceof Error ? err.message : 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push(redirect);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      setError('Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const demoLogins = [
    { label: 'Login as Buyer',  email: 'buyer@rwandabuy.rw',  color: 'var(--color-info)',  icon: <UilUser   size="15" /> },
    { label: 'Login as Seller', email: 'seller@rwandabuy.rw', color: 'var(--brand-green)', icon: <UilStore  size="15" /> },
    { label: 'Login as Admin',  email: 'admin@rwandabuy.rw',  color: 'var(--color-error)', icon: <UilShield size="15" /> },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>Rwanda<span>Buy</span></Link>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your account to continue shopping</p>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          id="google-login-btn"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            gap:            10,
            width:          '100%',
            padding:        '11px 16px',
            background:     'var(--bg-card)',
            border:         '1px solid var(--border)',
            borderRadius:   'var(--radius-md)',
            cursor:         'pointer',
            fontSize:       '0.9rem',
            fontWeight:     600,
            color:          'var(--text-primary)',
            transition:     'all 0.18s ease',
            marginBottom:   16,
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#4285F4')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          {googleLoading
            ? <span style={{ width: 16, height: 16, border: '2px solid var(--border)', borderTopColor: '#4285F4', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
            : <GoogleIcon />
          }
          {googleLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div className={styles.divider}><span>or sign in with email</span></div>

        {/* Demo Logins (Development only — stripped in production) */}
        {process.env.NODE_ENV !== 'production' && (
          <div className={styles.demoSection}>
            <p className={styles.demoLabel}>Quick Demo Login (Dev Only):</p>
            <div className={styles.demoBtns}>
              {demoLogins.map(d => (
                <button
                  key={d.email}
                  className={styles.demoBtn}
                  style={{ borderColor: d.color, color: d.color }}
                  onClick={() => { setEmail(d.email); setPassword('demo123'); }}
                  type="button"
                  id={`demo-${d.email.split('@')[0]}`}
                >
                  {d.icon}
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="input-group">
            <label className="input-label" htmlFor="login-email">
              <UilEnvelope size="15" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Email Address
            </label>
            <input
              id="login-email" type="email" className="input"
              placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)} required autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="login-password">
              <UilLock size="15" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Password
            </label>
            <input
              id="login-password" type="password" className="input"
              placeholder="Enter your password" value={password}
              onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
            />
          </div>

          <div className={styles.forgotRow}>
            <Link href="/auth/forgot-password" className={styles.forgot}>Forgot password?</Link>
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-lg btn-full ${loading ? styles.loading : ''}`}
            disabled={loading || googleLoading}
            id="login-submit-btn"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <UilSignInAlt size="18" />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className={styles.switchText}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className={styles.switchLink}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}
