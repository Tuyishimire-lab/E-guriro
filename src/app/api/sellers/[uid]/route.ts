import { NextRequest, NextResponse } from 'next/server';
import { getSellerById, approveSeller, rejectSeller, suspendSeller } from '@/lib/services/sellers';
import { getProducts } from '@/lib/services/products';
import { getSession } from '@/lib/auth';
import { sendSellerApproved, sendSellerRejected } from '@/lib/email';
import { getUserById } from '@/lib/services/users';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const seller = await getSellerById(uid);
    if (!seller) return NextResponse.json(null, { status: 404 });

    const allProducts = await getProducts({ limit: 100 });
    const products = allProducts.filter(p => p.sellerId === uid);

    return NextResponse.json({ seller, products });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { uid } = await params;
    const { action, reason } = await req.json();

    const user = await getUserById(uid);

    if (action === 'approve') {
      await approveSeller(uid);
      if (user) {
        sendSellerApproved({
          sellerEmail: user.email,
          sellerName:  user.name,
          shopName:    user.shopName ?? user.name,
        }).catch(console.error);
      }
    } else if (action === 'reject') {
      await rejectSeller(uid, reason ?? 'Did not meet requirements');
      if (user) {
        sendSellerRejected({
          sellerEmail: user.email,
          sellerName:  user.name,
          reason:      reason ?? 'Did not meet requirements',
        }).catch(console.error);
      }
    } else if (action === 'suspend') {
      await suspendSeller(uid);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
