'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { formatRWF } from '@/lib/constants';
import type { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import {
  UilShoppingCart, UilBolt, UilShieldCheck, UilTruck, UilCornerUpLeft,
  UilPhone, UilStar, UilCheckCircle, UilHeart, UilShare,
  UilStore, UilMapMarker, UilClock, UilAngleRight, UilRefresh,
} from '@/components/Icons';
import styles from './page.module.css';

function StarRating({ rating, size = 16, interactive = false, onRate }: {
  rating: number; size?: number; interactive?: boolean; onRate?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className={styles.stars}>
      {[1,2,3,4,5].map(s => (
        <UilStar
          key={s}
          size={size}
          onClick={() => interactive && onRate?.(s)}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          style={{
            fill: s <= (hovered || Math.round(rating)) ? 'var(--brand-gold)' : 'transparent',
            color: 'var(--brand-gold)',
            opacity: s <= (hovered || Math.round(rating)) ? 1 : 0.3,
            cursor: interactive ? 'pointer' : 'default',
            transition: 'all 0.1s',
          }}
        />
      ))}
    </div>
  );
}

const INITIAL_REVIEWS = [
  { id: 1, user: 'Amina U.',     avatar: 'A', rating: 5, comment: 'Excellent product! Delivered quickly to Kicukiro. Battery life is amazing and the screen is brilliant.', date: 'Aug 10, 2026', verified: true,  helpful: 12 },
  { id: 2, user: 'Jean Paul K.', avatar: 'J', rating: 4, comment: 'Good quality, great packaging and the seller was very responsive. Camera quality exceeded my expectations.', date: 'Aug 5, 2026',  verified: true,  helpful: 8  },
  { id: 3, user: 'Marie C.',     avatar: 'M', rating: 5, comment: 'I love it! Will definitely buy again from this seller. Came with all accessories and original box.',           date: 'Jul 28, 2026', verified: false, helpful: 4  },
];

const COLOR_OPTIONS  = ['Midnight Black', 'Pearl White', 'Deep Blue'];
const STORAGE_OPTIONS = ['128GB', '256GB', '512GB'];
const TABS = ['Overview', 'Specifications', 'Reviews', 'Questions'] as const;
type Tab = typeof TABS[number];

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product,      setProduct]      = useState<Product | null>(null);
  const [related,      setRelated]      = useState<Product[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [reviews,      setReviews]      = useState(INITIAL_REVIEWS);
  const [qty,          setQty]         = useState(1);
  const [activeImage,  setActiveImage]  = useState(0);
  const [activeTab,    setActiveTab]    = useState<Tab>('Overview');
  const [selColor,     setSelColor]     = useState(0);
  const [selStorage,   setSelStorage]   = useState(1);
  const [wishlisted,   setWishlisted]   = useState(false);
  const [myRating,     setMyRating]     = useState(0);
  const [reviewText,   setReviewText]   = useState('');
  const [notification, setNotif]        = useState('');

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data: Product = await res.json();
          setProduct(data);

          // Fetch related in same category
          if (data.category) {
            const relRes = await fetch(`/api/products?category=${data.category}&limit=5`);
            if (relRes.ok) {
              const relData: Product[] = await relRes.json();
              setRelated(relData.filter(p => p.id !== data.id).slice(0, 4));
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch product', e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
          <UilRefresh size="36" className="spin-icon" style={{ marginBottom: 16, opacity: 0.7 }} />
          <p style={{ fontSize: '1.1rem' }}>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: 12 }}>Product Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>The device or electronic item you requested does not exist or has been removed.</p>
          <Link href="/products" className="btn btn-primary">Browse All Products</Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  const specs  = product.specs ?? {};
  const stock  = product.stock ?? 99;
  const images = (product.images && product.images.length > 0)
    ? product.images
    : [product.image, product.image, product.image, product.image].filter(Boolean);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addToCart({ id: product.id, title: product.title, price: product.price, image: product.image, seller: product.seller, sellerId: product.sellerId ?? '', stock });
    }
    setNotif(`${qty}x "${product.title}" added to cart!`);
    setTimeout(() => setNotif(''), 3000);
  };

  return (
    <div className={styles.page}>

      {/* BREADCRUMB */}
      <div className="container">
        <nav className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <UilAngleRight size={13} className={styles.breadSep} />
          <Link href="/products">Products</Link>
          <UilAngleRight size={13} className={styles.breadSep} />
          {product.category && (
            <>
              <Link href={`/products?category=${product.category}`} className={styles.breadCat}>
                {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </Link>
              <UilAngleRight size={13} className={styles.breadSep} />
            </>
          )}
          <span className={styles.breadCurrent}>{product.title}</span>
        </nav>
      </div>

      {/* ====== 2-COLUMN PRODUCT AREA ====== */}
      <div className="container">
        <div className={styles.productLayout}>

          {/* LEFT — Image gallery */}
          <div className={styles.galleryCol}>
            {/* Main image */}
            <div className={styles.mainImage}>
              <img src={images[activeImage]} alt={product.title} />
              {discount > 0 && (
                <span className={styles.discountBadge}>-{discount}% OFF</span>
              )}
              {product.condition === 'refurbished' && (
                <span className={styles.refurbBadge}>Refurbished</span>
              )}
            </div>

            {/* Thumbnail row */}
            <div className={styles.thumbRow}>
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${activeImage === i ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImage(i)}
                  id={`thumb-${i}`}
                >
                  <img src={img} alt={`View ${i + 1}`} />
                </button>
              ))}
            </div>

            {/* Wishlist / Share */}
            <div className={styles.galleryActions}>
              <button
                className={`${styles.galleryBtn} ${wishlisted ? styles.galBtnActive : ''}`}
                onClick={() => setWishlisted(w => !w)}
                id="wishlist-btn"
              >
                <UilHeart size={16} />
                {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
              <button className={styles.galleryBtn} id="share-btn">
                <UilShare size={16} />
                Share
              </button>
            </div>
          </div>

          {/* RIGHT — All info + purchase actions in ONE column */}
          <div className={styles.infoCol}>

            {/* Chips */}
            <div className={styles.topChips}>
              {product.brand && <span className={styles.brandChip}>{product.brand}</span>}
              {product.badge && <span className={styles.badgeChip}>{product.badge}</span>}
              {product.condition && (
                <span className={`${styles.condChip} ${product.condition === 'new' ? styles.condNew : styles.condRefurb}`}>
                  {product.condition === 'new' ? 'Brand New' : 'Refurbished'}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className={styles.productTitle}>{product.title}</h1>

            {/* Rating row */}
            <div className={styles.ratingRow}>
              <span className={styles.ratingNum}>{product.rating}</span>
              <StarRating rating={product.rating} size={15} />
              <span className={styles.reviewCount}>({product.reviews} reviews)</span>
              <span className={styles.dotSep}>|</span>
              <span className={`${styles.stockChip} ${stock > 10 ? styles.inStock : styles.lowStock}`}>
                {stock > 10 ? 'In Stock' : `Only ${stock} left`}
              </span>
            </div>

            {/* Price */}
            <div className={styles.priceRow}>
              <span className={styles.price}>{formatRWF(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className={styles.origPrice}>{formatRWF(product.originalPrice)}</span>
                  <span className={styles.savePill}>
                    Save {formatRWF(product.originalPrice - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Warranty banner */}
            {product.warranty && (
              <div className={styles.warrantyBanner}>
                <UilShieldCheck size={15} />
                <span>{product.warranty} Official Warranty Included</span>
              </div>
            )}

            <div className={styles.divider} />

            {/* Quick specs */}
            {Object.values(specs).some(Boolean) && (
              <div className={styles.specsGrid}>
                {specs.ram       && <div className={styles.specPill}><span className={styles.spLabel}>RAM</span><strong>{specs.ram}</strong></div>}
                {specs.storage   && <div className={styles.specPill}><span className={styles.spLabel}>Storage</span><strong>{STORAGE_OPTIONS[selStorage]}</strong></div>}
                {specs.camera    && <div className={styles.specPill}><span className={styles.spLabel}>Camera</span><strong>{specs.camera}</strong></div>}
                {specs.battery   && <div className={styles.specPill}><span className={styles.spLabel}>Battery</span><strong>{specs.battery}</strong></div>}
                {specs.screen    && <div className={styles.specPill}><span className={styles.spLabel}>Display</span><strong>{specs.screen}</strong></div>}
                {specs.processor && <div className={styles.specPill}><span className={styles.spLabel}>Chip</span><strong>{specs.processor}</strong></div>}
              </div>
            )}

            {/* Color picker */}
            <div className={styles.variantRow}>
              <span className={styles.varLabel}>Color: <strong>{COLOR_OPTIONS[selColor]}</strong></span>
              <div className={styles.colorDots}>
                {['#1a1a2e', '#f0ebe3', '#003566'].map((hex, i) => (
                  <button
                    key={i}
                    className={`${styles.colorDot} ${selColor === i ? styles.colorDotActive : ''}`}
                    style={{ background: hex }}
                    onClick={() => setSelColor(i)}
                    title={COLOR_OPTIONS[i]}
                    id={`color-${i}`}
                  />
                ))}
              </div>
            </div>

            {/* Storage picker */}
            <div className={styles.variantRow}>
              <span className={styles.varLabel}>Storage</span>
              <div className={styles.storageBtns}>
                {STORAGE_OPTIONS.map((s, i) => (
                  <button
                    key={s}
                    className={`${styles.storageBtn} ${selStorage === i ? styles.storageBtnActive : ''}`}
                    onClick={() => setSelStorage(i)}
                    id={`storage-${s}`}
                  >{s}</button>
                ))}
              </div>
            </div>

            <div className={styles.divider} />

            {/* Qty + total */}
            <div className={styles.qtyRow}>
              <span className={styles.qtyLabel}>Quantity</span>
              <div className={styles.qtyControls}>
                <button className={styles.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))} id="qty-dec">-</button>
                <span className={styles.qtyNum}>{qty}</span>
                <button className={styles.qtyBtn} onClick={() => setQty(q => Math.min(stock, q + 1))} id="qty-inc">+</button>
              </div>
              <span className={styles.totalLine}>
                Total: <strong>{formatRWF(product.price * qty)}</strong>
              </span>
            </div>

            {/* Cart notification */}
            {notification && (
              <div className={styles.cartNotice}>
                <UilCheckCircle size={16} /> {notification}
              </div>
            )}

            {/* CTA buttons */}
            <div className={styles.ctaRow}>
              <button className={styles.addToCartBtn} onClick={handleAddToCart} id="add-to-cart-btn">
                <UilShoppingCart size={18} />
                Add to Cart
              </button>
              <Link href="/checkout" className={styles.buyNowBtn} onClick={handleAddToCart} id="buy-now-btn">
                <UilBolt size={18} />
                Buy Now
              </Link>
            </div>

            {/* Trust row */}
            <div className={styles.trustGrid}>
              <div className={styles.trustItem}>
                <UilTruck size={18} className={styles.trustIcon} />
                <div>
                  <strong>Free Delivery</strong>
                  <p>2-5 days nationwide</p>
                </div>
              </div>
              <div className={styles.trustItem}>
                <UilShieldCheck size={18} className={styles.trustIcon} />
                <div>
                  <strong>{product.warranty ?? '1 Year'} Warranty</strong>
                  <p>Official manufacturer</p>
                </div>
              </div>
              <div className={styles.trustItem}>
                <UilCornerUpLeft size={18} className={styles.trustIcon} />
                <div>
                  <strong>7-Day Returns</strong>
                  <p>Hassle-free policy</p>
                </div>
              </div>
              <div className={styles.trustItem}>
                <UilPhone size={18} className={styles.trustIcon} />
                <div>
                  <strong>24/7 Support</strong>
                  <p>Chat or call us</p>
                </div>
              </div>
            </div>

            {/* Payment methods */}
            <div className={styles.payRow}>
              <span className={styles.payLabel}>Accepted payments:</span>
              <span className={styles.payPill}>MTN MoMo</span>
              <span className={styles.payPill}>Airtel Money</span>
              <span className={styles.payPill}>Visa / Card</span>
            </div>

            <div className={styles.divider} />

            {/* Seller card */}
            <Link href={`/seller/${product.sellerId}/store`} className={styles.sellerCard}>
              <div className={styles.sellerAvatar}>{product.seller.charAt(0)}</div>
              <div className={styles.sellerInfo}>
                <p className={styles.sellerName}>{product.seller}</p>
                <p className={styles.sellerSub}>
                  <UilMapMarker size={11} /> {(product as any).district || 'Kigali, Rwanda'}
                  &nbsp;|&nbsp;
                  <UilCheckCircle size={11} style={{ color: 'var(--brand-green)' }} /> Verified Seller
                </p>
              </div>
              <span className={styles.viewStore}>
                <UilStore size={14} /> View Store
              </span>
            </Link>

          </div>{/* end infoCol */}
        </div>{/* end productLayout */}
      </div>

      {/* ====== TABS ====== */}
      <div className={styles.tabsBar}>
        <div className="container">
          <div className={styles.tabBtns}>
            {TABS.map(tab => (
              <button
                key={tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab(tab)}
                id={`tab-${tab.toLowerCase()}`}
              >{tab}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        <div className={styles.tabBody}>

          {/* OVERVIEW */}
          {activeTab === 'Overview' && (
            <div className={styles.overviewGrid}>
              <div>
                <h2 className={styles.tabH2}>About this product</h2>
                <p className={styles.overviewText}>
                  The {product.title} is a premium device crafted for those who demand the best.
                  Featuring a stunning display, flagship-grade camera system, and all-day battery life,
                  it delivers a seamless experience whether you are working, gaming, or staying connected.
                  This unit is sourced directly from the manufacturer and comes with an official warranty,
                  fully supported across all 30 districts of Rwanda.
                </p>

                <h3 className={styles.tabH3}>Key Highlights</h3>
                <ul className={styles.highlightList}>
                  {specs.ram       && <li><UilCheckCircle size={14} /><span>{specs.ram} RAM for smooth multitasking</span></li>}
                  {specs.storage   && <li><UilCheckCircle size={14} /><span>{specs.storage} high-speed internal storage</span></li>}
                  {specs.camera    && <li><UilCheckCircle size={14} /><span>{specs.camera} camera system for stunning photos</span></li>}
                  {specs.battery   && <li><UilCheckCircle size={14} /><span>{specs.battery} battery for all-day use</span></li>}
                  {specs.screen    && <li><UilCheckCircle size={14} /><span>{specs.screen} immersive display</span></li>}
                  <li><UilCheckCircle size={14} /><span>{product.warranty ?? '1 Year'} official warranty included</span></li>
                  <li><UilCheckCircle size={14} /><span>Delivery available to all 30 Rwandan districts</span></li>
                </ul>

                <h3 className={styles.tabH3}>What is in the Box</h3>
                <div className={styles.boxList}>
                  {['Device', 'USB-C Charging Cable', 'Wall Adapter (25W)', 'Protective Case', 'Quick Start Guide', 'Warranty Card'].map(item => (
                    <span key={item} className={styles.boxItem}>
                      <UilCheckCircle size={12} /> {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.overviewSide}>
                <div className={styles.sideCard}>
                  <h4 className={styles.sideCardTitle}><UilTruck size={15} /> Delivery Info</h4>
                  <div className={styles.deliveryRows}>
                    {[
                      ['Kigali City', '1-2 days', 'RWF 1,500'],
                      ['Other Provinces', '3-5 days', 'RWF 4,000'],
                      ['Express (same day)', 'Today', 'RWF 8,000'],
                    ].map(([zone, time, fee]) => (
                      <div key={zone} className={styles.delivRow}>
                        <span>{zone}</span>
                        <span className={styles.delivRight}>
                          <UilClock size={11} /> {time} &nbsp; {fee}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.sideCard}>
                  <h4 className={styles.sideCardTitle}><UilShieldCheck size={15} /> Warranty Coverage</h4>
                  <p className={styles.sideCardText}>
                    Includes a <strong>{product.warranty ?? '1-Year'}</strong> official manufacturer warranty
                    covering hardware defects. Claim support at our Kigali service centers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SPECIFICATIONS */}
          {activeTab === 'Specifications' && (
            <div>
              <h2 className={styles.tabH2}>Full Specifications</h2>
              <div className={styles.specsTableGrid}>
                {[
                  { section: 'Performance', rows: [
                    ['Processor', specs.processor ?? 'Flagship Chipset'],
                    ['RAM', specs.ram ?? 'N/A'],
                    ['Storage', STORAGE_OPTIONS[selStorage]],
                    ['OS', 'Android 14 / Latest iOS'],
                  ]},
                  { section: 'Display', rows: [
                    ['Screen', specs.screen ?? '6.7"'],
                    ['Resolution', 'FHD+ (2400 x 1080)'],
                    ['Refresh Rate', '120Hz AMOLED'],
                    ['Protection', 'Gorilla Glass Victus'],
                  ]},
                  { section: 'Camera', rows: [
                    ['Rear', specs.camera ?? '50MP'],
                    ['Front', '12MP Ultra-wide'],
                    ['Video', '4K @ 60fps'],
                    ['Features', 'OIS, Night Mode, AI Scene'],
                  ]},
                  { section: 'Battery', rows: [
                    ['Capacity', specs.battery ?? '4500mAh'],
                    ['Charging', '65W Wired, 15W Wireless'],
                    ['Estimated Life', 'Up to 2 days'],
                  ]},
                  { section: 'Connectivity', rows: [
                    ['Network', '5G / LTE'],
                    ['Wi-Fi', 'Wi-Fi 6E (802.11ax)'],
                    ['Bluetooth', '5.3'],
                    ['NFC', 'Yes'],
                    ['USB', 'USB-C 3.2 Gen 2'],
                  ]},
                  { section: 'Physical', rows: [
                    ['Dimensions', '163 x 75 x 7.6 mm'],
                    ['Weight', '195g'],
                    ['Colors', COLOR_OPTIONS.join(', ')],
                    ['Water Resistance', 'IP68'],
                    ['SIM', 'Dual SIM (Nano)'],
                  ]},
                ].map(({ section, rows }) => (
                  <div key={section} className={styles.specBlock}>
                    <div className={styles.specBlockHead}>{section}</div>
                    <table className={styles.specTable}>
                      <tbody>
                        {rows.map(([label, val]) => (
                          <tr key={label}>
                            <td className={styles.specLabel}>{label}</td>
                            <td className={styles.specVal}>{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REVIEWS */}
          {activeTab === 'Reviews' && (
            <div className={styles.reviewsLayout}>
              <div className={styles.reviewSummary}>
                <div className={styles.bigRating}>{product.rating.toFixed(1)}</div>
                <StarRating rating={product.rating} size={20} />
                <p className={styles.reviewCount} style={{ marginTop: 6 }}>{product.reviews} reviews</p>
                <div className={styles.ratingBars}>
                  {[5,4,3,2,1].map(star => {
                    const pct = star===5?65:star===4?20:star===3?10:star===2?3:2;
                    return (
                      <div key={star} className={styles.rBar}>
                        <span className={styles.rBarLabel}>{star}</span>
                        <div className={styles.rBarBg}><div className={styles.rBarFill} style={{ width: `${pct}%` }} /></div>
                        <span className={styles.rBarPct}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.reviewsList}>
                {reviews.map(r => (
                  <div key={r.id} className={styles.reviewCard}>
                    <div className={styles.reviewHead}>
                      <div className={styles.reviewAvatar}>{r.avatar}</div>
                      <div>
                        <div className={styles.reviewUser}>
                          {r.user}
                          {r.verified && (
                            <span className={styles.verifiedTag}>
                              <UilCheckCircle size={10} /> Verified
                            </span>
                          )}
                        </div>
                        <StarRating rating={r.rating} size={13} />
                      </div>
                      <span className={styles.reviewDate}>{r.date}</span>
                    </div>
                    <p className={styles.reviewText}>{r.comment}</p>
                    <div className={styles.reviewFooter}>
                      <span className={styles.helpfulLabel}>Helpful?</span>
                      <button className={styles.helpfulBtn} id={`helpful-${r.id}`}>Yes ({r.helpful})</button>
                      <button className={styles.helpfulBtn} id={`no-${r.id}`}>No</button>
                    </div>
                  </div>
                ))}

                <div className={styles.writeReview}>
                  <h3 className={styles.tabH3}>Write a Review</h3>
                  <div className={styles.rateRow}>
                    <span className={styles.varLabel}>Your rating:</span>
                    <StarRating rating={myRating} size={22} interactive onRate={setMyRating} />
                  </div>
                  <textarea
                    className={styles.reviewTA}
                    rows={4}
                    placeholder="What did you like or dislike? How was the delivery?"
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    id="review-textarea"
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    id="submit-review-btn"
                    onClick={() => {
                      if (!reviewText.trim() || myRating === 0) return;
                      const newR = {
                        id: Date.now(),
                        user: 'You',
                        avatar: 'Y',
                        rating: myRating,
                        comment: reviewText.trim(),
                        date: 'Just now',
                        verified: true,
                        helpful: 0,
                      };
                      setReviews(prev => [newR, ...prev]);
                      setReviewText('');
                      setMyRating(0);
                    }}
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* QUESTIONS */}
          {activeTab === 'Questions' && (
            <div className={styles.questionsWrap}>
              <h2 className={styles.tabH2}>Customer Questions</h2>
              {[
                { q: 'Does this come with a charger?', a: 'Yes, a 25W fast charger and USB-C cable are included in the box.' },
                { q: 'Is this the international version?', a: 'Yes, this is the international version with full 5G band support in Rwanda.' },
                { q: 'Can I pay with MTN MoMo on delivery?', a: 'Yes, MTN MoMo, Airtel Money, and card payments are all accepted.' },
                { q: 'How long does delivery to Musanze take?', a: 'Delivery to the Northern Province typically takes 3-5 business days at RWF 4,000.' },
              ].map(({ q, a }, i) => (
                <div key={i} className={styles.questionCard}>
                  <div className={styles.qRow}><span className={styles.qLabel}>Q</span><span>{q}</span></div>
                  <div className={styles.aRow}><span className={styles.aLabel}>A</span><span>{a}</span></div>
                </div>
              ))}

              <div className={styles.writeReview} style={{ marginTop: 'var(--space-xl)' }}>
                <h3 className={styles.tabH3}>Ask a Question</h3>
                <textarea className={styles.reviewTA} rows={3} placeholder="Type your question..." id="question-textarea" />
                <button className="btn btn-primary btn-sm" id="ask-question-btn">Submit Question</button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <div className={styles.relatedSection}>
          <div className="container">
            <div className={styles.relatedHeader}>
              <h2 className="section-title" style={{ margin: 0 }}>You Might Also Like</h2>
              <Link href={`/products?category=${product.category}`} className={styles.seeAll}>
                See all <UilAngleRight size={15} />
              </Link>
            </div>
            <div className="products-grid">
              {related.map(p => <ProductCard key={p.id} {...p} reviews={p.reviews ?? 0} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
