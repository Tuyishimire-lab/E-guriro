/**
 * Orders Service — Neon Postgres
 */
import { sql } from '@/lib/db';
import type { Order, OrderStatus } from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function attachItems(orders: any[]): Promise<Order[]> {
  if (!orders.length) return [];
  const ids = orders.map(o => o.id);
  const items = await sql`SELECT * FROM order_items WHERE order_id = ANY(${ids as unknown as string[]})`;

  return orders.map(o => ({
    id:            o.id,
    buyerId:       o.buyer_id,
    buyerName:     o.buyer_name,
    total:         o.total,
    shipping:      o.shipping,
    address:       o.address,
    district:      o.district,
    phone:         o.phone,
    paymentMethod: o.payment_method,
    status:        o.status,
    createdAt:     o.created_at?.toISOString?.() ?? '',
    updatedAt:     o.updated_at?.toISOString?.(),
    items: items
      .filter(i => i.order_id === o.id)
      .map(i => ({
        productId:  i.product_id,
        title:      i.title,
        price:      i.price,
        qty:        i.qty,
        image:      i.image ?? '',
        seller:     i.seller_name ?? '',
        sellerId:   i.seller_id ?? '',
      })),
  }));
}

export async function getOrdersByBuyer(buyerId: string): Promise<Order[]> {
  const rows = await sql`
    SELECT * FROM orders WHERE buyer_id = ${buyerId} ORDER BY created_at DESC`;
  return attachItems(rows);
}

export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  const rows = await sql`
    SELECT * FROM orders WHERE ${sellerId} = ANY(seller_ids) ORDER BY created_at DESC`;
  return attachItems(rows);
}

export async function getAllOrders(): Promise<Order[]> {
  const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC`;
  return attachItems(rows);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const rows = await sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`;
  if (!rows.length) return null;
  const [order] = await attachItems(rows);
  return order ?? null;
}

export async function createOrder(data: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  const id = `EG-${Date.now().toString(36).toUpperCase()}`;
  const sellerIds = [...new Set(data.items.map(i => i.sellerId).filter(Boolean))];

  await sql`
    INSERT INTO orders (id, buyer_id, buyer_name, total, shipping, address, district, phone, payment_method, status, seller_ids)
    VALUES (${id}, ${data.buyerId}, ${data.buyerName}, ${data.total}, ${data.shipping},
            ${JSON.stringify(data.address)}, ${data.district}, ${data.phone},
            ${data.paymentMethod}, 'pending', ${sellerIds as unknown as string[]})`;

  for (const item of data.items) {
    await sql`
      INSERT INTO order_items (order_id, product_id, title, price, qty, image, seller_name, seller_id)
      VALUES (${id}, ${item.productId}, ${item.title}, ${item.price}, ${item.qty},
              ${item.image ?? null}, ${item.seller ?? null}, ${item.sellerId ?? null})`;
  }

  return id;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await sql`UPDATE orders SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
}

export async function cancelOrder(id: string, reason?: string): Promise<void> {
  await sql`
    UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = ${id}`;
  if (reason) {
    // Store cancellation reason in a note (extend table if needed)
    console.log(`[Order ${id}] Cancelled: ${reason}`);
  }
}
