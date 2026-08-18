'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { MOCK_PRODUCTS, MOCK_SELLERS, PRODUCT_CATEGORIES, formatRWF } from '@/lib/constants';
import {
  UilStore, UilMapMarker, UilCheckCircle, UilStar, UilPackage,
  UilPhone, UilComment, UilSearch, UilSlidersV,
} from '@/components/Icons';
import styles from './page.module.css';

const SORT_OPTIONS = [
  { value: 'default',    label: 'Featured' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Highest Rated' },
  { value: 'newest',     label: 'Newest' },
];

export default function SellerStorePage() {
  const { sellerId } = useParams<{ sellerId: string }>();

  const seller = MOCK_SELLERS.find(s => s.id === sellerId) ?? MOCK_SELLERS[0];
  const allProducts = MOCK_PRODUCTS.filter(p => p.sellerId === (seller?.id ?? sellerId));

  const [search, setSearch]   = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort]       = useState('default');

  // Unique categories that this seller has products in
  const sellerCategories = ['all', ...Array.from(new Set(allProducts.map(p => p.category)))];

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

  const totalRevenue = allProducts.reduce((sum, p) => sum + p.price, 0);
  const avgRating    = allProducts.length
    ? allProducts.reduce((s, p) => s + p.rating, 0) / allProducts.length
    : 0;

  const categoryLabel = (id: string) =>
    PRODUCT_CATEGORIES.find(c => c.id === id)?.label ?? id;

  return (
    <div className={styles.page}>

      {/* ===== STORE BANNER ===== */}
      <div className={styles.banner}>
        <div className={styles.bannerInner}>
          <div className={styles.avatarWrap}>
            <span className={styles.avatar}>{seller.name.charAt(0)}</span>
            {seller.verified && (
              <span className={styles.verifiedBadge}>
                <UilCheckCircle size="14" />
              </span>
            )}
          </div>

          <div className={styles.storeInfo}>
            <div className={styles.storeNameRow}>
              <h1 className={styles.storeName}>{seller.name}</h1>
              {seller.verified && (
                <span className={styles.verifiedTag}>
                  <UilCheckCircle size="12" /> Verified Seller
                </span>
              )}
            </div>
            <p className={styles.storeSpecialty}>{seller.specialty}</p>
            <div className={styles.storeMeta}>
              <span><UilMapMarker size="13" /> {seller.district}, Rwanda</span>
              <span><UilStore size="13" /> {seller.products} Products</span>
              <span>
                <UilStar size="13" style={{ color: 'var(--brand-gold)' }} />
                {seller.rating} Rating
              </span>
            </div>
          </div>

          <div className={styles.storeActions}>
            <Link href="/chat" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UilComment size="15" /> Message
            </Link>
            <a href="tel:+250788000000" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UilPhone size="15" /> Call
            </a>
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
          <strong style={{ color: 'var(--brand-green)' }}>{formatRWF(Math.min(...allProducts.map(p => p.price)))}</strong>
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
