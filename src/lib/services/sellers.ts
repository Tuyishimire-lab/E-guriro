/**
 * Sellers Service — Neon Postgres + Upstash Redis cache
 */
import { sql } from '@/lib/db';
import { cacheGet, cacheSet, cacheInvalidatePrefix, CK } from '@/lib/kv';
import type { SellerProfile } from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSeller(row: any): SellerProfile {
  return {
    uid:            row.uid,
    name:           row.name ?? '',
    email:          row.email ?? '',
    role:           'seller',
    shopName:       row.shop_name ?? '',
    district:       row.district,
    phone:          row.phone,
    rating:         parseFloat(row.rating) || 0,
    totalProducts:  row.total_products ?? 0,
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
    SELECT s.*, u.name, u.email FROM sellers s
    JOIN users u ON u.uid = s.uid
    ORDER BY s.created_at DESC`;
  const sellers = rows.map(toSeller);
  await cacheSet(CK.sellersAll, sellers, 300);
  return sellers;
}

export async function getVerifiedSellers(): Promise<SellerProfile[]> {
  const cached = await cacheGet<SellerProfile[]>(CK.sellersVerified);
  if (cached) return cached;
  const rows = await sql`
    SELECT s.*, u.name, u.email FROM sellers s
    JOIN users u ON u.uid = s.uid
    WHERE s.verified = true AND s.status = 'active'
    ORDER BY s.rating DESC LIMIT 10`;
  const sellers = rows.map(toSeller);
  await cacheSet(CK.sellersVerified, sellers, 600);
  return sellers;
}

export async function getSellerById(uid: string): Promise<SellerProfile | null> {
  const rows = await sql`
    SELECT s.*, u.name, u.email FROM sellers s
    JOIN users u ON u.uid = s.uid
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
