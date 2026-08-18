/**
 * Users Service — Firestore
 * Used by admin panel and buyer profile management.
 */
import {
  collection, doc, getDoc, getDocs, updateDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User } from '@/lib/types';

const COL = 'users';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toUser(id: string, data: any): User {
  return {
    uid:       id,
    name:      data.name ?? '',
    email:     data.email ?? '',
    role:      data.role ?? 'buyer',
    district:  data.district,
    phone:     data.phone,
    shopName:  data.shopName,
    avatarUrl: data.avatarUrl,
    createdAt: data.createdAt?.toDate?.()?.toISOString(),
    status:    data.status ?? 'active',
  };
}

export async function getUserById(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, COL, uid));
  if (!snap.exists()) return null;
  return toUser(snap.id, snap.data());
}

export async function getAllBuyers(): Promise<User[]> {
  const q = query(
    collection(db, COL),
    where('role', '==', 'buyer'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => toUser(d.id, d.data()));
}

export async function updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
  await updateDoc(doc(db, COL, uid), { ...data, updatedAt: serverTimestamp() });
}

export async function suspendUser(uid: string): Promise<void> {
  await updateDoc(doc(db, COL, uid), { status: 'suspended', updatedAt: serverTimestamp() });
}

export async function activateUser(uid: string): Promise<void> {
  await updateDoc(doc(db, COL, uid), { status: 'active', updatedAt: serverTimestamp() });
}
