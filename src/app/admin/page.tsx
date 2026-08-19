'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { formatRWF } from '@/lib/constants';
import {
  UilMoneyBill, UilStore, UilUser, UilPackage, UilExclamationTriangle,
  UilChart, UilArrowUp, UilArrowDown, UilCheckCircle, UilShield,
  UilFire, UilEye, UilArrowRight, UilRefresh,
} from '@/components/Icons';
import styles from './layout.module.css';

interface OrderItem {
  id: string;
  items?: { title: string }[];
  buyerName?: string;
  total: number;
  status: string;
  createdAt: string;
}

interface SellerItem {
  uid: string;
  name: string;
  shopName?: string;
  district?: string;
  totalProducts?: number;
  rating?: number;
  status: string;
}

interface BuyerItem {
  uid: string;
  name: string;
  email: string;
  status: string;
}

const CHART_DATA = [
  { day: 'Mon', value: 68 }, { day: 'Tue', value: 85 }, { day: 'Wed', value: 72 },
  { day: 'Thu', value: 94 }, { day: 'Fri', value: 88 }, { day: 'Sat', value: 76 },
  { day: 'Sun', value: 60 },
];

const STATUS_COLORS: Record<string, string> = {
  delivered: 'badge-green', processing: 'badge-gold', pending: 'badge-blue',
  shipped: 'badge-blue', cancelled: 'badge-red',
};

export default function AdminDashboard() {
  const [orders, setOrders]     = useState<OrderItem[]>([]);
  const [sellers, setSellers]   = useState<SellerItem[]>([]);
  const [buyers, setBuyers]     = useState<BuyerItem[]>([]);
  const [loading, setLoading]   = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordRes, selRes, buyRes] = await Promise.all([
        fetch('/api/orders?role=admin'),
        fetch('/api/sellers'),
        fetch('/api/users'),
      ]);
      if (ordRes.ok) setOrders(await ordRes.json());
      if (selRes.ok) setSellers(await selRes.json());
      if (buyRes.ok) setBuyers(await buyRes.json());
    } catch (e) {
      console.error('Failed to load admin metrics', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const maxVal = Math.max(...CHART_DATA.map(d => d.value));

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const activeSellersCount = sellers.filter(s => s.status === 'active').length || sellers.length;
  const pendingSellersCount = sellers.filter(s => s.status === 'pending').length;

  const STATS = [
    { label: 'Total Revenue', value: totalRevenue > 0 ? formatRWF(totalRevenue) : 'RWF 0', icon: UilMoneyBill, change: '+22%', up: true, color: '#00A550' },
    { label: 'Orders Placed', value: String(orders.length), icon: UilPackage, change: '+18%', up: true, color: '#06B6D4' },
    { label: 'Active Sellers', value: String(activeSellersCount), icon: UilStore, change: '+4', up: true, color: '#8B5CF6' },
    { label: 'Registered Buyers', value: String(buyers.length), icon: UilUser, change: '+12', up: true, color: '#F59E0B' },
    { label: 'Pending Approvals', value: String(pendingSellersCount), icon: UilShield, change: '0', up: true, color: '#3B82F6' },
    { label: 'Open Inquiries', value: '0', icon: UilExclamationTriangle, change: '-3', up: true, color: '#EF4444' },
  ];

  const PENDING_ACTIONS = [
    { icon: UilStore, label: `${pendingSellersCount} sellers awaiting review`, sub: 'Check verified business documents', color: 'var(--brand-green)', href: '/admin/sellers', cta: 'Review' },
    { icon: UilPackage, label: `${orders.filter(o => o.status === 'pending').length} pending orders`, sub: 'Awaiting seller processing', color: '#06B6D4', href: '/admin/orders', cta: 'View' },
    { icon: UilFire, label: 'Promotions & Flash Sales', sub: 'Monitor platform-wide discounts', color: '#F59E0B', href: '/admin/promotions', cta: 'Manage' },
  ];

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Platform Dashboard</h1>
          <p className={styles.pageSub}>RwandaBuy Marketplace — real-time overview</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <UilRefresh size="14" /> Refresh
          </button>
          <Link href="/admin/promotions" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <UilFire size="15" /> New Promotion
          </Link>
          <Link href="/admin/products" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <UilPackage size="15" /> Products
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <UilRefresh size="32" className="spin-icon" style={{ marginBottom: 12, opacity: 0.7 }} />
          <p>Loading platform metrics...</p>
        </div>
      ) : (
        <>
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
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Traffic & Activity — Last 7 Days</h2>
                <span style={{ fontSize: '0.78rem', color: 'var(--brand-green)', fontWeight: 700 }}>Active</span>
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
              <h2 className={styles.sectionTitle}>Quick Management</h2>
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
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id}>
                      <td className={styles.tdMono}>{o.id.slice(0, 8).toUpperCase()}</td>
                      <td className={styles.tdPrimary}>{o.buyerName || 'Buyer'}</td>
                      <td>{o.items?.[0]?.title || 'Product'}</td>
                      <td className={styles.tdAmount}>{formatRWF(o.total)}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td><span className={`badge ${STATUS_COLORS[o.status] || 'badge-blue'}`}>{o.status}</span></td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No orders placed yet</td>
                    </tr>
                  )}
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
                  {sellers.slice(0, 5).map((s, i) => (
                    <tr key={s.uid}>
                      <td style={{ color: 'var(--brand-green)', fontWeight: 800 }}>#{i + 1}</td>
                      <td className={styles.tdPrimary}>{s.shopName || s.name}</td>
                      <td>{s.district || 'Kigali'}</td>
                      <td>{s.totalProducts ?? 0}</td>
                      <td style={{ color: '#F59E0B' }}>★ {s.rating && s.rating > 0 ? s.rating : '4.8'}</td>
                      <td>
                        <Link href="/admin/sellers" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <UilEye size="14" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {sellers.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No sellers found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
