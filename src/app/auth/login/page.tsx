'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UilSignInAlt, UilEnvelope, UilLock, UilUser, UilStore, UilShield } from '@/components/Icons';
import styles from './page.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push(searchParams.get('redirect') || '/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    { label: 'Login as Buyer', email: 'buyer@eguriro.rw', color: 'var(--color-info)', icon: <UilUser size="15" /> },
    { label: 'Login as Seller', email: 'seller@eguriro.rw', color: 'var(--brand-green)', icon: <UilStore size="15" /> },
    { label: 'Login as Admin', email: 'admin@eguriro.rw', color: 'var(--color-error)', icon: <UilShield size="15" /> },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            E-<span>guriro</span>
          </Link>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your account to continue shopping</p>
        </div>

        {/* Demo Logins */}
        <div className={styles.demoSection}>
          <p className={styles.demoLabel}>Quick Demo Login:</p>
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

        <div className={styles.divider}><span>or enter manually</span></div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="input-group">
            <label className="input-label" htmlFor="login-email">
              <UilEnvelope size="15" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="login-password">
              <UilLock size="15" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="input"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className={styles.forgotRow}>
            <Link href="/auth/forgot-password" className={styles.forgot}>Forgot password?</Link>
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-lg btn-full ${loading ? styles.loading : ''}`}
            disabled={loading}
            id="login-submit-btn"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <UilSignInAlt size="18" />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className={styles.switchText}>
          Don't have an account?{' '}
          <Link href="/auth/register" className={styles.switchLink}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}
