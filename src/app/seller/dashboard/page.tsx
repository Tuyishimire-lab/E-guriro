'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatRWF } from '@/lib/constants';
import type { Product } from '@/lib/types';
import {
  UilStore, UilPlus, UilChart, UilPackage, UilStar, UilArrowUp,
  UilArrowDown, UilEdit, UilTrashAlt, UilMoneyBill, UilRefresh,
} from '@/components/Icons';
import styles from './page.module.css';

interface OrderItem {
  id: string;
  items?: { title: string; qty: number; price: number }[];
  buyerName?: string;
  shippingDistrict?: string;
  total: number;
  status: string;
  createdAt: string;
}

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function SellerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products'>('overview');
  const [orders, setOrders]       = useState<OrderItem[]>([]);
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const sellerIdParam = user?.uid ? `?sellerId=${user.uid}` : '';
      const [ordRes, prodRes] = await Promise.all([
        fetch('/api/orders?role=seller'),
        fetch(`/api/products${sellerIdParam}`),
      ]);
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData);
      }
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
    } catch (e) {
      console.error('Failed to load seller dashboard data', e);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        showToast(`Order status updated to ${newStatus}`);
      } else {
        showToast('Failed to update status');
      }
    } catch {
      showToast('Error updating status');
    }
  };

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

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgRating = products.length
    ? (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1)
    : '4.8';

  const SELLER_STATS = [
    { label: 'Total Revenue', value: formatRWF(totalRevenue), icon: UilMoneyBill, change: '+18%', up: true },
    { label: 'Total Orders',  value: String(orders.length),   icon: UilPackage,   change: '+5',   up: true },
    { label: 'Products Listed', value: String(products.length), icon: UilStore,   change: '+3',   up: true },
    { label: 'Shop Rating',   value: avgRating,               icon: UilStar,      change: '+0.1', up: true },
  ];

  return (
    <div className={styles.page}>
      {toast && <div className="alert alert-success" style={{ marginBottom: 16 }}>{toast}</div>}

      {/* ---- Header ---- */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Seller Dashboard</h1>
          <p className={styles.pageSub}>Welcome back, {user?.shopName || user?.name || 'Seller'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <UilRefresh size="14" /> Refresh
          </button>
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          <UilRefresh size="32" className="spin-icon" style={{ marginBottom: 12, opacity: 0.7 }} />
          <p>Loading seller dashboard...</p>
        </div>
      ) : (
        <>
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
              {orders.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <UilPackage size="36" style={{ opacity: 0.4, marginBottom: 8 }} />
                  <p>No orders yet. Once buyers order your products, they will appear here!</p>
                </div>
              ) : (
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
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id}>
                          <td className={styles.orderId}>{o.id.slice(0, 8).toUpperCase()}</td>
                          <td>{o.items?.[0]?.title || 'Product Item'}</td>
                          <td>{o.buyerName || 'Buyer'}</td>
                          <td>{o.shippingDistrict || 'Kigali'}</td>
                          <td className={styles.amount}>{formatRWF(o.total)}</td>
                          <td><span className={`badge ${statusBadge[o.status] || 'badge-blue'}`}>{o.status}</span></td>
                          <td className={styles.date}>{new Date(o.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ======================================================
              ORDERS TAB
             ====================================================== */}
          {activeTab === 'orders' && (
            <div className={styles.section}>
              {orders.length === 0 ? (
                <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <UilPackage size="40" style={{ opacity: 0.4, marginBottom: 12 }} />
                  <p>No orders received yet.</p>
                </div>
              ) : (
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
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td className={styles.orderId}>{o.id.slice(0, 8).toUpperCase()}</td>
                          <td>{o.items?.[0]?.title || 'Product Item'}</td>
                          <td>{o.buyerName || 'Buyer'}</td>
                          <td>{o.shippingDistrict || 'Kigali'}</td>
                          <td className={styles.amount}>{formatRWF(o.total)}</td>
                          <td>
                            <select
                              className={styles.statusSelect}
                              value={o.status}
                              onChange={e => updateOrderStatus(o.id, e.target.value)}
                              id={`status-${o.id}`}
                            >
                              {STATUS_OPTIONS.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <Link href="/buyer/orders" className="btn btn-ghost btn-xs" id={`view-order-${o.id}`}>
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ======================================================
              PRODUCTS TAB
             ====================================================== */}
          {activeTab === 'products' && (
            <div className={styles.section}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <Link
                  href="/seller/products/new"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <UilPlus size="15" /> New Product
                </Link>
              </div>
              {products.length === 0 ? (
                <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <UilStore size="40" style={{ opacity: 0.4, marginBottom: 12 }} />
                  <p>No products listed yet.</p>
                  <Link href="/seller/products/new" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                    List Your First Product
                  </Link>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Category</th>
                        <th>Rating</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <td>
                            <div className={styles.productCell}>
                              {p.image && <img src={p.image} alt={p.title} className={styles.productThumb} />}
                              <span className={styles.productName}>{p.title}</span>
                            </div>
                          </td>
                          <td className={styles.amount}>{formatRWF(p.price)}</td>
                          <td>
                            <span className={(p.stock ?? 99) < 20 ? styles.lowStock : styles.inStock}>
                              {p.stock ?? 99}u
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{p.category}</td>
                          <td style={{ color: 'var(--brand-gold)', fontWeight: 700, fontSize: '0.82rem' }}>
                            {p.rating}
                          </td>
                          <td>
                            <div className={styles.actionBtns}>
                              <Link
                                href={`/products/${p.id}`}
                                className="btn btn-ghost btn-xs"
                                id={`view-product-${p.id}`}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}
                              >
                                View
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}
