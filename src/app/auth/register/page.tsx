'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RWANDA_DISTRICTS } from '@/lib/constants';
import { UilUserPlus, UilUser, UilStore, UilEnvelope, UilPhone, UilLock, UilMapMarker } from '@/components/Icons';
import styles from '../login/page.module.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as 'buyer' | 'seller') || 'buyer';

  const [role, setRole] = useState<'buyer' | 'seller'>(initialRole);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', shopName: '', district: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ maxWidth: 500 }}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>E-<span>guriro</span></Link>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join Rwanda's fastest-growing marketplace</p>
        </div>

        {/* Role Selection */}
        <div className={styles.roleSelector}>
          {[
            { value: 'buyer', icon: <UilUser size="32" />, label: 'Buyer', desc: 'Shop for products' },
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

        <form onSubmit={handleSubmit} className={styles.form} style={{ marginTop: 24 }}>
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
            disabled={loading}
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
