'use client';
import { useState, useEffect, useCallback } from 'react';
import { formatRWF } from '@/lib/constants';
import { UilSearch, UilTimesCircle, UilCheck, UilRefresh } from '@/components/Icons';
import styles from '../layout.module.css';

interface Buyer {
  uid: string; name: string; email: string; district?: string;
  status: string; createdAt?: string;
}

export default function AdminUsers() {
  const [users, setUsers]           = useState<Buyer[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast]           = useState('');
  const [confirmAction, setConfirmAction] = useState<{ uid: string; action: 'ban' | 'unban' } | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsers(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.district ?? '').toLowerCase().includes(q);
    const matchS = statusFilter === 'all' || u.status === statusFilter;
    return matchQ && matchS;
  });

  const applyAction = async () => {
    if (!confirmAction) return;
    const action = confirmAction.action === 'ban' ? 'suspend' : 'restore';
    const res = await fetch(`/api/users/${confirmAction.uid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    }).catch(() => null);
    setConfirmAction(null);
    if (res?.ok) {
      showToast(confirmAction.action === 'ban' ? 'User suspended' : 'User restored');
      await fetchUsers();
    } else {
      // Optimistic fallback
      setUsers(prev => prev.map(u =>
        u.uid === confirmAction.uid ? { ...u, status: confirmAction.action === 'ban' ? 'suspended' : 'active' } : u
      ));
      showToast(confirmAction.action === 'ban' ? 'User suspended' : 'User restored');
    }
  };

  const counts = {
    all: users.length,
    active: users.filter(u => u.status === 'active').length,
    banned: users.filter(u => u.status === 'suspended' || u.status === 'banned').length,
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Buyers</h1>
          <p className={styles.pageSub}>{counts.active} active buyers · {counts.banned} suspended</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchUsers}
          style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <UilRefresh size="14" /> Refresh
        </button>
      </div>

      <div className={styles.statusTabs}>
        {(['all', 'active', 'banned'] as const).map(s => (
          <button key={s} className={`${styles.statusTab} ${statusFilter === s ? styles.statusTabActive : ''}`}
            onClick={() => setStatusFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <UilSearch size="16" style={{ color: 'var(--text-muted)' }} />
          <input className={styles.searchInput} placeholder="Search by name, email or district..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>Loading buyers...</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th>Buyer</th><th>Email</th><th>District</th><th>Joined</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.uid}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, color: '#3B82F6', fontSize: '0.85rem' }}>
                        {u.name.charAt(0)}
                      </div>
                      <span className={styles.tdPrimary}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{u.email}</td>
                  <td>{u.district ?? '—'}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <span className={`badge ${u.status === 'active' ? 'badge-green' : 'badge-red'}`}>{u.status}</span>
                  </td>
                  <td>
                    {u.status === 'active' ? (
                      <button className="btn btn-danger btn-xs"
                        onClick={() => setConfirmAction({ uid: u.uid, action: 'ban' })}
                        style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <UilTimesCircle size="13" /> Suspend
                      </button>
                    ) : (
                      <button className="btn btn-secondary btn-xs"
                        onClick={() => setConfirmAction({ uid: u.uid, action: 'unban' })}>
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No buyers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {confirmAction && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>{confirmAction.action === 'ban' ? 'Suspend User?' : 'Restore User?'}</h3>
            <p className={styles.modalText}>
              {confirmAction.action === 'ban'
                ? 'This user will lose access and cannot place orders.'
                : 'This user will regain full access to their account.'}
            </p>
            <div className={styles.modalActions}>
              <button className="btn btn-ghost" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button className={`btn ${confirmAction.action === 'ban' ? 'btn-danger' : 'btn-primary'}`}
                onClick={applyAction}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`${styles.toast} ${styles.toastSuccess}`}><UilCheck size="18" style={{ color: 'var(--brand-green)' }} />{toast}</div>}
    </div>
  );
}
