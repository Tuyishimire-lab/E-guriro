/**
 * Chat Service — Firestore with real-time onSnapshot listeners
 *
 * Firestore structure:
 *   conversations/{convId}   — metadata
 *   conversations/{convId}/messages/{msgId}  — messages subcollection
 */
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc,
  query, where, orderBy, onSnapshot, serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ── Types (local to this service) ────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  imageUrl?: string;
  sentAt: Date;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];          // [buyerId, sellerId]
  participantNames: Record<string, string>;
  productId?: string;
  productTitle?: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toMessage(id: string, data: any): ChatMessage {
  return {
    id,
    senderId:   data.senderId,
    senderName: data.senderName,
    content:    data.content,
    imageUrl:   data.imageUrl,
    sentAt:     data.sentAt?.toDate?.() ?? new Date(),
    read:       data.read ?? false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toConversation(id: string, data: any): ChatConversation {
  return {
    id,
    participants:     data.participants ?? [],
    participantNames: data.participantNames ?? {},
    productId:        data.productId,
    productTitle:     data.productTitle,
    lastMessage:      data.lastMessage ?? '',
    lastMessageAt:    data.lastMessageAt?.toDate?.() ?? new Date(),
    unreadCount:      data.unreadCount ?? 0,
  };
}

// ── Get or create conversation between buyer and seller ──────────────────────
export async function getOrCreateConversation(
  buyerId: string,
  buyerName: string,
  sellerId: string,
  sellerName: string,
  productId?: string,
  productTitle?: string
): Promise<string> {
  // Check if conversation already exists
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', buyerId)
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find(d => {
    const p = d.data().participants as string[];
    return p.includes(sellerId) && (!productId || d.data().productId === productId);
  });

  if (existing) return existing.id;

  // Create new conversation
  const convRef = await addDoc(collection(db, 'conversations'), {
    participants:     [buyerId, sellerId],
    participantNames: { [buyerId]: buyerName, [sellerId]: sellerName },
    productId:        productId ?? null,
    productTitle:     productTitle ?? null,
    lastMessage:      '',
    lastMessageAt:    serverTimestamp(),
    unreadCount:      0,
    createdAt:        serverTimestamp(),
  });

  return convRef.id;
}

// ── Get all conversations for a user ─────────────────────────────────────────
export async function getUserConversations(userId: string): Promise<ChatConversation[]> {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => toConversation(d.id, d.data()));
}

// ── Subscribe to messages in a conversation (real-time) ──────────────────────
export function subscribeToMessages(
  convId: string,
  onMessages: (msgs: ChatMessage[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'conversations', convId, 'messages'),
    orderBy('sentAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    onMessages(snap.docs.map(d => toMessage(d.id, d.data())));
  });
}

// ── Subscribe to conversations list (real-time) ───────────────────────────────
export function subscribeToConversations(
  userId: string,
  onUpdate: (convs: ChatConversation[]) => void
): Unsubscribe {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map(d => toConversation(d.id, d.data())));
  });
}

// ── Send a message ────────────────────────────────────────────────────────────
export async function sendMessage(
  convId: string,
  senderId: string,
  senderName: string,
  content: string,
  imageUrl?: string
): Promise<void> {
  const msgRef = collection(db, 'conversations', convId, 'messages');
  await addDoc(msgRef, {
    senderId,
    senderName,
    content,
    imageUrl:  imageUrl ?? null,
    sentAt:    serverTimestamp(),
    read:      false,
  });

  // Update conversation metadata
  await updateDoc(doc(db, 'conversations', convId), {
    lastMessage:   content,
    lastMessageAt: serverTimestamp(),
    unreadCount:   1, // increment properly in production with FieldValue.increment
  });
}

// ── Mark messages as read ─────────────────────────────────────────────────────
export async function markConversationRead(convId: string): Promise<void> {
  await updateDoc(doc(db, 'conversations', convId), { unreadCount: 0 });
}
