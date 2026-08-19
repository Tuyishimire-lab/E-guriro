'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import BrandIcon from '@/components/BrandIcon';
import { PRODUCT_CATEGORIES, FEATURED_BRANDS, formatRWF } from '@/lib/constants';
import type { Product } from '@/lib/types';
import {
  UilShoppingCart, UilStore, UilTruck, UilShieldCheck, UilArrowRight,
  UilStar, UilMobileAndroid, UilCreditCard, UilMoneyBill,
  UilFire, UilAward, UilHeadphones, UilCheck, UilAngleDown,
  /* Category icons */
  UilTablet, UilLaptop, UilCamera, UilPlug, UilWifi,
  UilBolt, UilWatch, UilHistory, UilTvRetro, UilBatteryBolt,
} from '@/components/Icons';
import styles from './page.module.css';

interface SellerItem {
  id?: string;
  uid?: string;
  name: string;
  shopName?: string;
  district?: string;
  rating?: number;
  totalProducts?: number;
  products?: number;
  verified?: boolean;
}

// Category ID -> Unicon component map
const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ size?: string | number; style?: React.CSSProperties }>> = {
  smartphones: UilMobileAndroid,
  tablets:     UilTablet,
  laptops:     UilLaptop,
  tvs:         UilTvRetro,
  audio:       UilHeadphones,
  cameras:     UilCamera,
  accessories: UilPlug,
  gaming:      UilBolt,
  networking:  UilWifi,
  powerbanks:  UilBatteryBolt,
  smartwatches:UilWatch,
  refurbished: UilHistory,
};

// Flash Sale Countdown Timer
function CountdownTimer({ endsAt }: { endsAt: Date }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const update = () => {
      const diff = endsAt.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ h: 0, m: 0, s: 0 }); return; }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return (
    <div className={styles.countdown}>
      {[{ label: 'H', val: timeLeft.h }, { label: 'M', val: timeLeft.m }, { label: 'S', val: timeLeft.s }].map(({ label, val }, i) => (
        <span key={i} className={styles.countdownBlock}>
          <strong>{String(val).padStart(2, '0')}</strong>
          <small>{label}</small>
        </span>
      ))}
    </div>
  );
}

const TRUST_ITEMS = [
  { icon: UilTruck, text: 'Fast Delivery Nationwide' },
  { icon: UilShieldCheck, text: 'Genuine Products Only' },
  { icon: UilAward, text: 'Warranty on Every Device' },
  { icon: UilStore, text: 'Verified Tech Sellers' },
  { icon: UilMobileAndroid, text: 'MTN MoMo & Airtel Pay' },
];

const PAYMENT_METHODS = [
  { icon: UilMobileAndroid, name: 'MTN Mobile Money', desc: 'Dial *182# to confirm' },
  { icon: UilMobileAndroid, name: 'Airtel Money', desc: 'Dial *185# to confirm' },
  { icon: UilCreditCard, name: 'Visa / Mastercard', desc: 'Secure card payments' },
  { icon: UilMoneyBill, name: 'Bank Transfer', desc: 'All Rwandan banks' },
];

