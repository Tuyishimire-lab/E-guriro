'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatRWF, RWANDA_DISTRICTS } from '@/lib/constants';
import {
  UilPackage, UilUser, UilShoppingCart, UilCheck,
  UilComment, UilRefresh, UilEnvelope, UilPhone, UilMapMarker,
  UilStar, UilShieldCheck, UilArrowRight, UilStore,
} from '@/components/Icons';
import styles from './page.module.css';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];
const STEP_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Out for Delivery',
  delivered: 'Delivered',
};
const STATUS_BADGE: Record<string, string> = {
  pending: 'badge-gold', processing: 'badge-blue',
  shipped: 'badge-green', delivered: 'badge-green', cancelled: 'badge-red',
};

function OrderTracker({ status, isPickup }: { status: string; isPickup?: boolean }) {
  const steps = isPickup
    ? ['pending', 'processing', 'shipped', 'delivered']
    : STATUS_STEPS;
  const labels: Record<string, string> = isPickup
    ? { pending: 'Order Placed', processing: 'Processing', shipped: 'Ready for Pickup', delivered: 'Collected' }
    : STEP_LABELS;

  const current = Math.max(0, steps.indexOf(status));
  const progressPercent = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 0;

  return (
    <div className={styles.tracker}>
      <div className={styles.trackerProgressTrack}>
        <div className={styles.trackerProgressBar} style={{ width: `${progressPercent}%` }} />
      </div>
      {steps.map((s, i) => (
        <div key={s} className={styles.trackerItem}>
          <div className={`${styles.trackerDot} ${i <= current ? styles.trackerDotActive : ''}`}>
            {i < current ? <UilCheck size="14" /> : (i + 1)}
          </div>
          <span className={`${styles.trackerLabel} ${i <= current ? styles.trackerLabelActive : ''}`}>
            {labels[s] || s}
          </span>
        </div>
      ))}
    </div>
  );
}

interface Order {
  id: string;
  items: { title: string; image?: string; qty: number; price: number }[];
  sellerName?: string;
  total: number;
  status: string;
  createdAt: string;
  deliveryType?: 'home_delivery' | 'pickup_station';
  pickupStationId?: string;
  pickupStationName?: string;
  pickupStationAddress?: string;
  pickupCode?: string;
}

