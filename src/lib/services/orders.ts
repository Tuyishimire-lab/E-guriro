/**
 * Orders Service — Firestore
 */
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, OrderStatus } from '@/lib/types';

const COL = 'orders';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toOrder(id: string, data: any): Order {
  return {
    id,
    buyerId:       data.buyerId,
    buyerName:     data.buyerName,
    items:         data.items ?? [],
    total:         data.total,
    shipping:      data.shipping,
    address:       data.address,
    district:      data.district,
    phone:         data.phone,
    paymentMethod: data.paymentMethod,
    status:        data.status,
    createdAt:     data.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    updatedAt:     data.updatedAt?.toDate?.()?.toISOString(),
  };
}

export async function getOrdersByBuyer(buyerId: string): Promise<Order[]> {
  const q = query(
    collection(db, COL),
    where('buyerId', '==', buyerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => toOrder(d.id, d.data()));
}

export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  // Orders store sellerId per item; query top-level field for seller's orders
  const q = query(
    collection(db, COL),
    where('sellerIds', 'array-contains', sellerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => toOrder(d.id, d.data()));
}

export async function getAllOrders(): Promise<Order[]> {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => toOrder(d.id, d.data()));
}

export async function getOrderById(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return toOrder(snap.id, snap.data());
}

export async function createOrder(data: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  // Collect unique sellerIds for array-contains queries
  const sellerIds = [...new Set(data.items.map(i => i.sellerId).filter(Boolean))];
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    sellerIds,
    status:    'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function cancelOrder(id: string, reason?: string): Promise<void> {
  await updateDoc(doc(db, COL, id), {
    status:          'cancelled',
    cancelledReason: reason ?? '',
    updatedAt:       serverTimestamp(),
  });
}
