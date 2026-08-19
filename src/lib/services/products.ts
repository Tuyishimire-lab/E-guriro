/**
 * Products Service — Neon Postgres + Upstash Redis cache
 */
import { sql } from '@/lib/db';
import { cacheGet, cacheSet, cacheInvalidatePrefix, cacheDelete, CK } from '@/lib/kv';
import type { Product } from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProduct(row: any): Product {
  return {
    id:            row.id,
    title:         row.title,
    price:         row.price,
    originalPrice: row.original_price,
    image:         row.image ?? '',
    images:        row.images ?? [],
    rating:        parseFloat(row.rating) || 0,
    reviews:       row.reviews ?? row.reviews_count ?? 0,
    seller:        row.seller_name ?? '',
    sellerId:      row.seller_id ?? '',
    category:      row.category ?? '',
    brand:         row.brand ?? '',
    badge:         row.badge,
    stock:         row.stock ?? 0,
    condition:     row.condition ?? 'new',
    warranty:      row.warranty,
    specs:         row.specs,
    description:   row.description,
    createdAt:     row.created_at?.toISOString?.() ?? '',
    status:        row.status ?? 'active',
  };
}

export async function getProducts(filters?: {
  category?: string;
  sellerId?: string;
  search?: string;
  limit?: number;
}): Promise<Product[]> {
  // Only cache unfiltered / category-only queries
  if (!filters?.search && !filters?.sellerId) {
    const cacheKey = filters?.category
      ? CK.productsCat(filters.category)
      : CK.products;
    const cached = await cacheGet<Product[]>(cacheKey);
    if (cached) return cached;
  }

  let rows;
  if (filters?.category && !filters.search && !filters.sellerId) {
    rows = await sql`
      SELECT * FROM products
      WHERE status = 'active' AND category = ${filters.category}
      ORDER BY created_at DESC
      LIMIT ${filters.limit ?? 100}`;
  } else if (filters?.sellerId) {
    rows = await sql`
      SELECT * FROM products
      WHERE seller_id = ${filters.sellerId}
      ORDER BY created_at DESC`;
  } else if (filters?.search) {
    const term = `%${filters.search.toLowerCase()}%`;
    rows = await sql`
      SELECT * FROM products
      WHERE status = 'active'
        AND (LOWER(title) LIKE ${term} OR LOWER(brand) LIKE ${term} OR LOWER(category) LIKE ${term})
      ORDER BY created_at DESC
      LIMIT ${filters.limit ?? 50}`;
  } else {
    rows = await sql`
      SELECT * FROM products
      WHERE status = 'active'
      ORDER BY created_at DESC
      LIMIT ${filters?.limit ?? 100}`;
  }

  const products = rows.map(toProduct);

  // Cache unfiltered + category queries
  if (!filters?.search && !filters?.sellerId) {
    const cacheKey = filters?.category ? CK.productsCat(filters.category) : CK.products;
    await cacheSet(cacheKey, products, 300);
  }

  return products;
}

export async function getProductById(id: string): Promise<Product | null> {
  const cached = await cacheGet<Product>(CK.product(id));
  if (cached) return cached;

  const rows = await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`;
  if (!rows.length) return null;
  const product = toProduct(rows[0]);
  await cacheSet(CK.product(id), product, 600);
  return product;
}

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt'>,
  imageUrls?: string[]
): Promise<string> {
  const urls = imageUrls ?? (data.images?.length ? data.images : [data.image]);
  const primaryImage = urls[0] ?? '';

  const rows = await sql`
    INSERT INTO products
      (title, price, original_price, image, images, seller_name, seller_id,
       category, brand, badge, stock, condition, warranty, specs, description, status)
    VALUES
      (${data.title}, ${data.price}, ${data.originalPrice ?? null}, ${primaryImage},
       ${urls as unknown as string}, ${data.seller}, ${data.sellerId ?? null},
       ${data.category ?? null}, ${data.brand ?? null}, ${data.badge ?? null},
       ${data.stock ?? 0}, ${data.condition ?? 'new'}, ${data.warranty ?? null},
       ${JSON.stringify(data.specs ?? {})}, ${data.description ?? null}, 'pending')
    RETURNING id`;

  await cacheInvalidatePrefix('products:');
  return rows[0].id as string;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await sql`
    UPDATE products SET
      title          = COALESCE(${data.title ?? null}, title),
      price          = COALESCE(${data.price ?? null}, price),
      original_price = COALESCE(${data.originalPrice ?? null}, original_price),
      stock          = COALESCE(${data.stock ?? null}, stock),
      status         = COALESCE(${data.status ?? null}, status),
      description    = COALESCE(${data.description ?? null}, description),
      updated_at     = NOW()
    WHERE id = ${id}`;

  await cacheInvalidatePrefix('products:');
  await cacheDelete(CK.product(id));
}

export async function deleteProduct(id: string): Promise<void> {
  await sql`DELETE FROM products WHERE id = ${id}`;
  await cacheInvalidatePrefix('products:');
  await cacheDelete(CK.product(id));
}
