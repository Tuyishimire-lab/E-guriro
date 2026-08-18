'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatRWF } from '@/lib/constants';
import {
  UilPackage, UilHeart, UilUser, UilShoppingCart, UilCheck,
  UilComment, UilRefresh, UilEnvelope, UilPhone, UilMapMarker,
  UilStar,
} from '@/components/Icons';
import styles from '../../seller/dashboard/page.module.css';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];
const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-gold', processing: 'badge-blue',
  shipped: 'badge-green', delivered: 'badge-green', cancelled: 'badge-red',
};

function OrderTracker({ status }: { status: string }) {
  const current = STATUS_STEPS.indexOf(status);
  return (
    <div className={styles.tracker}>
      {STATUS_STEPS.map((s, i) => (
        <div key={s} className={styles.trackerStep}>
          <div className={`${styles.trackerDot} ${i <= current ? styles.trackerDotActive : ''}`}>
            {i < current ? <UilCheck size="14" /> : null}
          </div>
          <span className={`${styles.trackerLabel} ${i === current ? styles.trackerLabelActive : ''}`}>{s}</span>
          {i < STATUS_STEPS.length - 1 && (
            <div className={`${styles.trackerLine} ${i < current ? styles.trackerLineActive : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
}

interface Order {
  id: string; items: { title: string; image?: string; qty: number; price: number }[];
  sellerName?: string; total: number; status: string; createdAt: string;
}

export default function BuyerOrders() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState('');
  const [profile, setProfile]     = useState({ name: user?.name ?? '', phone: user?.phone ?? '', district: user?.district ?? '' });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders?role=buyer');
      if (res.ok) setOrders(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) showToast('Profile updated!');
      else showToast('Failed to save. Try again.');
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'orders',  label: 'My Orders', icon: UilPackage },
    { id: 'profile', label: 'Profile',   icon: UilUser },
  ];

  return (
    <div className={`container ${styles.page}`}>
      {toast && <div className="alert alert-success" style={{ marginBottom: 16 }}>{toast}</div>}

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Account</h1>
          <p className={styles.pageSub}>Welcome back, {user?.name || 'Shopper'}</p>
        </div>
        <Link href="/products" className="btn btn-primary" id="buyer-shop-btn"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UilShoppingCart size="18" /> Continue Shopping
        </Link>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(tab => {
          const IconComp = tab.icon;
          return (
            <button key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              id={`buyer-tab-${tab.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconComp size="16" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders */}
      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={fetchOrders}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <UilRefresh size="14" /> Refresh
            </button>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)' }}>
              <UilPackage size="48" style={{ opacity: 0.3, marginBottom: 12 }} />
              <p>No orders yet. <Link href="/products" style={{ color: 'var(--brand-green)' }}>Start shopping!</Link></p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {orders.map(order => {
                const firstItem = order.items?.[0];
                return (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderCardHeader}>
                      <div className={styles.orderInfo}>
                        {firstItem?.image && (
                          <img src={firstItem.image} alt={firstItem.title} className={styles.orderImg} />
                        )}
                        <div>
                          <p className={styles.orderProduct}>
                            {firstItem?.title || 'Order'}
                            {order.items?.length > 1 && ` + ${order.items.length - 1} more`}
                          </p>
                          <p className={styles.orderMeta}>
                            {order.sellerName} &nbsp; {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <span className={`badge ${STATUS_BADGE[order.status] || 'badge-blue'}`}>{order.status}</span>
                        </div>
                      </div>
                      <div className={styles.orderAmount}>{formatRWF(order.total)}</div>
                    </div>
                    <div className={styles.orderCardBody}>
                      <OrderTracker status={order.status} />
                    </div>
                    <div className={styles.orderCardFooter}>
                      <Link href="/chat" className="btn btn-ghost btn-sm" id={`chat-seller-${order.id}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <UilComment size="15" /> Chat Seller
                      </Link>
                      {order.status === 'delivered' && (
                        <button className="btn btn-secondary btn-sm" id={`review-${order.id}`}
                          style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <UilStar size="15" /> Leave Review
                        </button>
                      )}
                      <Link href="/products" className="btn btn-primary btn-sm" id={`reorder-${order.id}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <UilRefresh size="15" /> Buy Again
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Profile */}
      {activeTab === 'profile' && (
        <div className={styles.profileCard}>
          <div className={styles.profileAvatar}>{user?.name?.charAt(0) || 'U'}</div>
          <div className={styles.profileFields}>
            <div className="input-group">
              <label className="input-label">
                <UilUser size="14" style={{ verticalAlign: 'middle', marginRight: 4 }} /> Full Name
              </label>
              <input className="input" value={profile.name} id="profile-name"
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">
                <UilEnvelope size="14" style={{ verticalAlign: 'middle', marginRight: 4 }} /> Email
              </label>
              <input className="input" defaultValue={user?.email} id="profile-email" type="email" disabled
                style={{ opacity: 0.6 }} />
            </div>
            <div className="input-group">
              <label className="input-label">
                <UilPhone size="14" style={{ verticalAlign: 'middle', marginRight: 4 }} /> Phone Number
              </label>
              <input className="input" value={profile.phone} id="profile-phone" placeholder="0788 000 000"
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label">
                <UilMapMarker size="14" style={{ verticalAlign: 'middle', marginRight: 4 }} /> District
              </label>
              <input className="input" value={profile.district} id="profile-district"
                onChange={e => setProfile(p => ({ ...p, district: e.target.value }))} />
            </div>
            <button className="btn btn-primary" id="save-profile-btn" onClick={saveProfile} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
