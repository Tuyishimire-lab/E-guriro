'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RWANDA_DISTRICTS } from '@/lib/constants';
import { UilUserPlus, UilUser, UilStore, UilEnvelope, UilPhone, UilLock, UilMapMarker } from '@/components/Icons';
import styles from '../login/page.module.css';

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

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as 'buyer' | 'seller') || 'buyer';

  const [role, setRole] = useState<'buyer' | 'seller'>(initialRole);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', shopName: '', district: '' });
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({ ...form, role });
      router.push(role === 'seller' ? '/seller/dashboard' : '/');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      const messages: Record<string, string> = {
        'auth/email-already-in-use':   'An account with this email already exists.',
        'auth/invalid-email':          'Please enter a valid email address.',
        'auth/weak-password':          'Password must be at least 6 characters.',
        'auth/network-request-failed': 'Network error. Check your connection.',
      };
      setError(messages[code] ?? (err instanceof Error ? err.message : 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle(); // creates buyer profile if first sign-in
      router.push('/');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
      setError('Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ maxWidth: 500 }}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>Rwanda<span>Buy</span></Link>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join Rwanda&apos;s fastest-growing marketplace</p>
        </div>

        {/* Role Selection */}
        <div className={styles.roleSelector}>
          {[
            { value: 'buyer',  icon: <UilUser  size="32" />, label: 'Buyer',  desc: 'Shop for products' },
            { value: 'seller', icon: <UilStore size="32" />, label: 'Seller', desc: 'Sell your products' },
          ].map(r => (
            <div
              key={r.value}
              className={`${styles.roleCard} ${role === r.value ? styles.roleCardActive : ''}`}
              onClick={() => setRole(r.value as 'buyer' | 'seller')}
              id={`role-${r.value}`}
            >
              <span className={styles.roleIcon}>{r.icon}</span>
              <span className={styles.roleLabel}>{r.label}</span>
              <span className={styles.roleDesc}>{r.desc}</span>
            </div>
          ))}
        </div>

        {/* Google Sign-Up (buyer shortcut) */}
        {role === 'buyer' && (
          <>
            <button
              type="button"
              id="google-register-btn"
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
                marginTop:      20,
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#4285F4')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              {googleLoading
                ? <span style={{ width: 16, height: 16, border: '2px solid var(--border)', borderTopColor: '#4285F4', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                : <GoogleIcon />
              }
              {googleLoading ? 'Signing up...' : 'Continue with Google'}
            </button>
            <div className={styles.divider} style={{ margin: '16px 0 0' }}><span>or fill the form below</span></div>
          </>
        )}

        <form onSubmit={handleSubmit} className={styles.form} style={{ marginTop: role === 'buyer' ? 12 : 24 }}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="input-group">
            <label className="input-label" htmlFor="reg-name">
              <UilUser size="14" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Full Name
            </label>
            <input id="reg-name" type="text" className="input" placeholder="e.g. Amina Uwase" value={form.name} onChange={set('name')} required />
          </div>

          {role === 'seller' && (
            <div className="input-group">
              <label className="input-label" htmlFor="reg-shop">
                <UilStore size="14" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Shop Name
              </label>
              <input id="reg-shop" type="text" className="input" placeholder="e.g. TechHub Kigali" value={form.shopName} onChange={set('shopName')} required />
            </div>
          )}

          <div className="input-group">
            <label className="input-label" htmlFor="reg-email">
              <UilEnvelope size="14" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Email Address
            </label>
            <input id="reg-email" type="email" className="input" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="reg-phone">
              <UilPhone size="14" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Phone Number (Rwanda)
            </label>
            <input id="reg-phone" type="tel" className="input" placeholder="0788 123 456" value={form.phone} onChange={set('phone')} />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="reg-district">
              <UilMapMarker size="14" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              District
            </label>
            <select id="reg-district" className="select" value={form.district} onChange={set('district')}>
              <option value="">Select your district</option>
              {Object.entries(RWANDA_DISTRICTS).map(([province, districts]) => (
                <optgroup key={province} label={province}>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="reg-password">
              <UilLock size="14" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Password
            </label>
            <input id="reg-password" type="password" className="input" placeholder="At least 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-lg btn-full ${loading ? styles.loading : ''}`}
            disabled={loading || googleLoading}
            id="register-submit-btn"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <UilUserPlus size="18" />
            {loading ? 'Creating account...' : `Create ${role === 'seller' ? 'Seller' : 'Buyer'} Account`}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link href="/auth/login" className={styles.switchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
