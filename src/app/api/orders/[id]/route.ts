import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/services/orders';
import { getSession } from '@/lib/auth';
import type { OrderStatus } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'seller' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const { status } = await req.json() as { status: OrderStatus };
    await updateOrderStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
