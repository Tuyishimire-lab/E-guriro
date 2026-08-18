/**
 * Chat Service — Neon Postgres with 3-second polling
 * No Firestore dependency. Messages stored in Postgres.
 * Real-time feel achieved via client-side polling every 3s.
 */
import { sql } from '@/lib/db';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  imageUrl?: string;
  sentAt: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  buyerId: string;
  sellerId: string;
  participantNames: Record<string, string>;
  productId?: string;
  productTitle?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toMessage(row: any): ChatMessage {
  return {
    id:             row.id,
    conversationId: row.conversation_id,
    senderId:       row.sender_id,
    senderName:     row.sender_name,
    content:        row.content,
    imageUrl:       row.image_url ?? undefined,
    sentAt:         row.sent_at?.toISOString?.() ?? new Date().toISOString(),
    read:           row.read ?? false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toConversation(row: any, currentUserId: string): ChatConversation {
  const names: Record<string, string> = {
    [row.buyer_id]:  row.buyer_name  ?? 'Buyer',
    [row.seller_id]: row.seller_name ?? 'Seller',
  };
  const unread = currentUserId === row.buyer_id ? row.buyer_unread : row.seller_unread;
  return {
    id:               row.id,
    buyerId:          row.buyer_id,
    sellerId:         row.seller_id,
    participantNames: names,
    productId:        row.product_id ?? undefined,
    productTitle:     row.product_title ?? undefined,
    lastMessage:      row.last_message ?? '',
    lastMessageAt:    row.last_message_at?.toISOString?.() ?? new Date().toISOString(),
    unreadCount:      unread ?? 0,
  };
}

export async function getOrCreateConversation(
  buyerId: string,
  buyerName: string,
  sellerId: string,
  sellerName: string,
  productId?: string,
  productTitle?: string
): Promise<string> {
  // Check for existing conversation
  const existing = await sql`
    SELECT id FROM conversations
    WHERE buyer_id = ${buyerId} AND seller_id = ${sellerId}
      AND (${productId ?? null}::text IS NULL OR product_id = ${productId ?? null})
    LIMIT 1`;

  if (existing.length) return existing[0].id as string;

  const rows = await sql`
    INSERT INTO conversations (buyer_id, seller_id, product_id, product_title, last_message)
    VALUES (${buyerId}, ${sellerId}, ${productId ?? null}, ${productTitle ?? null}, '')
    RETURNING id`;

  // Store names in users table (they should already exist)
  void buyerName; void sellerName; // names fetched via JOIN on read

  return rows[0].id as string;
}

export async function getUserConversations(userId: string): Promise<ChatConversation[]> {
  const rows = await sql`
    SELECT c.*,
      ub.name AS buyer_name,
      us.name AS seller_name
    FROM conversations c
    LEFT JOIN users ub ON ub.uid = c.buyer_id
    LEFT JOIN users us ON us.uid = c.seller_id
    WHERE c.buyer_id = ${userId} OR c.seller_id = ${userId}
    ORDER BY c.last_message_at DESC`;

  return rows.map(r => toConversation(r, userId));
}

/** Poll for messages — called every 3s by the client */
export async function getMessages(convId: string): Promise<ChatMessage[]> {
  const rows = await sql`
    SELECT * FROM messages
    WHERE conversation_id = ${convId}
    ORDER BY sent_at ASC`;
  return rows.map(toMessage);
}

/** Poll for new messages since a timestamp — more efficient */
export async function getMessagesSince(convId: string, since: string): Promise<ChatMessage[]> {
  const rows = await sql`
    SELECT * FROM messages
    WHERE conversation_id = ${convId} AND sent_at > ${since}::timestamptz
    ORDER BY sent_at ASC`;
  return rows.map(toMessage);
}

export async function sendMessage(
  convId: string,
  senderId: string,
  senderName: string,
  content: string,
  imageUrl?: string
): Promise<ChatMessage> {
  const rows = await sql`
    INSERT INTO messages (conversation_id, sender_id, sender_name, content, image_url)
    VALUES (${convId}, ${senderId}, ${senderName}, ${content}, ${imageUrl ?? null})
    RETURNING *`;

  await sql`
    UPDATE conversations
    SET last_message = ${content}, last_message_at = NOW(),
        buyer_unread  = CASE WHEN seller_id = ${senderId} THEN buyer_unread + 1  ELSE buyer_unread  END,
        seller_unread = CASE WHEN buyer_id  = ${senderId} THEN seller_unread + 1 ELSE seller_unread END
    WHERE id = ${convId}`;

  return toMessage(rows[0]);
}

export async function markConversationRead(convId: string, userId: string, role: 'buyer' | 'seller'): Promise<void> {
  if (role === 'buyer') {
    await sql`UPDATE conversations SET buyer_unread = 0 WHERE id = ${convId}`;
  } else {
    await sql`UPDATE conversations SET seller_unread = 0 WHERE id = ${convId}`;
  }
  await sql`UPDATE messages SET read = true WHERE conversation_id = ${convId} AND sender_id != ${userId}`;
}
