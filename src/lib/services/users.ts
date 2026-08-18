/**
 * Users Service — Neon Postgres
 */
import { sql } from '@/lib/db';
import type { User } from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toUser(row: any): User {
  return {
    uid:       row.uid,
    name:      row.name ?? '',
    email:     row.email ?? '',
    role:      row.role ?? 'buyer',
    district:  row.district,
    phone:     row.phone,
    shopName:  row.shop_name,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at?.toISOString?.(),
    status:    row.status ?? 'active',
  };
}

export async function getUserById(uid: string): Promise<User | null> {
  const rows = await sql`SELECT * FROM users WHERE uid = ${uid} LIMIT 1`;
  if (!rows.length) return null;
  return toUser(rows[0]);
}

export async function upsertUser(data: {
  uid: string; name: string; email: string; role: 'buyer' | 'seller' | 'admin';
  district?: string; phone?: string; shopName?: string; avatarUrl?: string;
  status?: string;
}): Promise<void> {
  await sql`
    INSERT INTO users (uid, name, email, role, district, phone, shop_name, avatar_url, status)
    VALUES (${data.uid}, ${data.name}, ${data.email}, ${data.role},
            ${data.district ?? null}, ${data.phone ?? null}, ${data.shopName ?? null},
            ${data.avatarUrl ?? null}, ${data.status ?? 'active'})
    ON CONFLICT (uid) DO UPDATE SET
      name       = EXCLUDED.name,
      email      = EXCLUDED.email,
      district   = COALESCE(EXCLUDED.district, users.district),
      phone      = COALESCE(EXCLUDED.phone, users.phone),
      shop_name  = COALESCE(EXCLUDED.shop_name, users.shop_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
      updated_at = NOW()`;
}

export async function getAllBuyers(): Promise<User[]> {
  const rows = await sql`
    SELECT * FROM users WHERE role = 'buyer' ORDER BY created_at DESC`;
  return rows.map(toUser);
}

export async function updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
  await sql`
    UPDATE users SET
      name       = COALESCE(${data.name ?? null}, name),
      district   = COALESCE(${data.district ?? null}, district),
      phone      = COALESCE(${data.phone ?? null}, phone),
      avatar_url = COALESCE(${data.avatarUrl ?? null}, avatar_url),
      updated_at = NOW()
    WHERE uid = ${uid}`;
}

export async function suspendUser(uid: string): Promise<void> {
  await sql`UPDATE users SET status = 'suspended', updated_at = NOW() WHERE uid = ${uid}`;
}

export async function activateUser(uid: string): Promise<void> {
  await sql`UPDATE users SET status = 'active', updated_at = NOW() WHERE uid = ${uid}`;
}
