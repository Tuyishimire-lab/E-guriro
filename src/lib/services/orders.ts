/**
 * Orders Service
 * Firebase integration: replace bodies with Firestore collection queries.
 */
import type { Order, OrderStatus } from '@/lib/types';

const MOCK_ORDERS: Order[] = [
  {
    id: 'EG-001',
    buyerId: 'buyer1',
    buyerName: 'Amina Uwase',
    items: [{ productId: 'p1', title: 'Samsung Galaxy A54 5G', price: 350000, qty: 1, image: 'https://placehold.co/80x80/1a1a2e/00A550?text=S', seller: 'TechHub', sellerId: 'seller1' }],
    total: 351500,
    shipping: 1500,
    address: { id: 'a1', label: 'Home', district: 'Kicukiro', street: 'KG 15 Ave', isDefault: true },
    district: 'Kicukiro',
    phone: '0788123456',
    paymentMethod: 'mtn_momo',
    status: 'delivered',
    createdAt: '2026-08-15T10:00:00Z',
  },
];

export async function getOrdersByBuyer(buyerId: string): Promise<Order[]> {
  return MOCK_ORDERS.filter(o => o.buyerId === buyerId);
}

export async function getOrdersBySeller(sellerId: string): Promise<Order[]> {
  return MOCK_ORDERS.filter(o => o.items.some(i => i.sellerId === sellerId));
}

export async function getOrderById(id: string): Promise<Order | null> {
  return MOCK_ORDERS.find(o => o.id === id) ?? null;
}

export async function createOrder(data: Omit<Order, 'id' | 'createdAt'>): Promise<string> {
  const id = `EG-${Date.now().toString().slice(-6)}`;
  console.log('[DEV] createOrder:', { id, ...data });
  return id;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  console.log('[DEV] updateOrderStatus:', id, status);
}

export async function cancelOrder(id: string, reason?: string): Promise<void> {
  console.log('[DEV] cancelOrder:', id, reason);
}
