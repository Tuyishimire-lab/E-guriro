/**
 * Server-side auth helper — reads the rwandabuy-user cookie set by AuthContext.
 * Used in API route handlers to identify the current user.
 */
import { cookies } from 'next/headers';

export interface SessionUser {
  uid: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  district?: string;
  phone?: string;
  shopName?: string;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const raw = store.get('rwandabuy-user')?.value;
    if (!raw) return null;
    return JSON.parse(decodeURIComponent(raw)) as SessionUser;
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export async function requireRole(role: 'seller' | 'admin'): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== role && user.role !== 'admin') throw new Error('FORBIDDEN');
  return user;
}