export default function HomePage() {
  const flashSaleEnd = new Date(Date.now() + 5 * 3600000);
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<SellerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, sellRes] = await Promise.all([
          fetch('/api/products?limit=50'),
          fetch('/api/sellers'),
        ]);
        if (prodRes.ok) {
          const pData = await prodRes.json();
          setProducts(pData);
        }
        if (sellRes.ok) {
          const sData = await sellRes.json();
          setSellers(sData);
        }
      } catch (e) {
        console.error('Failed to load homepage data', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const flashSaleProducts = products.filter(p => p.badge?.toLowerCase().includes('flash') || p.originalPrice).slice(0, 4);
  const displayFlashSales = flashSaleProducts.length > 0 ? flashSaleProducts : products.slice(0, 4);
  const trendingProducts = products.slice(0, 8);
  const smartphones = products.filter(p => p.category === 'smartphones').slice(0, 4);

  // Category dropdown state
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={styles.page}>

      {/*  HERO  */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <div className={styles.heroTag}>
              <UilMobileAndroid size="14" />
              Rwanda's #1 Tech Store
            </div>
            <h1 className={styles.heroTitle}>
              Find Your Next<br />
              <span className={styles.heroAccent}>Smartphone</span>
              {' '}& Device
            </h1>
            <p className={styles.heroSubtitle}>
              500+ phone models, 50+ top brands, delivered to all 30 Rwandan districts.
              Genuine products, official warranty, and the best local prices.
            </p>
            <div className={styles.heroBtns}>
              <Link href="/products" className="btn btn-primary btn-lg" id="hero-shop-btn"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UilShoppingCart size="20" />
                Shop Devices
              </Link>
              <Link href="/auth/register?role=seller" className="btn btn-secondary btn-lg" id="hero-sell-btn"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <UilStore size="20" />
                Sell on RwandaBuy
              </Link>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}><strong>500+</strong><span>Phone Models</span></div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}><strong>50+</strong><span>Top Brands</span></div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}><strong>30</strong><span>Districts</span></div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}><strong>2K+</strong><span>Tech Sellers</span></div>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroCard}>
              <div className={styles.heroCardInner}>
                <div className={styles.heroImg}></div>
                <p className={styles.heroCardText}>Official Warranty Included</p>
                <p className={styles.heroCardSub}>On all new devices</p>
              </div>
            </div>
            <div className={styles.floatingBadge1}>
              <UilMobileAndroid size="16" />
              MTN MoMo Accepted
            </div>
            <div className={styles.floatingBadge2}>
              <UilFire size="16" />
              Flash Deals Daily
            </div>
          </div>
        </div>

        {/* Trust Bar */}
        <div className={styles.trustBar}>
          <div className="container">
            <div className={styles.trustItems}>
              {TRUST_ITEMS.map((item, i) => {
                const IconComp = item.icon;
                return (
                  <div key={i} className={styles.trustItem}>
                    <IconComp size="20" className={styles.trustIconSvg} />
                    <span className={styles.trustText}>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/*  FEATURED BRANDS  */}
      <section className={styles.brandsSection}>
        <div className="container">
          <div className={styles.brandsSectionHeader}>
            <span className={styles.brandsSectionTitle}>Shop by Brand</span>
            <Link href="/products" className="view-all-link" style={{ fontSize: '0.8rem' }}>
              All Brands <UilArrowRight size="14" />
            </Link>
          </div>
          {/* Logo grid */}
          <div className={styles.brandsLogoGrid}>
            {FEATURED_BRANDS.map(brand => (
              <Link
                key={brand.id}
                href={`/products?brand=${brand.id}`}
                className={styles.brandLogoCard}
                id={`brand-${brand.id}`}
                title={brand.label}
              >
                <BrandIcon brand={brand.id} color={brand.color} size={44} />
                <span className={styles.brandLogoName}>{brand.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/*  CATEGORIES DROPDOWN  */}
      <section className="section" style={{ paddingTop: 'var(--space-xl)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Browse Categories</h2>
            <Link href="/products" className="view-all-link">
              View All <UilArrowRight size="16" />
            </Link>
          </div>

          {/* Dropdown trigger */}
          <div className={styles.catDropdownWrap} ref={catRef}>
            <button
              className={styles.catDropdownTrigger}
              onClick={() => setCatOpen(o => !o)}
              id="categories-dropdown-btn"
              aria-expanded={catOpen}
              aria-haspopup="true"
            >
              <UilMobileAndroid size="16" style={{ color: 'var(--brand-green)' }} />
              <span>All Categories</span>
              <UilAngleDown
                size="16"
                style={{ marginLeft: 'auto', transition: 'transform 0.2s', transform: catOpen ? 'rotate(180deg)' : 'none', color: 'var(--text-muted)' }}
              />
            </button>

            {/* The dropdown panel */}
            {catOpen && (
              <div className={styles.catDropdownPanel} role="menu">
                <div className={styles.catDropdownGrid}>
                  {PRODUCT_CATEGORIES.map(cat => {
                    const IconComp = CATEGORY_ICON_MAP[cat.id];
                    return (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.id}`}
                        className={styles.catDropdownItem}
                        id={`category-${cat.id}`}
                        onClick={() => setCatOpen(false)}
                        role="menuitem"
                        style={{ '--cat-color': cat.color } as React.CSSProperties}
                      >
                        <div
                          className={styles.catDropdownIcon}
                          style={{ background: `${cat.color}1A`, borderColor: `${cat.color}40` }}
                        >
                          {IconComp && <IconComp size="20" style={{ color: cat.color }} />}
                        </div>
                        <span className={styles.catDropdownLabel}>{cat.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>


      {/*  FLASH SALE  */}
      <section className={styles.flashSaleSection}>
        <div className="container">
          <div className={styles.flashSaleHeader}>
            <div>
              <div className={styles.flashSaleLabel}>
                <UilFire size="18" style={{ color: '#ef4444' }} />
                Flash Sale
              </div>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Today's Tech Deals</h2>
            </div>
            <div className={styles.flashSaleRight}>
              <p className={styles.endsIn}>Ends in:</p>
              <CountdownTimer endsAt={flashSaleEnd} />
              <Link href="/products?sale=flash" className="btn btn-ghost btn-sm">View All</Link>
            </div>
          </div>
          <div className="products-grid">
            {displayFlashSales.map(p => (
              <ProductCard key={p.id} {...p} badge="Flash Sale" />
            ))}
          </div>
        </div>
      </section>

      {/*  PHONE COMPARISON TEASER  */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Compare Top Phones</h2>
            <Link href="/products?category=smartphones" className="view-all-link">
              Compare More <UilArrowRight size="16" />
            </Link>
          </div>
          <div className={styles.compareGrid}>
            {smartphones.slice(0, 3).map((phone, i) => {
              const pSpecs = phone.specs || {};
              return (
                <div key={phone.id} className={`${styles.compareCard} ${i === 1 ? styles.compareCardFeatured : ''}`}>
                  {i === 1 && <div className={styles.compareFeaturedBadge}>Most Popular</div>}
                  <div className={styles.compareBrandRow}>
                    <span className={styles.compareBrand}>{phone.brand || 'RwandaBuy'}</span>
                  </div>
                  <h3 className={styles.compareName}>{phone.title}</h3>
                  <div className={styles.comparePrice}>{formatRWF(phone.price)}</div>
                  <div className={styles.compareSpecs}>
                    {[
                      { label: 'RAM', value: pSpecs.ram || '8GB' },
                      { label: 'Storage', value: pSpecs.storage || '128GB' },
                      { label: 'Camera', value: pSpecs.camera || '50MP' },
                      { label: 'Battery', value: pSpecs.battery || '5000mAh' },
                    ].map(spec => (
                      <div key={spec.label} className={styles.compareSpecRow}>
                        <span className={styles.compareSpecLabel}>{spec.label}</span>
                        <span className={styles.compareSpecValue}>
                          <UilCheck size="12" style={{ color: 'var(--brand-green)' }} />
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/products/${phone.id}`}
                    className={`btn ${i === 1 ? 'btn-primary' : 'btn-secondary'} btn-sm btn-full`}
                    id={`compare-buy-${phone.id}`}
                  >
                    View Details
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/*  TOP SMARTPHONES  */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Top Smartphones</h2>
            <Link href="/products?category=smartphones" className="view-all-link">
              View All <UilArrowRight size="16" />
            </Link>
          </div>
          <div className="products-grid">
            {smartphones.map(p => <ProductCard key={p.id} {...p} />)}
          </div>
        </div>
      </section>

      {/*  FEATURED SELLERS  */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Top Tech Sellers</h2>
            <Link href="/sellers" className="view-all-link">
              View All <UilArrowRight size="16" />
            </Link>
          </div>
          <div className={styles.sellersGrid}>
            {sellers.map(seller => {
              const sId = seller.uid || seller.id || '';
              const sName = seller.shopName || seller.name || 'Tech Seller';
              return (
                <Link key={sId} href={`/seller/${sId}/store`} className={styles.sellerCard}>
                  <div className={styles.sellerAvatar}>{sName.charAt(0)}</div>
                  <div className={styles.sellerInfo}>
                    <div className={styles.sellerTop}>
                      <h3 className={styles.sellerName}>{sName}</h3>
                      <span className={styles.verifiedBadge}>Verified</span>
                    </div>
                    <p className={styles.sellerMeta}>
                      {seller.totalProducts ?? seller.products ?? 0} Products &nbsp;|&nbsp; {seller.district || 'Kigali'}
                    </p>
                    <div className={styles.sellerRating}>
                      <UilStar size="14" className={styles.starIcon} />
                      <strong>{seller.rating && seller.rating > 0 ? seller.rating : '4.8'}</strong>
                      <span className={styles.ratingLabel}>Rating</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/*  TRENDING  */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Trending Gadgets</h2>
            <Link href="/products" className="view-all-link">
              View All <UilArrowRight size="16" />
            </Link>
          </div>
          <div className="products-grid">
            {trendingProducts.map(p => <ProductCard key={p.id} {...p} />)}
          </div>
        </div>
      </section>

      {/*  CTA BANNER  */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaInner}>
            <div>
              <h2 className={styles.ctaTitle}>Start Selling Electronics Today</h2>
              <p className={styles.ctaText}>
                Join 2,000+ tech sellers and reach buyers across all 30 Rwandan districts.
                Set up your gadget store in under 5 minutes.
              </p>
            </div>
            <Link href="/auth/register?role=seller" className="btn btn-gold btn-lg" id="cta-sell-btn"
              style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
              <UilStore size="20" />
              Open Your Tech Store
            </Link>
          </div>
        </div>
      </section>

      {/*  PAYMENT METHODS  */}
      <section className="section">
        <div className="container">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '32px' }}>
            We Accept
          </h2>
          <div className={styles.paymentGrid}>
            {PAYMENT_METHODS.map((method, i) => {
              const IconComp = method.icon;
              return (
                <div key={i} className={styles.paymentCard}>
                  <div className={styles.paymentIconWrap}><IconComp size="32" /></div>
                  <h3 className={styles.paymentName}>{method.name}</h3>
                  <p className={styles.paymentDesc}>{method.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