export default function BuyerOrders() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState('');
  const [profile, setProfile]     = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    district: user?.district ?? 'Gasabo',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name ?? '',
        phone: user.phone ?? '',
        district: user.district ?? 'Gasabo',
      });
    }
  }, [user]);

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
      if (res.ok) showToast('Profile updated successfully! 🎉');
      else showToast('Failed to save profile. Please try again.');
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
      {toast && <div className="alert alert-success" style={{ marginBottom: 20 }}>{toast}</div>}

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Account</h1>
          <p className={styles.pageSub}>Welcome back, {user?.name || 'Valued Shopper'}</p>
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
            >
              <IconComp size="16" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn btn-ghost btn-sm" onClick={fetchOrders}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UilRefresh size="14" /> Refresh Orders
            </button>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-secondary)' }}>
              Loading your orders...
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-secondary)' }}>
              <UilPackage size="48" style={{ opacity: 0.3, marginBottom: 16 }} />
              <p style={{ fontSize: '1rem', marginBottom: 12 }}>No orders placed yet.</p>
              <Link href="/products" className="btn btn-primary btn-sm">Explore Products</Link>
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
                            {order.items?.length > 1 && ` + ${order.items.length - 1} more items`}
                          </p>
                          <p className={styles.orderMeta}>
                            {order.sellerName || 'Verified Seller'} &nbsp;·&nbsp; {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                          <span className={`badge ${STATUS_BADGE[order.status] || 'badge-blue'}`}>
                            {order.deliveryType === 'pickup_station' && order.status === 'shipped'
                              ? 'Ready for Pickup'
                              : STEP_LABELS[order.status] || order.status}
                          </span>
                          {order.deliveryType === 'pickup_station' && (
                            <span className="badge badge-green" style={{ marginLeft: 6 }}>
                              📍 Pickup Hub
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.orderAmount}>{formatRWF(order.total)}</div>
                    </div>

                    <div className={styles.orderCardBody}>
                      {order.deliveryType === 'pickup_station' && (
                        <div className={styles.pickupPassBanner}>
                          <div className={styles.pickupPassLeft}>
                            <div className={styles.pickupPassIcon}>
                              <UilStore size="24" />
                            </div>
                            <div>
                              <h4 className={styles.pickupStationTitle}>📍 {order.pickupStationName || 'Kigali Pickup Station'}</h4>
                              <p className={styles.pickupStationSub}>{order.pickupStationAddress || 'Central Kigali Hub'}</p>
                            </div>
                          </div>
                          <div className={styles.pickupCodeBox}>
                            <span className={styles.pickupCodeLabel}>Pickup PIN</span>
                            <span className={styles.pickupCodeValue}>{order.pickupCode || 'RB-READY'}</span>
                          </div>
                        </div>
                      )}

                      <OrderTracker status={order.status} isPickup={order.deliveryType === 'pickup_station'} />
                    </div>
                    <div className={styles.orderCardFooter}>
                      <Link href="/chat" className="btn btn-ghost btn-sm" id={`chat-seller-${order.id}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <UilComment size="15" /> Chat Seller
                      </Link>
                      {order.status === 'delivered' && (
                        <button className="btn btn-secondary btn-sm" id={`review-${order.id}`}
                          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <UilStar size="15" /> Leave Review
                        </button>
                      )}
                      <Link href="/products" className="btn btn-primary btn-sm" id={`reorder-${order.id}`}
                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
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

      {/* Profile Tab (Redesigned & Polished) */}
      {activeTab === 'profile' && (
        <div className={styles.profileContainer}>
          {/* Hero Banner with Avatar */}
          <div className={styles.profileHero}>
            <div className={styles.profileAvatar}>
              {profile.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className={styles.profileHeroInfo}>
              <div className={styles.profileNameRow}>
                <h2 className={styles.profileName}>{profile.name || user?.name || 'Shopper'}</h2>
                <span className={styles.verifiedBadge}>
                  <UilShieldCheck size="13" /> Verified Buyer
                </span>
              </div>
              <p className={styles.profileEmail}>{user?.email || 'No email attached'}</p>
            </div>
          </div>

          {/* Form Body */}
          <div className={styles.profileFormBody}>
            <div className={styles.formGrid}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="profile-name">
                  <UilUser size="15" style={{ color: 'var(--brand-green)' }} />
                  Full Name
                </label>
                <input
                  id="profile-name"
                  className={styles.fieldInput}
                  value={profile.name}
                  placeholder="Enter your full name"
                  onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="profile-email">
                  <UilEnvelope size="15" style={{ color: 'var(--brand-green)' }} />
                  Email Address
                </label>
                <input
                  id="profile-email"
                  className={styles.fieldInput}
                  defaultValue={user?.email}
                  type="email"
                  disabled
                  title="Email cannot be changed directly"
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="profile-phone">
                  <UilPhone size="15" style={{ color: 'var(--brand-green)' }} />
                  Phone Number
                </label>
                <input
                  id="profile-phone"
                  className={styles.fieldInput}
                  value={profile.phone}
                  placeholder="e.g. 0788 123 456"
                  onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="profile-district">
                  <UilMapMarker size="15" style={{ color: 'var(--brand-green)' }} />
                  Default Delivery District
                </label>
                <select
                  id="profile-district"
                  className={styles.fieldInput}
                  value={profile.district}
                  onChange={e => setProfile(p => ({ ...p, district: e.target.value }))}
                >
                  {Object.entries(RWANDA_DISTRICTS).map(([province, districts]) => (
                    <optgroup key={province} label={province}>
                      {districts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions Bar */}
            <div className={styles.profileActionsBar}>
              <Link href="/buyer/profile" className={styles.moreSettingsLink}>
                Manage Saved Addresses & Security <UilArrowRight size="15" />
              </Link>
              <button
                className={`btn btn-primary ${styles.saveBtn}`}
                id="save-profile-btn"
                onClick={saveProfile}
                disabled={saving}
              >
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <UilCheck size="16" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

