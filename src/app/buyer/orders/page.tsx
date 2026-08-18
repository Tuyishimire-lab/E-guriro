'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatRWF } from '@/lib/constants';
import {
  UilPackage, UilHeart, UilUser, UilShoppingCart, UilCheck,
  UilComment, UilRefresh, UilEnvelope, UilPhone, UilMapMarker,
  UilStar,
} from '@/components/Icons';
import styles from '../../seller/dashboard/page.module.css';

const BUYER_ORDERS = [
  { id: '#EG-101', product: 'Rwandan Premium Coffee Beans', seller: 'Ikawa Rwanda', amount: 8500, status: 'delivered', date: '2026-08-10', image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=60' },
  { id: '#EG-102', product: 'Ankara African Print Dress', seller: 'Imyenda ya Rwanda', amount: 25000, status: 'shipped', date: '2026-08-15', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=60' },
  { id: '#EG-103', product: 'Natural Shea Butter Cream', seller: 'Beauty Kigali', amount: 6500, status: 'processing', date: '2026-08-17', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=60' },
];

const WISHLIST = [
  { id: '4', title: 'Solar Panel 200W Kit', price: 185000, image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=80' },
  { id: '1', title: 'Samsung Galaxy A54', price: 350000, image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=80' },
];

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

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

export default function BuyerOrders() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>('orders');

  const statusColor: Record<string, string> = {
    pending: 'badge-gold',
    processing: 'badge-blue',
    shipped: 'badge-green',
    delivered: 'badge-green',
  };

  const TABS = [
    { id: 'orders', label: 'My Orders', icon: UilPackage },
    { id: 'wishlist', label: 'Wishlist', icon: UilHeart },
    { id: 'profile', label: 'Profile', icon: UilUser },
  ];

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>My Account</h1>
          <p className={styles.pageSub}>Welcome back, {user?.name || 'Shopper'}</p>
        </div>
        <Link href="/products" className="btn btn-primary" id="buyer-shop-btn"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UilShoppingCart size="18" />
          Continue Shopping
        </Link>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map(tab => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              id={`buyer-tab-${tab.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <IconComp size="16" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Orders */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {BUYER_ORDERS.map(order => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderCardHeader}>
                <div className={styles.orderInfo}>
                  <img src={order.image} alt={order.product} className={styles.orderImg} />
                  <div>
                    <p className={styles.orderProduct}>{order.product}</p>
                    <p className={styles.orderMeta}>{order.seller}  {order.date}</p>
                    <span className={`badge ${statusColor[order.status] || 'badge-blue'}`}>{order.status}</span>
                  </div>
                </div>
                <div className={styles.orderAmount}>{formatRWF(order.amount)}</div>
              </div>
              <div className={styles.orderCardBody}>
                <OrderTracker status={order.status} />
              </div>
              <div className={styles.orderCardFooter}>
                <button className="btn btn-ghost btn-sm" id={`chat-seller-${order.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <UilComment size="15" /> Chat Seller
                </button>
                {order.status === 'delivered' && (
                  <button className="btn btn-secondary btn-sm" id={`review-${order.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <UilStar size="15" /> Leave Review
                  </button>
                )}
                <Link href={`/products/${order.id}`} className="btn btn-primary btn-sm" id={`reorder-${order.id}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <UilRefresh size="15" /> Buy Again
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="products-grid">
          {WISHLIST.map(item => (
            <div key={item.id} className={styles.wishCard}>
              <img src={item.image} alt={item.title} className={styles.wishImg} />
              <div className={styles.wishInfo}>
                <p className={styles.wishTitle}>{item.title}</p>
                <p className={styles.wishPrice}>{formatRWF(item.price)}</p>
              </div>
              <div className={styles.wishActions}>
                <button className="btn btn-primary btn-sm btn-full" id={`add-from-wish-${item.id}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <UilShoppingCart size="15" /> Add to Cart
                </button>
                <button className="btn btn-ghost btn-sm btn-full" id={`remove-wish-${item.id}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
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
              <input className="input" defaultValue={user?.name} id="profile-name" />
            </div>
            <div className="input-group">
              <label className="input-label">
                <UilEnvelope size="14" style={{ verticalAlign: 'middle', marginRight: 4 }} /> Email
              </label>
              <input className="input" defaultValue={user?.email} id="profile-email" type="email" />
            </div>
            <div className="input-group">
              <label className="input-label">
                <UilPhone size="14" style={{ verticalAlign: 'middle', marginRight: 4 }} /> Phone Number
              </label>
              <input className="input" defaultValue={user?.phone} id="profile-phone" placeholder="0788 000 000" />
            </div>
            <div className="input-group">
              <label className="input-label">
                <UilMapMarker size="14" style={{ verticalAlign: 'middle', marginRight: 4 }} /> District
              </label>
              <input className="input" defaultValue={user?.district} id="profile-district" />
            </div>
            <button className="btn btn-primary" id="save-profile-btn">Save Changes</button>
          </div>
        </div>
      )}
    </div>
  );
}
