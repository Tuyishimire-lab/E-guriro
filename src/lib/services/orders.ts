/**
 * Orders Service — Neon Postgres
 */
import { sql } from '@/lib/db';
import type { Order, OrderStatus } from '@/lib/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePickup(o: any) {
  const addr = typeof o.address === 'string' ? JSON.parse(o.address || '{}') : (o.address || {});
  const deliveryType = o.delivery_type || addr.deliveryType || (addr.pickupStationId ? 'pickup_station' : 'home_delivery');
  const pickupStationId = o.pickup_station_id || addr.pickupStationId;
  const pickupStationName = o.pickup_station_name || addr.pickupStationName;
  const pickupStationAddress = o.pickup_station_address || addr.pickupStationAddress;
  const pickupCode = o.pickup_code || addr.pickupCode;
  return { deliveryType, pickupStationId, pickupStationName, pickupStationAddress, pickupCode };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function attachItems(orders: any[]): Promise<Order[]> {
  if (!orders.length) return [];
  const ids = orders.map(o => o.id);
  const items = await sql`SELECT * FROM order_items WHERE order_id = ANY(${ids as unknown as string[]})`;

  return orders.map(o => {
    const pickup = parsePickup(o);
    return {
      id:                   o.id,
      buyerId:              o.buyer_id,
      buyerName:            o.buyer_name,
      total:                o.total,
      shipping:             o.shipping,
      address:              o.address,
      district:             o.district,
      phone:                o.phone,
      paymentMethod:        o.payment_method,
      status:               o.status,
      createdAt:            o.created_at?.toISOString?.() ?? '',
      updatedAt:            o.updated_at?.toISOString?.(),
      deliveryType:         pickup.deliveryType,
      pickupStationId:      pickup.pickupStationId,
      pickupStationName:    pickup.pickupStationName,
      pickupStationAddress: pickup.pickupStationAddress,
      pickupCode:           pickup.pickupCode,
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
    };
  });
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

  const pickupCode = data.deliveryType === 'pickup_station'
    ? (data.pickupCode || `RB-${Math.floor(100000 + Math.random() * 900000)}`)
    : undefined;

  const addressPayload = {
    ...data.address,
    deliveryType: data.deliveryType || 'home_delivery',
    pickupStationId: data.pickupStationId,
    pickupStationName: data.pickupStationName,
    pickupStationAddress: data.pickupStationAddress,
    pickupCode,
  };

  await sql`
    INSERT INTO orders (id, buyer_id, buyer_name, total, shipping, address, district, phone, payment_method, status, seller_ids)
    VALUES (${id}, ${data.buyerId}, ${data.buyerName}, ${data.total}, ${data.shipping},
            ${JSON.stringify(addressPayload)}, ${data.district}, ${data.phone},
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
    console.log(`[Order ${id}] Cancelled: ${reason}`);
  }
}
