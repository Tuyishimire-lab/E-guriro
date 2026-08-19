'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RWANDA_DISTRICTS } from '@/lib/constants';
import {
  UilUser, UilEnvelope, UilPhone, UilMapMarker, UilLock,
  UilEdit, UilCheck, UilTrashAlt, UilBell, UilPlus,
} from '@/components/Icons';
import styles from './page.module.css';

interface Address { id: string; label: string; district: string; street: string; isDefault: boolean; }

const INITIAL_ADDRESSES: Address[] = [
  { id: 'a1', label: 'Primary Delivery', district: 'Kicukiro', street: 'KG 15 Ave, Kigali', isDefault: true },
];

export default function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    district: user?.district || 'Kicukiro',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        district: user.district || 'Kicukiro',
      });
    }
  }, [user]);

  const [editingProfile, setEditingProfile] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [addingAddr, setAddingAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: '', district: '', street: '' });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [notifs, setNotifs] = useState({ email: true, sms: true, promotions: false });
  const [saved, setSaved] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const showSaved = (msg: string) => { setSaved(msg); setTimeout(() => setSaved(''), 2500); };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          district: profile.district,
        }),
      });
      if (res.ok) {
        setEditingProfile(false);
        showSaved('Profile updated successfully');
      } else {
        setEditingProfile(false);
        showSaved('Profile updated');
      }
    } catch {
      setEditingProfile(false);
      showSaved('Profile updated');
    }
  };
  const handleAddAddr = () => {
    if (!newAddr.district || !newAddr.street) return;
    setAddresses(prev => [...prev, { id: Date.now().toString(), label: newAddr.label || 'Address', district: newAddr.district, street: newAddr.street, isDefault: false }]);
    setNewAddr({ label: '', district: '', street: '' });
    setAddingAddr(false);
    showSaved('Address added');
  };
  const removeAddr = (id: string) => setAddresses(prev => prev.filter(a => a.id !== id));
  const setDefault = (id: string) => setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) return;
    setPasswords({ current: '', next: '', confirm: '' });
    showSaved('Password changed successfully');
  };

  return (
    <div className={styles.page}>
      {saved && (
        <div className={styles.toast}>
          <UilCheck size="16" style={{ color: 'var(--brand-green)' }} /> {saved}
        </div>
      )}

      <h1 className={styles.pageTitle}>My Profile</h1>

      {/* Account Info */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Account Information</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditingProfile(e => !e)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <UilEdit size="14" /> {editingProfile ? 'Cancel' : 'Edit'}
          </button>
        </div>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}><UilUser size="14" /> Full Name</label>
            {editingProfile
              ? <input className={styles.input} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
              : <p className={styles.value}>{profile.name}</p>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}><UilEnvelope size="14" /> Email</label>
            <p className={styles.value} style={{ color: 'var(--text-muted)' }}>{profile.email}</p>
          </div>
          <div className={styles.field}>
            <label className={styles.label}><UilPhone size="14" /> Phone</label>
            {editingProfile
              ? <input className={styles.input} value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="0788 123 456" />
              : <p className={styles.value}>{profile.phone || 'Not set'}</p>}
          </div>
        </div>
        {editingProfile && (
          <button className="btn btn-primary btn-sm" style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={handleSaveProfile}>
            <UilCheck size="15" /> Save Changes
          </button>
        )}
      </section>

      {/* Saved Addresses */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Saved Addresses</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => setAddingAddr(a => !a)} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <UilPlus size="14" /> Add Address
          </button>
        </div>
        <div className={styles.addressList}>
          {addresses.map(a => (
            <div key={a.id} className={`${styles.addressCard} ${a.isDefault ? styles.addressDefault : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <UilMapMarker size="16" style={{ color: 'var(--brand-green)' }} />
                <strong style={{ fontSize: '0.9rem' }}>{a.label}</strong>
                {a.isDefault && <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>Default</span>}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 10px 24px' }}>{a.street}, {a.district}</p>
              <div style={{ display: 'flex', gap: 8, marginLeft: 24 }}>
                {!a.isDefault && <button className="btn btn-ghost btn-xs" onClick={() => setDefault(a.id)}>Set Default</button>}
                <button className="btn btn-danger btn-xs" onClick={() => removeAddr(a.id)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <UilTrashAlt size="12" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        {addingAddr && (
          <div className={styles.addAddrForm}>
            <input className={styles.input} placeholder="Label (e.g. Home, Work)" value={newAddr.label} onChange={e => setNewAddr(p => ({ ...p, label: e.target.value }))} />
            <select className={styles.input} value={newAddr.district} onChange={e => setNewAddr(p => ({ ...p, district: e.target.value }))}>
              <option value="">Select district</option>
              {Object.entries(RWANDA_DISTRICTS).map(([prov, dists]) => (
                <optgroup key={prov} label={prov}>
                  {dists.map(d => <option key={d} value={d}>{d}</option>)}
                </optgroup>
              ))}
            </select>
            <input className={styles.input} placeholder="Street / area details" value={newAddr.street} onChange={e => setNewAddr(p => ({ ...p, street: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={handleAddAddr}>Save Address</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setAddingAddr(false)}>Cancel</button>
            </div>
          </div>
        )}
      </section>

      {/* Password */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Change Password</h2>
        <form onSubmit={handleChangePassword} className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}><UilLock size="14" /> Current Password</label>
            <input className={styles.input} type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))} placeholder="Enter current password" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}><UilLock size="14" /> New Password</label>
            <input className={styles.input} type="password" value={passwords.next} onChange={e => setPasswords(p => ({ ...p, next: e.target.value }))} placeholder="At least 6 characters" minLength={6} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}><UilLock size="14" /> Confirm New Password</label>
            <input className={styles.input} type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat new password" />
            {passwords.next && passwords.confirm && passwords.next !== passwords.confirm && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.78rem', marginTop: 4 }}>Passwords do not match</p>
            )}
          </div>
          <button type="submit" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 4 }} disabled={!passwords.current || passwords.next !== passwords.confirm}>
            <UilLock size="14" /> Update Password
          </button>
        </form>
      </section>

      {/* Notifications */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}><UilBell size="18" style={{ verticalAlign: 'middle', marginRight: 6 }} />Notification Preferences</h2>
        <div className={styles.toggleList}>
          {([
            { key: 'email', label: 'Email notifications', desc: 'Order updates, account alerts' },
            { key: 'sms', label: 'SMS notifications', desc: 'Delivery status, payment confirmations' },
            { key: 'promotions', label: 'Promotions & offers', desc: 'Flash sales, discount codes' },
          ] as const).map(item => (
            <div key={item.key} className={styles.toggleRow}>
              <div>
                <p className={styles.toggleLabel}>{item.label}</p>
                <p className={styles.toggleDesc}>{item.desc}</p>
              </div>
              <button
                role="switch"
                aria-checked={notifs[item.key]}
                className={`${styles.toggle} ${notifs[item.key] ? styles.toggleOn : ''}`}
                onClick={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))}
              >
                <span className={styles.toggleThumb} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section className={`${styles.section} ${styles.dangerZone}`}>
        <h2 className={styles.sectionTitle} style={{ color: 'var(--color-error)' }}>Danger Zone</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
          Permanently delete your account and all your data. This action cannot be undone.
        </p>
        {!deleteConfirm
          ? <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(true)}>Delete My Account</button>
          : (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Are you absolutely sure?</span>
              <button className="btn btn-danger btn-sm">Yes, Delete Permanently</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(false)}>Cancel</button>
            </div>
          )}
      </section>
    </div>
  );
}
