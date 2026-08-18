'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatRWF } from '@/lib/constants';
import type { ProductSpec } from '@/lib/constants';
import { UilShoppingCart, UilHeart, UilStar, UilShieldCheck } from '@/components/Icons';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  seller: string;
  badge?: string;
  category?: string;
  stock?: number;
  sellerId?: string;
  brand?: string;
  condition?: 'new' | 'refurbished';
  warranty?: string;
  specs?: ProductSpec;
}

// Pick top 3 spec chips  always returns a padded array of exactly 3
// so every card occupies the same height for that zone
function getTopSpecs(specs?: ProductSpec): (string | null)[] {
  if (!specs) return [null, null, null];
  const chips: string[] = [];
  if (specs.ram) chips.push(specs.ram + ' RAM');
  if (specs.storage) chips.push(specs.storage);
  if (specs.camera) chips.push(specs.camera);
  if (chips.length === 0 && specs.processor) chips.push(specs.processor);
  if (chips.length === 0 && specs.screen) chips.push(specs.screen);
  // Pad to exactly 3 entries so every card renders the same spec-chip row height
  while (chips.length < 3) chips.push('');
  return chips.slice(0, 3);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map(star => (
        <UilStar
          key={star}
          size="14"
          className={styles.starIcon}
          style={{ opacity: star <= Math.round(rating) ? 1 : 0.25 }}
        />
      ))}
    </div>
  );
}

export default function ProductCard({
  id, title, price, originalPrice, image, rating, reviews, seller, badge,
  stock = 99, sellerId = '', condition, warranty, specs, brand,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(id);
  const discount = originalPrice ? Math.round((1 - price / originalPrice) * 100) : 0;
  const topSpecs = getTopSpecs(specs);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ id, title, price, image, seller, sellerId, stock });
  };

  const badgeClass =
    badge === 'Flash Sale' ? styles.badgeRed :
    badge === 'Best Seller' ? styles.badgeGold :
    badge === 'Refurbished' ? styles.badgeAmber :
    badge === 'Budget Pick' ? styles.badgeBlue :
    badge === 'Top Rated' || badge === 'Top Pick' ? styles.badgeGreen :
    styles.badgeBlue;

  return (
    <Link href={`/products/${id}`} className={styles.card}>

      {/*  IMAGE  */}
      <div className={styles.imageWrapper}>
        <img src={image} alt={title} className={styles.image} loading="lazy" />
        {badge && <span className={`${styles.badge} ${badgeClass}`}>{badge}</span>}
        {discount > 0 && <span className={styles.discountBadge}>-{discount}%</span>}
        <button
          className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlisted : ''}`}
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(id); }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          id={`wishlist-${id}`}
        >
          <UilHeart size="18" />
        </button>
      </div>

      {/*  CONTENT  */}
      <div className={styles.content}>

        {/* ZONE 1  Variable top: brand/seller + title + spec chips
            This zone grows to fill available space, pushing the footer down */}
        <div className={styles.contentBody}>

          {/* Brand + seller  always one line */}
          <div className={styles.topRow}>
            {brand
              ? <span className={styles.brandTag}>{brand}</span>
              : <span className={styles.brandTagPlaceholder} />
            }
            <p className={styles.sellerName}>{seller}</p>
          </div>

          {/* Title  always exactly 2 lines via line-clamp */}
          <h3 className={styles.title}>{title}</h3>

          {/* Spec chips  always 3 slots, empties are invisible spacers
              so the row is always the same height across all cards */}
          <div className={styles.specChipsRow}>
            {topSpecs.map((s, i) =>
              s ? (
                <span key={i} className="spec-chip">{s}</span>
              ) : (
                <span key={i} className={styles.specChipSpacer} />
              )
            )}
          </div>
        </div>

        {/* ZONE 2  Pinned footer: condition/warranty + stars + price + button
            This zone never shifts  it always sits at the bottom of the card */}
        <div className={styles.contentFooter}>

          {/* Condition + warranty  always takes the same height */}
          <div className={styles.conditionRow}>
            <span className={`condition-badge ${condition === 'refurbished' ? 'condition-refurb' : 'condition-new'}`}>
              {condition === 'refurbished' ? 'Refurbished' : 'New'}
            </span>
            {warranty ? (
              <span className="warranty-badge">
                <UilShieldCheck size="12" />
                {warranty} Warranty
              </span>
            ) : (
              <span className={styles.warrantyPlaceholder} />
            )}
          </div>

          {/* Star rating */}
          <div className={styles.ratingRow}>
            <StarRating rating={rating} />
            <span className={styles.reviewCount}>({reviews})</span>
          </div>

          {/* Price */}
          <div className={styles.priceRow}>
            <span className={styles.price}>{formatRWF(price)}</span>
            {originalPrice
              ? <span className={styles.originalPrice}>{formatRWF(originalPrice)}</span>
              : <span className={styles.originalPricePlaceholder} />
            }
          </div>

          {/* Add to Cart */}
          <button
            className={`btn btn-primary btn-sm btn-full ${styles.addBtn}`}
            onClick={handleAddToCart}
            id={`add-cart-${id}`}
          >
            <UilShoppingCart size="16" />
            Add to Cart
          </button>
        </div>
      </div>

    </Link>
  );
}
