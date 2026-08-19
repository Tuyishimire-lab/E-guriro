import { NextRequest, NextResponse } from 'next/server';
import { getOrdersByBuyer, getOrdersBySeller, getAllOrders, createOrder } from '@/lib/services/orders';
import { getSession } from '@/lib/auth';
import { sendOrderConfirmation, sendNewOrderAlert } from '@/lib/email';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = req.nextUrl.searchParams.get('role') ?? session.role;

    let orders;
    if (role === 'admin' && session.role === 'admin') {
      orders = await getAllOrders();
    } else if (role === 'seller') {
      orders = await getOrdersBySeller(session.uid);
    } else {
      orders = await getOrdersByBuyer(session.uid);
    }

    return NextResponse.json(orders);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const data = await req.json();
    const buyerId = session?.uid || data.buyerId || `guest-${Date.now().toString(36)}`;
    const buyerName = session?.name || data.buyerName || data.fullName || 'Shopper';
    const buyerEmail = session?.email || data.email || '';

    const orderId = await createOrder({
      ...data,
      buyerId,
      buyerName,
    });

    // Send confirmation email to buyer (non-blocking)
    if (buyerEmail) {
      sendOrderConfirmation({
        buyerEmail,
        buyerName,
        orderId,
        items:      data.items ?? [],
        total:      data.total ?? 0,
      }).catch(console.error);
    }

    // Notify each seller (non-blocking)
    const sellerIds: string[] = [...new Set<string>((data.items ?? []).map((i: { sellerId: string }) => i.sellerId).filter((x: unknown): x is string => typeof x === 'string' && Boolean(x)))];
    for (const sellerId of sellerIds) {
      const sellerRows = await sql`SELECT u.email, u.name FROM users u WHERE u.uid = ${sellerId} LIMIT 1`;
      if (sellerRows[0]) {
        sendNewOrderAlert({
          sellerEmail: sellerRows[0].email as string,
          sellerName:  sellerRows[0].name as string,
          orderId,
          buyerName,
          items:       (data.items ?? []).filter((i: { sellerId: string }) => i.sellerId === sellerId),
        }).catch(console.error);
      }
    }

    return NextResponse.json({ orderId, success: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
