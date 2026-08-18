'use client';
import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UilEnvelope, UilArrowLeft, UilCheckCircle } from '@/components/Icons';
import styles from '../login/page.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('');
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) { setError('Auth service not available'); return; }
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      const messages: Record<string, string> = {
        'auth/user-not-found':         'No account found with this email address.',
        'auth/invalid-email':          'Please enter a valid email address.',
        'auth/too-many-requests':      'Too many requests. Please try again later.',
        'auth/network-request-failed': 'Network error. Check your connection.',
      };
      setError(messages[code] ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>Rwanda<span>Buy</span></Link>
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>Enter your email and we'll send you a reset link</p>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ color: 'var(--brand-green)', marginBottom: 16 }}>
              <UilCheckCircle size="48" />
            </div>
            <h2 style={{ margin: '0 0 8px' }}>Check your inbox</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
              A password reset link has been sent to <strong>{email}</strong>.
              Check your spam folder if you don't see it within a minute.
            </p>
            <Link href="/auth/login" className="btn btn-primary btn-full" id="back-to-login-btn">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="input-group">
              <label className="input-label" htmlFor="reset-email">
                <UilEnvelope size="15" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Email Address
              </label>
              <input
                id="reset-email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg btn-full ${loading ? styles.loading : ''}`}
              disabled={loading}
              id="reset-submit-btn"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className={styles.switchText}>
          <Link href="/auth/login" className={styles.switchLink} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <UilArrowLeft size="14" /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
