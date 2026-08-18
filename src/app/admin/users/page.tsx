'use client';
import { useState } from 'react';
import { formatRWF } from '@/lib/constants';
import { UilSearch, UilTimesCircle, UilCheck, UilUser } from '@/components/Icons';
import styles from '../layout.module.css';

const MOCK_BUYERS = [
  { id: 'u1', name: 'Amina Uwimana', email: 'amina@gmail.com', district: 'Gasabo', orders: 14, spent: 2450000, joined: '2026-01-10', status: 'active' },
  { id: 'u2', name: 'Jean Kamanzi', email: 'jean.k@gmail.com', district: 'Kicukiro', orders: 7, spent: 890000, joined: '2026-03-22', status: 'active' },
  { id: 'u3', name: 'Alice Mukamana', email: 'alice.m@yahoo.com', district: 'Nyarugenge', orders: 3, spent: 155000, joined: '2026-06-01', status: 'active' },
  { id: 'u4', name: 'David Rutaganda', email: 'david.r@outlook.com', district: 'Musanze', orders: 22, spent: 6800000, joined: '2025-11-05', status: 'active' },
  { id: 'u5', name: 'Grace Niyonzima', email: 'grace.n@gmail.com', district: 'Huye', orders: 1, spent: 380000, joined: '2026-08-12', status: 'active' },
  { id: 'u6', name: 'Patrick Habimana', email: 'p.habi@gmail.com', district: 'Rubavu', orders: 8, spent: 1200000, joined: '2026-04-18', status: 'banned' },
  { id: 'u7', name: 'Marie Uwase', email: 'marie.u@rw.com', district: 'Rwamagana', orders: 5, spent: 720000, joined: '2026-05-30', status: 'active' },
  { id: 'u8', name: 'Emmanuel Ntwali', email: 'e.ntwali@gmail.com', district: 'Nyagatare', orders: 11, spent: 3100000, joined: '2026-02-14', status: 'active' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState(MOCK_BUYERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'ban' | 'unban' } | null>(null);
  const [banReason, setBanReason] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.district.toLowerCase().includes(q);
    const matchS = statusFilter === 'all' || u.status === statusFilter;
    return matchQ && matchS;
  });

  const applyAction = () => {
    if (!confirmAction) return;
    setUsers(prev => prev.map(u =>
      u.id === confirmAction.id ? { ...u, status: confirmAction.action === 'ban' ? 'banned' : 'active' } : u
    ));
    setConfirmAction(null);
    setBanReason('');
    showToast(confirmAction.action === 'ban' ? 'User banned' : 'User unbanned');
  };

  const counts = { all: users.length, active: users.filter(u => u.status === 'active').length, banned: users.filter(u => u.status === 'banned').length };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Buyers</h1>
          <p className={styles.pageSub}>{counts.active} active buyers &bull; {counts.banned} banned</p>
        </div>
      </div>

      <div className={styles.statusTabs}>
        {(['all', 'active', 'banned'] as const).map(s => (
          <button key={s} className={`${styles.statusTab} ${statusFilter === s ? styles.statusTabActive : ''}`} onClick={() => setStatusFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <UilSearch size="16" style={{ color: 'var(--text-muted)' }} />
          <input className={styles.searchInput} placeholder="Search by name, email or district..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr>
            <th>Buyer</th><th>Email</th><th>District</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, color: '#3B82F6', fontSize: '0.85rem' }}>
                      {u.name.charAt(0)}
                    </div>
                    <span className={styles.tdPrimary}>{u.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: '0.82rem' }}>{u.email}</td>
                <td>{u.district}</td>
                <td>{u.orders}</td>
                <td className={styles.tdAmount}>{formatRWF(u.spent)}</td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{u.joined}</td>
                <td>
                  <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-red'}`}>{u.status}</span>
                </td>
                <td>
                  {u.status === 'active' ? (
                    <button className="btn btn-danger btn-xs" onClick={() => setConfirmAction({ id: u.id, action: 'ban' })} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <UilTimesCircle size="13" /> Ban
                    </button>
                  ) : (
                    <button className="btn btn-secondary btn-xs" onClick={() => setConfirmAction({ id: u.id, action: 'unban' })}>Unban</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmAction && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>{confirmAction.action === 'ban' ? 'Ban User?' : 'Unban User?'}</h3>
            <p className={styles.modalText}>
              {confirmAction.action === 'ban'
                ? 'This user will lose access to their account and cannot place orders.'
                : 'This user will regain full access to their account.'}
            </p>
            {confirmAction.action === 'ban' && (
              <div className={styles.formGroup} style={{ marginBottom: 16 }}>
                <label className={styles.formLabel}>Reason for ban (optional)</label>
                <input className={styles.formInput} placeholder="e.g. Fraudulent activity" value={banReason} onChange={e => setBanReason(e.target.value)} />
              </div>
            )}
            <div className={styles.modalActions}>
              <button className="btn btn-ghost" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button className={`btn ${confirmAction.action === 'ban' ? 'btn-danger' : 'btn-primary'}`} onClick={applyAction}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`${styles.toast} ${styles.toastSuccess}`}><UilCheck size="18" style={{ color: 'var(--brand-green)' }} />{toast}</div>}
    </div>
  );
}

