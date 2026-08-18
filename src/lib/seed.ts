/**
 * Firestore Seed Script
 *
 * Seeds the Firestore database with the mock products and sellers data.
 * Run ONCE from the browser console or as a Next.js API route.
 *
 * Usage (browser console on localhost):
 *   import { seedFirestore } from '@/lib/seed';
 *   await seedFirestore();
 *
 * This file is safe to delete after seeding.
 */
import { collection, doc, setDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MOCK_PRODUCTS, MOCK_SELLERS } from '@/lib/constants';

export async function seedFirestore(): Promise<void> {
  // Check if already seeded
  const check = await getDocs(query(collection(db, 'products'), limit(1)));
  if (!check.empty) {
    console.log('[Seed] Firestore already has products — skipping seed.');
    return;
  }

  console.log('[Seed] Starting Firestore seed...');

  // Seed products
  for (const product of MOCK_PRODUCTS) {
    await setDoc(doc(db, 'products', product.id), {
      title:         product.title,
      price:         product.price,
      originalPrice: product.originalPrice,
      image:         product.image,
      images:        [product.image],
      rating:        product.rating,
      reviews:       product.reviews,
      seller:        product.seller,
      sellerId:      product.sellerId,
      category:      product.category,
      brand:         product.brand ?? '',
      badge:         product.badge ?? null,
      stock:         product.stock,
      condition:     product.condition ?? 'new',
      warranty:      product.warranty ?? '1 Year',
      specs:         product.specs ?? {},
      description:   `${product.title} — premium quality electronics from ${product.seller}. Available across all 30 districts of Rwanda with fast delivery.`,
      status:        'active',
      createdAt:     new Date(),
    });
    console.log(`[Seed] Product: ${product.title}`);
  }

  // Seed sellers
  for (const seller of MOCK_SELLERS) {
    await setDoc(doc(db, 'sellers', seller.id), {
      name:         seller.name,
      email:        `${seller.id}@eguriro.rw`,
      shopName:     seller.name,
      district:     seller.district,
      phone:        '+250 788 000 000',
      rating:       seller.rating,
      products:     seller.products,
      verified:     seller.verified,
      specialty:    (seller as { specialty?: string }).specialty ?? 'Electronics',
      status:       'active',
      totalRevenue: 0,
      totalOrders:  0,
      createdAt:    new Date(),
    });
    console.log(`[Seed] Seller: ${seller.name}`);
  }

  console.log('[Seed] Done! Firestore seeded successfully.');
}
