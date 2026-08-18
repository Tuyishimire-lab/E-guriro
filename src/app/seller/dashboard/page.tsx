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
  { label: 'Orders Today',  value: '24',            icon: UilPackage,   change: '+5',   up: true },
  { label: 'Products Listed', value: '45',          icon: UilStore,     change: '+3',   up: true },
  { label: 'Shop Rating',  value: '4.7',            icon: UilStar,      change: '+0.1', up: true },
];

const MOCK_ORDERS = [
  { id: '#EG-001', product: 'Samsung Galaxy A54 5G', buyer: 'Amina U.',  district: 'Kicukiro', amount: 350000, status: 'delivered',  date: '2026-08-15' },
  { id: '#EG-002', product: 'Smart LED TV 43"',      buyer: 'Jean P.',   district: 'Gasabo',   amount: 280000, status: 'shipped',     date: '2026-08-16' },
  { id: '#EG-003', product: 'Samsung Galaxy A54 5G', buyer: 'Claude M.', district: 'Huye',     amount: 350000, status: 'processing', date: '2026-08-17' },
  { id: '#EG-004', product: 'Smart LED TV 43"',      buyer: 'Marie C.',  district: 'Musanze',  amount: 280000, status: 'pending',     date: '2026-08-17' },
];

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function SellerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products'>('overview');

  const statusBadge: Record<string, string> = {
    pending:    'badge-gold',
    processing: 'badge-blue',
    shipped:    'badge-green',
    delivered:  'badge-green',
    cancelled:  'badge-red',
  };

  const TABS = [
    { id: 'overview',  label: 'Overview',  icon: UilChart   },
    { id: 'orders',    label: 'Orders',    icon: UilPackage  },
    { id: 'products',  label: 'Products',  icon: UilStore    },
  ];

  return (
    <div className={styles.page}>

      {/* ---- Header ---- */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Seller Dashboard</h1>
          <p className={styles.pageSub}>Welcome back, {user?.shopName || user?.name || 'Seller'}</p>
        </div>
        <Link
          href="/seller/products/new"
          className="btn btn-primary btn-sm"
          id="add-product-btn"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <UilPlus size="16" />
          Add Product
        </Link>
      </div>

      {/* ---- Tabs ---- */}
      <div className={styles.tabs}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              id={`tab-${tab.id}`}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <Icon size="15" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ======================================================
          OVERVIEW TAB
         ====================================================== */}
      {activeTab === 'overview' && (
        <div className={styles.section}>

          {/* KPI grid */}
          <div className={styles.statsGrid}>
            {SELLER_STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className={styles.statCard}>
                  <div className={styles.statTop}>
                    <div className={styles.statIconWrap}><Icon size="20" /></div>
                    <span className={`${styles.statChange} ${stat.up ? styles.up : styles.down}`}>
                      {stat.up ? <UilArrowUp size="11" /> : <UilArrowDown size="11" />}
                      {stat.change}
                    </span>
                  </div>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Recent orders mini-table */}
          <h2 className={styles.sectionTitle}>Recent Orders</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Product</th>
                  <th>Buyer</th>
                  <th>District</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ORDERS.slice(0, 3).map(o => (
                  <tr key={o.id}>
                    <td className={styles.orderId}>{o.id}</td>
                    <td>{o.product}</td>
                    <td>{o.buyer}</td>
                    <td>{o.district}</td>
                    <td className={styles.amount}>{formatRWF(o.amount)}</td>
                    <td><span className={`badge ${statusBadge[o.status]}`}>{o.status}</span></td>
                    <td className={styles.date}>{o.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================
          ORDERS TAB
         ====================================================== */}
      {activeTab === 'orders' && (
        <div className={styles.section}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Product</th>
                  <th>Buyer</th>
                  <th>District</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ORDERS.map(o => (
                  <tr key={o.id}>
                    <td className={styles.orderId}>{o.id}</td>
                    <td>{o.product}</td>
                    <td>{o.buyer}</td>
                    <td>{o.district}</td>
                    <td className={styles.amount}>{formatRWF(o.amount)}</td>
                    <td>
                      <select
                        className={styles.statusSelect}
                        defaultValue={o.status}
                        id={`status-${o.id}`}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-xs" id={`view-order-${o.id}`}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================
          PRODUCTS TAB
         ====================================================== */}
      {activeTab === 'products' && (
        <div className={styles.section}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link
              href="/seller/products/new"
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <UilPlus size="15" /> New Product
            </Link>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Sales</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PRODUCTS.slice(0, 6).map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.productCell}>
                        <img src={p.image} alt={p.title} className={styles.productThumb} />
                        <span className={styles.productName}>{p.title}</span>
                      </div>
                    </td>
                    <td className={styles.amount}>{formatRWF(p.price)}</td>
                    <td>
                      <span className={(p.stock ?? 99) < 20 ? styles.lowStock : styles.inStock}>
                        {p.stock ?? 99}u
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{p.reviews ?? 0}</td>
                    <td style={{ color: 'var(--brand-gold)', fontWeight: 700, fontSize: '0.82rem' }}>
                      {p.rating}
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <Link
                          href={`/seller/products/${p.id}/edit`}
                          className="btn btn-ghost btn-xs"
                          id={`edit-product-${p.id}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}
                        >
                          <UilEdit size="12" /> Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-xs"
                          id={`delete-product-${p.id}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}
                        >
                          <UilTrashAlt size="12" />
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
