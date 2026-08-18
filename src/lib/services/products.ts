/**
 * Products Service — Firestore
 * All components that call these functions require ZERO changes.
 */
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit as fsLimit, serverTimestamp,
  type QueryConstraint,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { Product } from '@/lib/types';

const COL = 'products';

// ── Helper: convert Firestore doc → Product ──────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProduct(id: string, data: any): Product {
  return {
    id,
    title:         data.title,
    price:         data.price,
    originalPrice: data.originalPrice,
    image:         data.image ?? '',
    images:        data.images ?? [],
    rating:        data.rating ?? 0,
    reviews:       data.reviews ?? 0,
    seller:        data.seller ?? '',
    sellerId:      data.sellerId ?? '',
    category:      data.category ?? '',
    brand:         data.brand ?? '',
    badge:         data.badge,
    stock:         data.stock ?? 0,
    condition:     data.condition ?? 'new',
    warranty:      data.warranty,
    specs:         data.specs,
    description:   data.description,
    createdAt:     data.createdAt?.toDate?.()?.toISOString() ?? '',
    status:        data.status ?? 'active',
  };
}

// ── getProducts ───────────────────────────────────────────────────────────────
export async function getProducts(filters?: {
  category?: string;
  sellerId?: string;
  search?: string;
  limit?: number;
}): Promise<Product[]> {
  const constraints: QueryConstraint[] = [
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
  ];

  if (filters?.category) {
    constraints.push(where('category', '==', filters.category));
  }
  if (filters?.sellerId) {
    constraints.push(where('sellerId', '==', filters.sellerId));
  }
  if (filters?.limit) {
    constraints.push(fsLimit(filters.limit));
  }

  const q = query(collection(db, COL), ...constraints);
  const snap = await getDocs(q);
  let products = snap.docs.map(d => toProduct(d.id, d.data()));

  // Client-side search (Firestore doesn't support full-text natively)
  if (filters?.search) {
    const term = filters.search.toLowerCase();
    products = products.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.brand?.toLowerCase().includes(term) ||
      p.category?.toLowerCase().includes(term)
    );
  }

  return products;
}

// ── getProductById ────────────────────────────────────────────────────────────
export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return toProduct(snap.id, snap.data());
}

// ── createProduct ─────────────────────────────────────────────────────────────
export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt'>,
  imageFiles?: File[]
): Promise<string> {
  let imageUrl = data.image;
  const imageUrls: string[] = [];

  // Upload images to Firebase Storage if provided
  if (imageFiles && imageFiles.length > 0) {
    for (const file of imageFiles) {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snap.ref);
      imageUrls.push(url);
    }
    imageUrl = imageUrls[0];
  }

  const docRef = await addDoc(collection(db, COL), {
    ...data,
    image:     imageUrl,
    images:    imageUrls.length > 0 ? imageUrls : (data.images ?? []),
    rating:    0,
    reviews:   0,
    status:    'active',
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

// ── updateProduct ─────────────────────────────────────────────────────────────
export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

// ── deleteProduct ─────────────────────────────────────────────────────────────
export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}
