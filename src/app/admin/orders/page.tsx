'use client';
import { useState, useEffect, useCallback } from 'react';
import { formatRWF } from '@/lib/constants';
import { UilSearch, UilCheck, UilTimes, UilRefresh } from '@/components/Icons';
import styles from '../layout.module.css';

interface Order {
  id: string; buyerName: string; sellerName?: string;
  items: { title: string }[];
  total: number; status: string; createdAt: string;
}

const ALL_STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_BADGE: Record<string, string> = {
  delivered: 'badge-green', processing: 'badge-gold', pending: 'badge-blue',
  shipped: 'badge-blue', cancelled: 'badge-red',
};
const NEXT_STATUS: Record<string, string> = { pending: 'processing', processing: 'shipped', shipped: 'delivered' };
const NEXT_LABEL: Record<string, string>  = { pending: 'Processing', processing: 'Out for Delivery', shipped: 'Delivered' };

export default function AdminOrders() {
  const [orders, setOrders]           = useState<Order[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast]             = useState('');
  const [refundId, setRefundId]       = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?role=admin');
      if (res.ok) setOrders(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const title = o.items?.[0]?.title ?? '';
    const matchQ = o.id.toLowerCase().includes(q) || o.buyerName.toLowerCase().includes(q) || title.toLowerCase().includes(q);
    const matchS = statusFilter === 'all' || o.status === statusFilter;
    return matchQ && matchS;
  });

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      showToast('Order status updated');
    } else { showToast('Update failed'); }
  };

  const cancelOrder = async (id: string) => {
    await updateStatus(id, 'cancelled');
    setRefundId(null);
    showToast('Order cancelled');
  };

  const counts: Record<string, number> = {};
  ALL_STATUSES.forEach(s => { counts[s] = s === 'all' ? orders.length : orders.filter(o => o.status === s).length; });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Orders</h1>
          <p className={styles.pageSub}>{counts.all} total · {counts.pending} pending · {counts.delivered} delivered</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchOrders}
          style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <UilRefresh size="14" /> Refresh
        </button>
      </div>

      <div className={styles.statusTabs}>
        {ALL_STATUSES.map(s => (
          <button key={s} className={`${styles.statusTab} ${statusFilter === s ? styles.statusTabActive : ''}`}
            onClick={() => setStatusFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <UilSearch size="16" style={{ color: 'var(--text-muted)' }} />
          <input className={styles.searchInput} placeholder="Search by ID, buyer or product..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>Loading orders...</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th>Order</th><th>Buyer</th><th>Product</th><th>Amount</th><th>Status</th>
              <th style={{ width: 120 }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td>
                    <div className={styles.tdMono} style={{ fontSize: '0.78rem' }}>{o.id.slice(0, 8).toUpperCase()}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className={styles.tdPrimary} style={{ fontSize: '0.85rem' }}>{o.buyerName}</div>
                    {o.sellerName && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{o.sellerName}</div>}
                  </td>
                  <td style={{ fontSize: '0.82rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.items?.[0]?.title || 'Order'}
                    {o.items?.length > 1 && ` +${o.items.length - 1}`}
                  </td>
                  <td className={styles.tdAmount}>{formatRWF(o.total)}</td>
                  <td><span className={`badge ${STATUS_BADGE[o.status] || 'badge-blue'}`} style={{ fontSize: '0.7rem' }}>{o.status}</span></td>
                  <td>
                    <div className={styles.actionBtns}>
                      {NEXT_STATUS[o.status] && (
                        <button className="btn btn-primary btn-xs"
                          onClick={() => updateStatus(o.id, NEXT_STATUS[o.status])}
                          style={{ fontSize: '0.7rem', padding: '4px 10px' }}>
                          {NEXT_LABEL[o.status]}
                        </button>
                      )}
                      {(o.status === 'pending' || o.status === 'processing') && (
                        <button className="btn btn-danger btn-xs" onClick={() => setRefundId(o.id)}
                          style={{ padding: '4px 7px', lineHeight: 1 }}>
                          <UilTimes size="13" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {refundId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Cancel Order & Refund?</h3>
            <p className={styles.modalText}>Order {refundId.slice(0, 8).toUpperCase()} will be cancelled.</p>
            <div className={styles.modalActions}>
              <button className="btn btn-ghost" onClick={() => setRefundId(null)}>Keep Order</button>
              <button className="btn btn-danger" onClick={() => cancelOrder(refundId)}>Cancel & Refund</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`${styles.toast} ${styles.toastSuccess}`}><UilCheck size="18" style={{ color: 'var(--brand-green)' }} />{toast}</div>}
    </div>
  );
}
