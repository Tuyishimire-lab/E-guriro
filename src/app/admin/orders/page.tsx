'use client';
import { useState } from 'react';
import { formatRWF } from '@/lib/constants';
import { UilSearch, UilCheck, UilTimes } from '@/components/Icons';
import styles from '../layout.module.css';

const MOCK_ORDERS = [
  { id: 'ORD-9921', buyer: 'Amina Uwimana', seller: 'TechHub Kigali', product: 'Samsung Galaxy S24', amount: 850000, date: '2026-08-17', status: 'delivered' },
  { id: 'ORD-9920', buyer: 'Jean Kamanzi', seller: 'Mobile World RW', product: 'iPhone 15 Pro', amount: 1450000, date: '2026-08-17', status: 'processing' },
  { id: 'ORD-9919', buyer: 'Alice Mukamana', seller: 'SmartPhone City', product: 'Tecno Spark 20 Pro+', amount: 155000, date: '2026-08-16', status: 'pending' },
  { id: 'ORD-9918', buyer: 'David Rutaganda', seller: 'TechHub Kigali', product: 'HP EliteBook 840', amount: 950000, date: '2026-08-16', status: 'shipped' },
  { id: 'ORD-9917', buyer: 'Grace Niyonzima', seller: 'Ikawa Electronics', product: 'Sony WH-1000XM5', amount: 380000, date: '2026-08-15', status: 'delivered' },
  { id: 'ORD-9916', buyer: 'Marie Uwase', seller: 'Kigali Gadgets', product: 'Xiaomi Redmi Note 13', amount: 190000, date: '2026-08-15', status: 'cancelled' },
  { id: 'ORD-9915', buyer: 'Emmanuel Ntwali', seller: 'TechHub Kigali', product: 'Samsung Galaxy Tab S9', amount: 680000, date: '2026-08-14', status: 'processing' },
  { id: 'ORD-9914', buyer: 'Patrick Habimana', seller: 'Mobile World RW', product: 'Infinix Hot 40 Pro', amount: 120000, date: '2026-08-13', status: 'delivered' },
];

const ALL_STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_BADGE: Record<string, string> = {
  delivered: 'badge-green', processing: 'badge-gold', pending: 'badge-blue',
  shipped: 'badge-blue', cancelled: 'badge-red',
};
const NEXT_STATUS: Record<string, string> = {
  pending: 'processing', processing: 'shipped', shipped: 'delivered',
};
const NEXT_LABEL: Record<string, string> = {
  pending: 'Processing', processing: 'Shipped', shipped: 'Delivered',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toast, setToast] = useState('');
  const [refundId, setRefundId] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchQ = o.id.toLowerCase().includes(q) || o.buyer.toLowerCase().includes(q) || o.product.toLowerCase().includes(q);
    const matchS = statusFilter === 'all' || o.status === statusFilter;
    return matchQ && matchS;
  });

  const advanceStatus = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const next = NEXT_STATUS[o.status];
      return next ? { ...o, status: next } : o;
    }));
    showToast('Order status updated');
  };

  const cancelOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
    setRefundId(null);
    showToast('Order cancelled and refund issued');
  };

  const counts: Record<string, number> = {};
  ALL_STATUSES.forEach(s => { counts[s] = s === 'all' ? orders.length : orders.filter(o => o.status === s).length; });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Orders</h1>
          <p className={styles.pageSub}>{counts.all} total &bull; {counts.pending} pending &bull; {counts.delivered} delivered</p>
        </div>
      </div>

      <div className={styles.statusTabs}>
        {ALL_STATUSES.map(s => (
          <button key={s} className={`${styles.statusTab} ${statusFilter === s ? styles.statusTabActive : ''}`} onClick={() => setStatusFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <UilSearch size="16" style={{ color: 'var(--text-muted)' }} />
          <input className={styles.searchInput} placeholder="Search by ID, buyer or product..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Buyer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th style={{ width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id}>
                {/* Order ID + date stacked */}
                <td>
                  <div className={styles.tdMono} style={{ fontSize: '0.78rem' }}>{o.id}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{o.date}</div>
                </td>

                {/* Buyer + seller stacked */}
                <td>
                  <div className={styles.tdPrimary} style={{ fontSize: '0.85rem' }}>{o.buyer}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{o.seller}</div>
                </td>

                {/* Product truncated */}
                <td style={{ fontSize: '0.82rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {o.product}
                </td>

                <td className={styles.tdAmount}>{formatRWF(o.amount)}</td>

                <td>
                  <span className={`badge ${STATUS_BADGE[o.status] || 'badge-blue'}`} style={{ fontSize: '0.7rem' }}>{o.status}</span>
                </td>

                {/* Actions: one advance pill + one icon cancel */}
                <td>
                  <div className={styles.actionBtns}>
                    {NEXT_STATUS[o.status] && (
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() => advanceStatus(o.id)}
                        title={`Mark as ${NEXT_LABEL[o.status]}`}
                        style={{ fontSize: '0.7rem', padding: '4px 10px' }}
                      >
                        {NEXT_LABEL[o.status]}
                      </button>
                    )}
                    {(o.status === 'pending' || o.status === 'processing') && (
                      <button
                        className="btn btn-danger btn-xs"
                        onClick={() => setRefundId(o.id)}
                        title="Cancel order and issue refund"
                        style={{ padding: '4px 7px', lineHeight: 1 }}
                      >
                        <UilTimes size="13" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {refundId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Cancel Order & Refund?</h3>
            <p className={styles.modalText}>Order {refundId} will be cancelled and the buyer will receive a full refund within 3-5 business days.</p>
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
