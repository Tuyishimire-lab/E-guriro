/**
 * Products Service
 *
 * Currently returns mock data from constants.ts
 * Firebase integration: replace each function body with Firestore calls.
 * Components that call these functions change ZERO lines.
 */

import { MOCK_PRODUCTS } from '@/lib/constants';
import type { Product } from '@/lib/types';

/** Fetch all products, optionally filtered */
export async function getProducts(filters?: {
  category?: string;
  sellerId?: string;
  search?: string;
  limit?: number;
}): Promise<Product[]> {
  let results = MOCK_PRODUCTS as Product[];

  if (filters?.category) {
    results = results.filter(p => p.category === filters.category);
  }
  if (filters?.sellerId) {
    results = results.filter(p => p.sellerId === filters.sellerId);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  }
  if (filters?.limit) {
    results = results.slice(0, filters.limit);
  }

  return results;
}

/** Fetch a single product by ID */
export async function getProductById(id: string): Promise<Product | null> {
  return (MOCK_PRODUCTS as Product[]).find(p => p.id === id) ?? null;
}

/** Create a new product (placeholder — will write to Firestore) */
export async function createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
  // TODO: doc(db, 'products', ...) write
  const id = `prod_${Date.now()}`;
  console.log('[DEV] createProduct:', { id, ...data });
  return id;
}

/** Update an existing product */
export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  // TODO: updateDoc(doc(db, 'products', id), data)
  console.log('[DEV] updateProduct:', id, data);
}

/** Delete a product */
export async function deleteProduct(id: string): Promise<void> {
  // TODO: deleteDoc(doc(db, 'products', id))
  console.log('[DEV] deleteProduct:', id);
}
