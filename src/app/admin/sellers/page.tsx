'use client';
import { useState } from 'react';
import { formatRWF, MOCK_SELLERS } from '@/lib/constants';
import { UilSearch, UilCheckCircle, UilTimesCircle, UilEye, UilStore, UilCheck, UilUserCheck } from '@/components/Icons';
import styles from '../layout.module.css';

const INITIAL_SELLERS = [
  { id: 's1', name: 'TechHub Kigali', email: 'tech@kigali.rw', district: 'Gasabo', products: 45, revenue: 4850000, status: 'active', joined: '2026-01-15', rating: 4.8 },
  { id: 's2', name: 'Ikawa Electronics', email: 'ikawa@rw.com', district: 'Kicukiro', products: 12, revenue: 2100000, status: 'active', joined: '2026-02-20', rating: 4.5 },
  { id: 's3', name: 'Rwanda Tech Hub', email: 'rteh@rw.com', district: 'Nyagatare', products: 88, revenue: 7800000, status: 'pending', joined: '2026-08-01', rating: 0 },
  { id: 's4', name: 'Kigali Gadgets', email: 'kgadgets@rw.com', district: 'Nyarugenge', products: 34, revenue: 3200000, status: 'suspended', joined: '2025-12-10', rating: 3.2 },
  { id: 's5', name: 'Mobile World RW', email: 'mworld@rw.com', district: 'Musanze', products: 22, revenue: 1800000, status: 'pending', joined: '2026-08-10', rating: 0 },
  { id: 's6', name: 'SmartPhone City', email: 'spcity@rw.com', district: 'Huye', products: 67, revenue: 6100000, status: 'active', joined: '2026-03-05', rating: 4.6 },
];

const STATUS_BADGE: Record<string, string> = { active: 'badge-green', pending: 'badge-gold', suspended: 'badge-red' };

export default function AdminSellers() {
  const [sellers, setSellers] = useState(INITIAL_SELLERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: string } | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = sellers.filter(s => {
    const q = search.toLowerCase();
    return (s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.district.toLowerCase().includes(q))
      && (statusFilter === 'all' || s.status === statusFilter);
  });

  const applyAction = (id: string, action: string) => {
    setSellers(prev => prev.map(s => {
      if (s.id !== id) return s;
      if (action === 'approve') return { ...s, status: 'active' };
      if (action === 'suspend') return { ...s, status: 'suspended' };
      if (action === 'restore') return { ...s, status: 'active' };
      if (action === 'delete') return { ...s, status: 'suspended' };
      return s;
    }));
    setConfirmAction(null);
    const msgs: Record<string, string> = { approve: 'Seller approved', suspend: 'Seller suspended', restore: 'Seller restored', delete: 'Seller removed' };
    showToast(msgs[action] || 'Action applied');
  };

  const counts = { all: sellers.length, active: sellers.filter(s => s.status === 'active').length, pending: sellers.filter(s => s.status === 'pending').length, suspended: sellers.filter(s => s.status === 'suspended').length };

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Sellers</h1>
          <p className={styles.pageSub}>{counts.active} active &bull; {counts.pending} pending approval &bull; {counts.suspended} suspended</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className={styles.statusTabs}>
        {(['all', 'active', 'pending', 'suspended'] as const).map(s => (
          <button key={s} className={`${styles.statusTab} ${statusFilter === s ? styles.statusTabActive : ''}`} onClick={() => setStatusFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)} <span style={{ opacity: 0.7, fontSize: '0.72rem' }}>({counts[s]})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <UilSearch size="16" style={{ color: 'var(--text-muted)' }} />
          <input className={styles.searchInput} placeholder="Search by name, email or district..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr>
            <th>Seller</th><th>Email</th><th>District</th><th>Products</th><th>Revenue</th><th>Rating</th><th>Joined</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'rgba(0,165,80,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <UilStore size="16" style={{ color: 'var(--brand-green)' }} />
                    </div>
                    <span className={styles.tdPrimary}>{s.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: '0.82rem' }}>{s.email}</td>
                <td>{s.district}</td>
                <td>{s.products}</td>
                <td className={styles.tdAmount}>{formatRWF(s.revenue)}</td>
                <td style={{ color: '#F59E0B' }}>{s.rating > 0 ? `★ ${s.rating}` : <span style={{ color: 'var(--text-muted)' }}>N/A</span>}</td>
                <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.joined}</td>
                <td><span className={`badge ${STATUS_BADGE[s.status]}`}>{s.status}</span></td>
                <td>
                  <div className={styles.actionBtns}>
                    {s.status === 'pending' && (
                      <button className="btn btn-primary btn-xs" onClick={() => setConfirmAction({ id: s.id, action: 'approve' })} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <UilCheckCircle size="13" /> Approve
                      </button>
                    )}
                    {s.status === 'active' && (
                      <button className="btn btn-danger btn-xs" onClick={() => setConfirmAction({ id: s.id, action: 'suspend' })} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <UilTimesCircle size="13" /> Suspend
                      </button>
                    )}
                    {s.status === 'suspended' && (
                      <button className="btn btn-secondary btn-xs" onClick={() => setConfirmAction({ id: s.id, action: 'restore' })}>Restore</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm modal */}
      {confirmAction && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>
              {confirmAction.action === 'approve' ? 'Approve Seller?' : confirmAction.action === 'suspend' ? 'Suspend Seller?' : 'Restore Seller?'}
            </h3>
            <p className={styles.modalText}>
              {confirmAction.action === 'approve' && 'This seller will be able to list products and accept orders immediately.'}
              {confirmAction.action === 'suspend' && 'The seller shop will be hidden and they will not be able to receive orders.'}
              {confirmAction.action === 'restore' && 'The seller will be reinstated and their shop will be visible again.'}
            </p>
            <div className={styles.modalActions}>
              <button className="btn btn-ghost" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button
                className={`btn ${confirmAction.action === 'approve' ? 'btn-primary' : confirmAction.action === 'suspend' ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => applyAction(confirmAction.id, confirmAction.action)}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`${styles.toast} ${styles.toastSuccess}`}><UilCheck size="18" style={{ color: 'var(--brand-green)' }} />{toast}</div>}
    </div>
  );
}

