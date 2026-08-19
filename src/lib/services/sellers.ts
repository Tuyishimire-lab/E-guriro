/**
 * Sellers Service — Neon Postgres + Upstash Redis cache
 */
import { sql } from '@/lib/db';
import { cacheGet, cacheSet, cacheInvalidatePrefix, CK } from '@/lib/kv';
import type { SellerProfile } from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSeller(row: any): SellerProfile {
  const ratingVal = parseFloat(row.rating);
  return {
    uid:            row.uid,
    name:           row.name ?? '',
    email:          row.email ?? '',
    role:           'seller',
    shopName:       row.shop_name ?? row.name ?? '',
    district:       row.district ?? 'Gasabo',
    phone:          row.phone,
    rating:         !isNaN(ratingVal) && ratingVal > 0 ? ratingVal : 4.8,
    totalProducts:  parseInt(row.total_products, 10) || 0,
    totalRevenue:   row.total_revenue ?? 0,
    totalOrders:    row.total_orders ?? 0,
    status:         row.status ?? 'pending',
    approvedAt:     row.approved_at?.toISOString?.(),
    rejectedReason: row.rejected_reason,
  };
}

export async function getAllSellers(): Promise<SellerProfile[]> {
  const cached = await cacheGet<SellerProfile[]>(CK.sellersAll);
  if (cached) return cached;
  const rows = await sql`
    SELECT 
      s.uid, s.shop_name, s.district, s.phone, s.status, s.verified, s.approved_at, s.rejected_reason, s.total_revenue, s.total_orders,
      u.name, u.email,
      COALESCE(p_stats.live_products, s.total_products, 0) AS total_products,
      COALESCE(p_stats.avg_rating, s.rating, 4.8) AS rating
    FROM sellers s
    JOIN users u ON u.uid = s.uid
    LEFT JOIN (
      SELECT seller_id, COUNT(*) AS live_products, ROUND(AVG(rating)::numeric, 1) AS avg_rating
      FROM products
      WHERE status = 'active'
      GROUP BY seller_id
    ) p_stats ON (p_stats.seller_id = s.uid OR p_stats.seller_id = s.shop_name)
    ORDER BY s.created_at DESC`;
  const sellers = rows.map(toSeller);
  await cacheSet(CK.sellersAll, sellers, 120);
  return sellers;
}

export async function getVerifiedSellers(): Promise<SellerProfile[]> {
  const cached = await cacheGet<SellerProfile[]>(CK.sellersVerified);
  if (cached) return cached;
  const rows = await sql`
    SELECT 
      s.uid, s.shop_name, s.district, s.phone, s.status, s.verified, s.approved_at, s.rejected_reason, s.total_revenue, s.total_orders,
      u.name, u.email,
      COALESCE(p_stats.live_products, s.total_products, 0) AS total_products,
      COALESCE(p_stats.avg_rating, s.rating, 4.8) AS rating
    FROM sellers s
    JOIN users u ON u.uid = s.uid
    LEFT JOIN (
      SELECT seller_id, COUNT(*) AS live_products, ROUND(AVG(rating)::numeric, 1) AS avg_rating
      FROM products
      WHERE status = 'active'
      GROUP BY seller_id
    ) p_stats ON (p_stats.seller_id = s.uid OR p_stats.seller_id = s.shop_name)
    WHERE s.verified = true AND s.status = 'active'
    ORDER BY total_products DESC, rating DESC LIMIT 10`;
  const sellers = rows.map(toSeller);
  await cacheSet(CK.sellersVerified, sellers, 120);
  return sellers;
}

export async function getSellerById(uid: string): Promise<SellerProfile | null> {
  const rows = await sql`
    SELECT 
      s.uid, s.shop_name, s.district, s.phone, s.status, s.verified, s.approved_at, s.rejected_reason, s.total_revenue, s.total_orders,
      u.name, u.email,
      COALESCE(p_stats.live_products, s.total_products, 0) AS total_products,
      COALESCE(p_stats.avg_rating, s.rating, 4.8) AS rating
    FROM sellers s
    JOIN users u ON u.uid = s.uid
    LEFT JOIN (
      SELECT seller_id, COUNT(*) AS live_products, ROUND(AVG(rating)::numeric, 1) AS avg_rating
      FROM products
      WHERE status = 'active'
      GROUP BY seller_id
    ) p_stats ON (p_stats.seller_id = s.uid OR p_stats.seller_id = s.shop_name)
    WHERE s.uid = ${uid} LIMIT 1`;
  if (!rows.length) return null;
  return toSeller(rows[0]);
}

export async function approveSeller(uid: string): Promise<void> {
  await sql`UPDATE sellers SET status = 'active', verified = true, approved_at = NOW() WHERE uid = ${uid}`;
  await sql`UPDATE users SET status = 'active', updated_at = NOW() WHERE uid = ${uid}`;
  await cacheInvalidatePrefix('sellers:');
}

export async function rejectSeller(uid: string, reason: string): Promise<void> {
  await sql`UPDATE sellers SET status = 'rejected', verified = false, rejected_reason = ${reason} WHERE uid = ${uid}`;
  await cacheInvalidatePrefix('sellers:');
}

export async function suspendSeller(uid: string): Promise<void> {
  await sql`UPDATE sellers SET status = 'suspended' WHERE uid = ${uid}`;
  await sql`UPDATE users SET status = 'suspended', updated_at = NOW() WHERE uid = ${uid}`;
  await cacheInvalidatePrefix('sellers:');
}
