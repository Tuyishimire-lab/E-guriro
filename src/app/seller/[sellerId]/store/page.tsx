'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { PRODUCT_CATEGORIES, formatRWF } from '@/lib/constants';
import type { Product } from '@/lib/types';
import {
  UilStore, UilMapMarker, UilCheckCircle, UilStar, UilPackage,
  UilPhone, UilComment, UilSearch, UilSlidersV, UilRefresh,
} from '@/components/Icons';
import styles from './page.module.css';

interface SellerData {
  uid: string;
  name: string;
  shopName?: string;
  district?: string;
  phone?: string;
  rating?: number;
  verified?: boolean;
  status?: string;
  specialty?: string;
  totalProducts?: number;
}

const SORT_OPTIONS = [
  { value: 'default',    label: 'Featured' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Highest Rated' },
  { value: 'newest',     label: 'Newest' },
];

export default function SellerStorePage() {
  const { sellerId } = useParams<{ sellerId: string }>();

  const [seller, setSeller]           = useState<SellerData | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState('all');
  const [sort, setSort]               = useState('default');

  useEffect(() => {
    async function loadStore() {
      if (!sellerId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/sellers/${sellerId}`);
        if (res.ok) {
          const data = await res.json();
          setSeller(data.seller);
          setAllProducts(data.products || []);
        }
      } catch (e) {
        console.error('Failed to load seller store', e);
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, [sellerId]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
          <UilRefresh size="36" className="spin-icon" style={{ marginBottom: 16, opacity: 0.7 }} />
          <p style={{ fontSize: '1.1rem' }}>Loading seller store...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: 12 }}>Seller Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>This seller store does not exist or has been deactivated.</p>
          <Link href="/products" className="btn btn-primary">Browse All Products</Link>
        </div>
      </div>
    );
  }

  const sellerName = seller.shopName || seller.name || 'Seller Store';

  // Unique categories that this seller has products in
  const sellerCategories: string[] = ['all', ...Array.from(new Set(allProducts.map(p => p.category).filter((c): c is string => Boolean(c))))];

  const filtered = allProducts
    .filter(p => category === 'all' || p.category === category)
    .filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      switch (sort) {
        case 'price_asc':  return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'rating':     return b.rating - a.rating;
        default:           return 0;
      }
    });

  const avgRating = allProducts.length
    ? allProducts.reduce((s, p) => s + p.rating, 0) / allProducts.length
    : (seller.rating || 4.8);

  const minPrice = allProducts.length
    ? Math.min(...allProducts.map(p => p.price))
    : 0;

  const categoryLabel = (id: string) =>
    PRODUCT_CATEGORIES.find(c => c.id === id)?.label ?? id;

  return (
    <div className={styles.page}>

      {/* ===== STORE BANNER ===== */}
      <div className={styles.banner}>
        <div className={styles.bannerInner}>
          <div className={styles.avatarWrap}>
            <span className={styles.avatar}>{sellerName.charAt(0)}</span>
            <span className={styles.verifiedBadge}>
              <UilCheckCircle size="14" />
            </span>
          </div>

          <div className={styles.storeInfo}>
            <div className={styles.storeNameRow}>
              <h1 className={styles.storeName}>{sellerName}</h1>
              <span className={styles.verifiedTag}>
                <UilCheckCircle size={12} /> Verified Seller
              </span>
            </div>
            {seller.specialty && <p className={styles.storeSpecialty}>{seller.specialty}</p>}
            <div className={styles.storeMeta}>
              <span><UilMapMarker size="13" /> {seller.district || 'Kigali'}, Rwanda</span>
              <span><UilStore size="13" /> {allProducts.length} Products</span>
              <span>
                <UilStar size="13" style={{ color: 'var(--brand-gold)' }} />
                {avgRating.toFixed(1)} Rating
              </span>
            </div>
          </div>

          <div className={styles.storeActions}>
            <Link href="/chat" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UilComment size="15" /> Message
            </Link>
            {seller.phone && (
              <a href={`tel:${seller.phone}`} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <UilPhone size="15" /> Call
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ===== KPI STRIP ===== */}
      <div className={styles.kpiStrip}>
        <div className={styles.kpi}>
          <strong>{allProducts.length}</strong>
          <span>Listed Products</span>
        </div>
        <div className={styles.kpiDivider} />
        <div className={styles.kpi}>
          <strong style={{ color: 'var(--brand-gold)' }}>{avgRating.toFixed(1)}</strong>
          <span>Average Rating</span>
        </div>
        <div className={styles.kpiDivider} />
        <div className={styles.kpi}>
          <strong style={{ color: 'var(--brand-green)' }}>{minPrice > 0 ? formatRWF(minPrice) : 'N/A'}</strong>
          <span>Lowest Price</span>
        </div>
        <div className={styles.kpiDivider} />
        <div className={styles.kpi}>
          <strong>{allProducts.reduce((s, p) => s + (p.reviews ?? 0), 0).toLocaleString()}</strong>
          <span>Total Reviews</span>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className={styles.content}>

        {/* ---- Filters sidebar ---- */}
        <aside className={styles.sidebar}>
          <p className={styles.sidebarTitle}>Categories</p>
          <div className={styles.catList}>
            {sellerCategories.map(c => (
              <button
                key={c}
                className={`${styles.catBtn} ${category === c ? styles.catBtnActive : ''}`}
                onClick={() => setCategory(c)}
              >
                {c === 'all' ? 'All Products' : categoryLabel(c)}
                <span className={styles.catCount}>
                  {c === 'all'
                    ? allProducts.length
                    : allProducts.filter(p => p.category === c).length}
                </span>
              </button>
            ))}
          </div>
        </aside>

        {/* ---- Product grid ---- */}
        <div className={styles.gridSection}>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <UilSearch size="16" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                className={styles.searchInput}
                placeholder="Search in this store..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <UilSlidersV size="15" style={{ color: 'var(--text-muted)' }} />
              <select
                className={styles.sortSelect}
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Result count */}
          <p className={styles.resultCount}>
            <strong>{filtered.length}</strong> product{filtered.length !== 1 ? 's' : ''}
            {category !== 'all' && <> in <em>{categoryLabel(category)}</em></>}
            {search && <> matching <em>"{search}"</em></>}
          </p>

          {/* Grid or empty state */}
          {filtered.length > 0 ? (
            <div className={styles.grid}>
              {filtered.map(p => (
                <ProductCard key={p.id} {...p} reviews={p.reviews ?? 0} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <UilPackage size="48" style={{ color: 'var(--border-color)', marginBottom: 12 }} />
              <p className={styles.emptyTitle}>No products found</p>
              <p className={styles.emptySub}>
                {search ? `No results for "${search}"` : 'This seller has no products in this category yet.'}
              </p>
              <button
                className="btn btn-ghost btn-sm"
                style={{ marginTop: 14 }}
                onClick={() => { setSearch(''); setCategory('all'); }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
