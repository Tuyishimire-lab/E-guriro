'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/lib/types';
import { UilHeart, UilShoppingCart, UilTrashAlt, UilRefresh } from '@/components/Icons';

export default function WishlistPage() {
  const { items, clear } = useWishlist();
  const { addToCart } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/products?limit=100');
        if (res.ok) setAllProducts(await res.json());
      } catch (e) {
        console.error('Failed to load wishlist products', e);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const wishlisted = allProducts.filter(p => items.includes(p.id));

  if (loading) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>
        <UilRefresh size="36" className="spin-icon" style={{ marginBottom: 16, opacity: 0.7 }} />
        <p>Loading your saved wishlist items...</p>
      </div>
    );
  }

  if (wishlisted.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>
          <UilHeart size="64" style={{ color: 'var(--border-color)' }} />
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>
          Your wishlist is empty
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>
          Save products you love and come back to them anytime.
        </p>
        <Link href="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px 60px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>My Wishlist</h1>
          <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.88rem' }}>
            {wishlisted.length} saved item{wishlisted.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={clear}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <UilTrashAlt size="15" /> Clear All
        </button>
      </div>

      {/* Move all to cart */}
      <div style={{ marginBottom: 24 }}>
        <button
          className="btn btn-primary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={() => {
            wishlisted.forEach(p => addToCart({ id: p.id, title: p.title, price: p.price, image: p.image, seller: p.seller, sellerId: p.sellerId ?? '', stock: p.stock ?? 99 }));
          }}
        >
          <UilShoppingCart size="16" /> Move All to Cart
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-lg)' }}>
        {wishlisted.map(p => (
          <ProductCard key={p.id} {...p} reviews={p.reviews ?? 0} />
        ))}
      </div>
    </div>
  );
}
