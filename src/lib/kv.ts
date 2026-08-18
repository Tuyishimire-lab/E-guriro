/**
 * Upstash Redis Cache Wrapper
 * Uses @upstash/redis (native SDK, replaces deprecated @vercel/kv).
 */
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url:   process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const DEFAULT_TTL = 300; // 5 minutes

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    return await redis.get<T>(key);
  } catch {
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = DEFAULT_TTL): Promise<void> {
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch {
    // cache write failure is never fatal
  }
}

export async function cacheDelete(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) await redis.del(...keys as [string, ...string[]]);
  } catch {
    // ignore
  }
}

export async function cacheInvalidatePrefix(prefix: string): Promise<void> {
  try {
    const keys = await redis.keys(`${prefix}*`);
    if (keys.length > 0) await redis.del(...keys as [string, ...string[]]);
  } catch {
    // ignore
  }
}

// ── Typed cache key constants ─────────────────────────────────────────────────
export const CK = {
  products:        'products:all',
  productsCat:     (cat: string) => `products:cat:${cat}`,
  productsSeller:  (id: string)  => `products:seller:${id}`,
  product:         (id: string)  => `product:${id}`,
  sellersVerified: 'sellers:verified',
  sellersAll:      'sellers:all',
} as const;
