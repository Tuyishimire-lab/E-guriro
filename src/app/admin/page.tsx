'use client';
import { useState } from 'react';
import Link from 'next/link';
import { formatRWF, MOCK_PRODUCTS, MOCK_SELLERS } from '@/lib/constants';
import {
  UilMoneyBill, UilStore, UilUser, UilPackage, UilExclamationTriangle,
  UilChart, UilArrowUp, UilArrowDown, UilCheckCircle, UilShield,
  UilFire, UilEye, UilArrowRight,
} from '@/components/Icons';
import styles from './layout.module.css';

const STATS = [
  { label: 'Total Revenue', value: 'RWF 48.5M', icon: UilMoneyBill, change: '+22%', up: true, color: '#00A550' },
  { label: 'GMV This Month', value: 'RWF 12.3M', icon: UilChart, change: '+18%', up: true, color: '#3B82F6' },
  { label: 'Active Sellers', value: '2,148', icon: UilStore, change: '+45', up: true, color: '#8B5CF6' },
  { label: 'Total Buyers', value: '51,320', icon: UilUser, change: '+1.2K', up: true, color: '#F59E0B' },
  { label: 'Orders This Month', value: '8,924', icon: UilPackage, change: '+18%', up: true, color: '#06B6D4' },
  { label: 'Open Disputes', value: '12', icon: UilExclamationTriangle, change: '-3', up: true, color: '#EF4444' },
];

const CHART_DATA = [
  { day: 'Mon', value: 68 }, { day: 'Tue', value: 85 }, { day: 'Wed', value: 72 },
  { day: 'Thu', value: 94 }, { day: 'Fri', value: 88 }, { day: 'Sat', value: 76 },
  { day: 'Sun', value: 60 },
];

const RECENT_ORDERS = [
  { id: 'ORD-9921', buyer: 'Amina U.', product: 'Samsung Galaxy S24', amount: 850000, status: 'delivered', date: '2026-08-17' },
  { id: 'ORD-9920', buyer: 'Jean K.', product: 'iPhone 15 Pro', amount: 1450000, status: 'processing', date: '2026-08-17' },
  { id: 'ORD-9919', buyer: 'Alice M.', product: 'Tecno Spark 20 Pro+', amount: 155000, status: 'pending', date: '2026-08-16' },
  { id: 'ORD-9918', buyer: 'David R.', product: 'HP EliteBook 840', amount: 950000, status: 'shipped', date: '2026-08-16' },
  { id: 'ORD-9917', buyer: 'Grace N.', product: 'Sony WH-1000XM5', amount: 380000, status: 'delivered', date: '2026-08-15' },
];

const PENDING_ACTIONS = [
  { icon: UilStore, label: '3 sellers awaiting approval', sub: 'Submitted documents ready for review', color: 'var(--brand-green)', href: '/admin/sellers', cta: 'Review' },
  { icon: UilExclamationTriangle, label: '12 open disputes', sub: 'Oldest dispute is 5 days old', color: 'var(--color-warning)', href: '/admin/orders', cta: 'View' },
  { icon: UilShield, label: '5 products flagged', sub: 'Reported by buyers for policy violations', color: 'var(--color-error)', href: '/admin/products', cta: 'Review' },
  { icon: UilFire, label: 'Flash Sale ends in 2h', sub: 'Monitor discounted products performance', color: '#F59E0B', href: '/admin/promotions', cta: 'Monitor' },
];

const STATUS_COLORS: Record<string, string> = {
  delivered: 'badge-green', processing: 'badge-gold', pending: 'badge-blue',
  shipped: 'badge-blue', cancelled: 'badge-red',
};

export default function AdminDashboard() {
  const maxVal = Math.max(...CHART_DATA.map(d => d.value));

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Platform Dashboard</h1>
          <p className={styles.pageSub}>RwandaBuy Marketplace — real-time overview</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/admin/promotions" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <UilFire size="15" /> New Promotion
          </Link>
          <Link href="/admin/products" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <UilPackage size="15" /> Add Product
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.statsGrid}>
        {STATS.map((s, i) => {
          const IconComp = s.icon;
          return (
            <div key={i} className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIcon} style={{ background: `${s.color}18` }}>
                  <IconComp size="20" style={{ color: s.color }} />
                </div>
                <span className={`${styles.statChange} ${s.up ? styles.up : styles.down}`}>
                  {s.up ? <UilArrowUp size="11" /> : <UilArrowDown size="11" />}
                  {s.change}
                </span>
              </div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          );
        })}
      </div>

      <div className={styles.twoCol}>
        {/* Revenue chart */}
        <div className={styles.adminCard} style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Revenue — Last 7 Days</h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--brand-green)', fontWeight: 700 }}>+22% vs last week</span>
          </div>
          <div className={styles.chartWrap}>
            {CHART_DATA.map((d, i) => (
              <div key={i} className={styles.chartRow}>
                <div className={styles.chartBar} style={{ height: `${(d.value / maxVal) * 100}%` }} title={`${d.value}%`} />
                <div className={styles.chartLabel}>{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending actions */}
        <div className={styles.adminCard} style={{ padding: 24 }}>
          <h2 className={styles.sectionTitle}>Pending Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PENDING_ACTIONS.map((a, i) => {
              const IconComp = a.icon;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <IconComp size="20" style={{ color: a.color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.label}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.sub}</p>
                  </div>
                  <Link href={a.href} className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>{a.cta}</Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={styles.section} style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Recent Orders</h2>
          <Link href="/admin/orders" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            View All <UilArrowRight size="14" />
          </Link>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th>Order ID</th><th>Buyer</th><th>Product</th><th>Amount</th><th>Date</th><th>Status</th>
            </tr></thead>
            <tbody>
              {RECENT_ORDERS.map(o => (
                <tr key={o.id}>
                  <td className={styles.tdMono}>{o.id}</td>
                  <td className={styles.tdPrimary}>{o.buyer}</td>
                  <td>{o.product}</td>
                  <td className={styles.tdAmount}>{formatRWF(o.amount)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{o.date}</td>
                  <td><span className={`badge ${STATUS_COLORS[o.status] || 'badge-blue'}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Sellers */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Top Sellers</h2>
          <Link href="/admin/sellers" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            View All <UilArrowRight size="14" />
          </Link>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr>
              <th>#</th><th>Seller</th><th>District</th><th>Products</th><th>Rating</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {MOCK_SELLERS.slice(0, 5).map((s, i) => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--brand-green)', fontWeight: 800 }}>#{i + 1}</td>
                  <td className={styles.tdPrimary}>{s.name}</td>
                  <td>{s.district}</td>
                  <td>{s.products}</td>
                  <td style={{ color: '#F59E0B' }}>★ {s.rating}</td>
                  <td>
                    <Link href="/admin/sellers" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <UilEye size="14" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
