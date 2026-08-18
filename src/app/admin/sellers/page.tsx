'use client';
import { useState, useEffect, useCallback } from 'react';
import { formatRWF } from '@/lib/constants';
import { UilSearch, UilCheckCircle, UilTimesCircle, UilStore, UilCheck, UilRefresh } from '@/components/Icons';
import styles from '../layout.module.css';

interface Seller {
  uid: string; name: string; email: string; shopName: string;
  district: string; totalProducts: number; totalRevenue: number;
  rating: number; status: string; approvedAt?: string;
}

const STATUS_BADGE: Record<string, string> = { active: 'badge-green', pending: 'badge-gold', suspended: 'badge-red', rejected: 'badge-red' };

export default function AdminSellers() {
  const [sellers, setSellers]           = useState<Seller[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast]               = useState('');
  const [confirmAction, setConfirmAction] = useState<{ uid: string; action: string } | null>(null);
  const [acting, setActing]             = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sellers');
      if (res.ok) setSellers(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSellers(); }, [fetchSellers]);

  const filtered = sellers.filter(s => {
    const q = search.toLowerCase();
    return (s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.district?.toLowerCase().includes(q))
      && (statusFilter === 'all' || s.status === statusFilter);
  });

  const applyAction = async (uid: string, action: string) => {
    setActing(true);
    try {
      const res = await fetch(`/api/sellers/${uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const msgs: Record<string, string> = {
          approve: 'Seller approved — email sent ✉️',
          suspend: 'Seller suspended',
          reject: 'Seller rejected — email sent ✉️',
        };
        showToast(msgs[action] || 'Action applied');
        await fetchSellers();
      } else {
        showToast('Action failed. Please try again.');
      }
    } finally {
      setActing(false);
      setConfirmAction(null);
    }
  };

  const counts = {
    all: sellers.length,
    active: sellers.filter(s => s.status === 'active').length,
    pending: sellers.filter(s => s.status === 'pending').length,
    suspended: sellers.filter(s => s.status === 'suspended').length,
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Sellers</h1>
          <p className={styles.pageSub}>{counts.active} active · {counts.pending} pending · {counts.suspended} suspended</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchSellers}
          style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <UilRefresh size="14" /> Refresh
        </button>
      </div>

      {/* Status tabs */}
      <div className={styles.statusTabs}>
        {(['all', 'active', 'pending', 'suspended'] as const).map(s => (
          <button key={s} className={`${styles.statusTab} ${statusFilter === s ? styles.statusTabActive : ''}`}
            onClick={() => setStatusFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}{' '}
            <span style={{ opacity: 0.7, fontSize: '0.72rem' }}>({counts[s]})</span>
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
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>Loading sellers...</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th>Seller</th><th>Email</th><th>District</th><th>Products</th>
              <th>Revenue</th><th>Rating</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.uid}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'rgba(0,165,80,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <UilStore size="16" style={{ color: 'var(--brand-green)' }} />
                      </div>
                      <span className={styles.tdPrimary}>{s.shopName || s.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{s.email}</td>
                  <td>{s.district}</td>
                  <td>{s.totalProducts ?? 0}</td>
                  <td className={styles.tdAmount}>{formatRWF(s.totalRevenue ?? 0)}</td>
                  <td style={{ color: '#F59E0B' }}>
                    {s.rating > 0 ? `★ ${s.rating}` : <span style={{ color: 'var(--text-muted)' }}>N/A</span>}
                  </td>
                  <td><span className={`badge ${STATUS_BADGE[s.status] || 'badge-blue'}`}>{s.status}</span></td>
                  <td>
                    <div className={styles.actionBtns}>
                      {s.status === 'pending' && (
                        <button className="btn btn-primary btn-xs"
                          onClick={() => setConfirmAction({ uid: s.uid, action: 'approve' })}
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <UilCheckCircle size="13" /> Approve
                        </button>
                      )}
                      {s.status === 'pending' && (
                        <button className="btn btn-danger btn-xs"
                          onClick={() => setConfirmAction({ uid: s.uid, action: 'reject' })}
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <UilTimesCircle size="13" /> Reject
                        </button>
                      )}
                      {s.status === 'active' && (
                        <button className="btn btn-danger btn-xs"
                          onClick={() => setConfirmAction({ uid: s.uid, action: 'suspend' })}
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <UilTimesCircle size="13" /> Suspend
                        </button>
                      )}
                      {s.status === 'suspended' && (
                        <button className="btn btn-secondary btn-xs"
                          onClick={() => applyAction(s.uid, 'approve')}>
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No sellers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm modal */}
      {confirmAction && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>
              {confirmAction.action === 'approve' ? 'Approve Seller?' :
               confirmAction.action === 'suspend' ? 'Suspend Seller?' : 'Reject Seller?'}
            </h3>
            <p className={styles.modalText}>
              {confirmAction.action === 'approve' && 'Seller will be verified and receive an approval email.'}
              {confirmAction.action === 'suspend' && 'Shop will be hidden. Seller will not receive orders.'}
              {confirmAction.action === 'reject'  && 'Application will be rejected. Seller will be notified by email.'}
            </p>
            <div className={styles.modalActions}>
              <button className="btn btn-ghost" onClick={() => setConfirmAction(null)} disabled={acting}>Cancel</button>
              <button
                className={`btn ${confirmAction.action === 'approve' ? 'btn-primary' : 'btn-danger'}`}
                onClick={() => applyAction(confirmAction.uid, confirmAction.action)}
                disabled={acting}>
                {acting ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`${styles.toast} ${styles.toastSuccess}`}><UilCheck size="18" style={{ color: 'var(--brand-green)' }} />{toast}</div>}
    </div>
  );
}
