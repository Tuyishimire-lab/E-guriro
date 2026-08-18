import { NextRequest, NextResponse } from 'next/server';
import { getAllSellers, getVerifiedSellers } from '@/lib/services/sellers';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const verified = req.nextUrl.searchParams.get('verified') === 'true';
    const session  = await getSession();

    if (verified || !session || session.role !== 'admin') {
      const sellers = await getVerifiedSellers();
      return NextResponse.json(sellers);
    }

    const sellers = await getAllSellers();
    return NextResponse.json(sellers);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
