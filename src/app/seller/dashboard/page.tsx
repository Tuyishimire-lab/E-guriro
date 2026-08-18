'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatRWF, MOCK_PRODUCTS } from '@/lib/constants';
import {
  UilStore, UilPlus, UilChart, UilPackage, UilStar, UilArrowUp,
  UilArrowDown, UilEdit, UilTrashAlt, UilMoneyBill,
} from '@/components/Icons';
import styles from './page.module.css';

const SELLER_STATS = [
  { label: 'Total Revenue', value: 'RWF 4,850,000', icon: UilMoneyBill, change: '+18%', up: true },
  { label: 'Orders Today', value: '24', icon: UilPackage, change: '+5', up: true },
  { label: 'Products Listed', value: '45', icon: UilStore, change: '+3', up: true },
  { label: 'Shop Rating', value: '4.7', icon: UilStar, change: '+0.1', up: true },
];

const MOCK_ORDERS = [
  { id: '#EG-001', product: 'Samsung Galaxy A54 5G', buyer: 'Amina U.', district: 'Kicukiro', amount: 350000, status: 'delivered', date: '2026-08-15' },
  { id: '#EG-002', product: 'Smart LED TV 43"', buyer: 'Jean P.', district: 'Gasabo', amount: 280000, status: 'shipped', date: '2026-08-16' },
  { id: '#EG-003', product: 'Samsung Galaxy A54 5G', buyer: 'Claude M.', district: 'Huye', amount: 350000, status: 'processing', date: '2026-08-17' },
  { id: '#EG-004', product: 'Smart LED TV 43"', buyer: 'Marie C.', district: 'Musanze', amount: 280000, status: 'pending', date: '2026-08-17' },
];

export default function SellerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview'|'orders'|'products'>('overview');

  const statusColor: Record<string, string> = {
    pending: 'badge-gold',
    processing: 'badge-blue',
    shipped: 'badge-green',
    delivered: 'badge-green',
    cancelled: 'badge-red',
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: UilChart },
    { id: 'orders', label: 'Orders', icon: UilPackage },
    { id: 'products', label: 'Products', icon: UilStore },
  ];

  return (
    <div className={`container ${styles.page}`}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Seller Dashboard</h1>
          <p className={styles.pageSub}>Welcome back, {user?.shopName || user?.name || 'Seller'}</p>
        </div>
        <Link href="/seller/products/new" className="btn btn-primary" id="add-product-btn"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UilPlus size="18" />
          Add Product
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
              id={`tab-${tab.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <IconComp size="16" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className={styles.section}>
          <div className={styles.statsGrid}>
            {SELLER_STATS.map((stat, i) => {
              const IconComp = stat.icon;
              return (
                <div key={i} className={styles.statCard}>
                  <div className={styles.statTop}>
                    <div className={styles.statIconWrap}>
                      <IconComp size="22" />
                    </div>
                    <span className={`${styles.statChange} ${stat.up ? styles.up : styles.down}`}>
                      {stat.up ? <UilArrowUp size="12" /> : <UilArrowDown size="12" />}
                      {stat.change}
                    </span>
                  </div>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              );
            })}
          </div>

          <h2 className={styles.sectionTitle}>Recent Orders</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr>
                <th>Order ID</th><th>Product</th><th>Buyer</th><th>District</th><th>Amount</th><th>Status</th><th>Date</th>
              </tr></thead>
              <tbody>
                {MOCK_ORDERS.slice(0, 3).map(o => (
                  <tr key={o.id}>
                    <td className={styles.orderId}>{o.id}</td>
                    <td>{o.product}</td>
                    <td>{o.buyer}</td>
                    <td>{o.district}</td>
                    <td className={styles.amount}>{formatRWF(o.amount)}</td>
                    <td><span className={`badge ${statusColor[o.status]}`}>{o.status}</span></td>
                    <td className={styles.date}>{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className={styles.section}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr>
                <th>Order ID</th><th>Product</th><th>Buyer</th><th>District</th><th>Amount</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {MOCK_ORDERS.map(o => (
                  <tr key={o.id}>
                    <td className={styles.orderId}>{o.id}</td>
                    <td>{o.product}</td>
                    <td>{o.buyer}</td>
                    <td>{o.district}</td>
                    <td className={styles.amount}>{formatRWF(o.amount)}</td>
                    <td>
                      <select className="select" defaultValue={o.status} style={{ padding: '4px 8px', fontSize: '0.8rem' }} id={`status-${o.id}`}>
                        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" id={`view-order-${o.id}`}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className={styles.section}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead><tr>
                <th>Product</th><th>Price</th><th>Stock</th><th>Sales</th><th>Rating</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {MOCK_PRODUCTS.slice(0, 5).map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.productCell}>
                        <img src={p.image} alt={p.title} className={styles.productThumb} />
                        <span>{p.title}</span>
                      </div>
                    </td>
                    <td className={styles.amount}>{formatRWF(p.price)}</td>
                    <td>
                      <span className={p.stock < 20 ? styles.lowStock : styles.inStock}>
                        {p.stock} units
                      </span>
                    </td>
                    <td>{p.reviews}</td>
                    <td>{p.rating}</td>
                    <td>
                      <div className={styles.actionBtns}>
                        <Link href={`/seller/products/${p.id}/edit`} className="btn btn-ghost btn-sm" id={`edit-product-${p.id}`}
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <UilEdit size="14" /> Edit
                        </Link>
                        <button className="btn btn-danger btn-sm" id={`delete-product-${p.id}`}
                          style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <UilTrashAlt size="14" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
