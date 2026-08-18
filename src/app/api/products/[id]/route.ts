import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/lib/services/products';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(product);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
