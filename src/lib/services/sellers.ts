/**
 * Sellers Service — Firestore
 * Used by admin panel, home page top sellers, and seller store pages.
 */
import {
  collection, doc, getDoc, getDocs, updateDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SellerProfile } from '@/lib/types';

const COL = 'sellers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toSeller(id: string, data: any): SellerProfile {
  return {
    uid:            id,
    name:           data.name ?? '',
    email:          data.email ?? '',
    role:           'seller',
    shopName:       data.shopName ?? '',
    district:       data.district,
    phone:          data.phone,
    avatarUrl:      data.avatarUrl,
    rating:         data.rating ?? 0,
    totalProducts:  data.products ?? 0,
    totalRevenue:   data.totalRevenue ?? 0,
    totalOrders:    data.totalOrders ?? 0,
    status:         data.status ?? 'pending',
    createdAt:      data.createdAt?.toDate?.()?.toISOString(),
    approvedAt:     data.approvedAt?.toDate?.()?.toISOString(),
    rejectedReason: data.rejectedReason,
  };
}

export async function getAllSellers(): Promise<SellerProfile[]> {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => toSeller(d.id, d.data()));
}

export async function getVerifiedSellers(): Promise<SellerProfile[]> {
  const q = query(
    collection(db, COL),
    where('verified', '==', true),
    orderBy('rating', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => toSeller(d.id, d.data()));
}

export async function getSellerById(uid: string): Promise<SellerProfile | null> {
  const snap = await getDoc(doc(db, COL, uid));
  if (!snap.exists()) return null;
  return toSeller(snap.id, snap.data());
}

export async function approveSeller(uid: string): Promise<void> {
  await updateDoc(doc(db, COL, uid), {
    status:     'active',
    verified:   true,
    approvedAt: serverTimestamp(),
    updatedAt:  serverTimestamp(),
  });
  // Mirror status to users collection
  await updateDoc(doc(db, 'users', uid), {
    status:    'active',
    updatedAt: serverTimestamp(),
  });
}

export async function rejectSeller(uid: string, reason: string): Promise<void> {
  await updateDoc(doc(db, COL, uid), {
    status:         'rejected',
    verified:       false,
    rejectedReason: reason,
    updatedAt:      serverTimestamp(),
  });
}

export async function suspendSeller(uid: string): Promise<void> {
  await updateDoc(doc(db, COL, uid), { status: 'suspended', updatedAt: serverTimestamp() });
}
