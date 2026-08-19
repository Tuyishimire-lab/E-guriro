'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UilStore, UilStar, UilMapMarker, UilCheck,
  UilSearch, UilArrowRight, UilShieldCheck, UilPhone,
} from '@/components/Icons';
import styles from './page.module.css';

interface SellerProfile {
  uid: string;
  name: string;
  shopName: string;
  district?: string;
  phone?: string;
  rating: number;
  totalProducts: number;
  verified?: boolean;
}

export default function SellersDirectoryPage() {
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSellers() {
      try {
        const res = await fetch('/api/sellers?verified=true');
        if (res.ok) {
          const data = await res.json();
          setSellers(data);
        }
      } catch (err) {
        console.error('Failed to load sellers', err);
      } finally {
        setLoading(false);
      }
    }
    loadSellers();
  }, []);

  const districts = ['All', ...Array.from(new Set(sellers.map(s => s.district).filter(Boolean)))];

  const filtered = sellers.filter(s => {
    const q = search.toLowerCase();
    const matchQ = s.shopName.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
    const matchD = selectedDistrict === 'All' || s.district === selectedDistrict;
    return matchQ && matchD;
  });

  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      <div className={styles.header}>
        <div>
          <div className={styles.tag}>
            <UilShieldCheck size="14" style={{ color: 'var(--brand-green)' }} />
            Official Tech Partners
          </div>
          <h1 className={styles.title}>Verified Tech Sellers & Stores</h1>
          <p className={styles.sub}>
            Browse trusted Rwandan electronics retailers, mobile shops, and verified gadget suppliers across all provinces.
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <UilSearch size="18" style={{ color: 'var(--text-muted)' }} />
          <input
            className={styles.searchInput}
            placeholder="Search stores by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterPills}>
          {districts.map(d => (
            <button
              key={d}
              className={`${styles.pill} ${selectedDistrict === d ? styles.pillActive : ''}`}
              onClick={() => setSelectedDistrict(d as string)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Sellers Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
          Loading verified sellers...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
          No stores found matching your criteria.
        </div>
      ) : (
        <div className={styles.sellersGrid}>
          {filtered.map(seller => (
            <Link key={seller.uid} href={`/seller/${seller.uid}/store`} className={styles.sellerCard}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  {seller.shopName.charAt(0).toUpperCase()}
                </div>
                <div className={styles.storeMeta}>
                  <div className={styles.storeNameRow}>
                    <h3 className={styles.storeName}>{seller.shopName}</h3>
                    <span className={styles.verifiedBadge}>
                      <UilCheck size="12" /> Verified
                    </span>
                  </div>
                  <span className={styles.location}>
                    <UilMapMarker size="13" /> {seller.district || 'Kigali'}
                  </span>
                </div>
              </div>

              <div className={styles.statsRow}>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{seller.totalProducts}</span>
                  <span className={styles.statLabel}>Products</span>
                </div>
                <div className={styles.stat}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <UilStar size="14" style={{ color: 'var(--brand-gold)' }} />
                    <span className={styles.statNum}>{seller.rating}</span>
                  </div>
                  <span className={styles.statLabel}>Rating</span>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.visitLink}>
                  Visit Storefront <UilArrowRight size="14" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
