import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/services/products';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q        = searchParams.get('q') ?? '';
    const category = searchParams.get('category') ?? '';
    const sort     = searchParams.get('sort') ?? 'newest';
    const minPrice = Number(searchParams.get('min') ?? 0);
    const maxPrice = Number(searchParams.get('max') ?? 999999999);
    const limit    = Number(searchParams.get('limit') ?? 100);

    let products = await getProducts({
      search:   q || undefined,
      category: category || undefined,
      limit,
    });

    // Apply price filter
    products = products.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Apply sort
    if (sort === 'price-asc')  products.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);
    if (sort === 'rating')     products.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

    return NextResponse.json(products);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'seller' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const data = await req.json();
    const id = await createProduct({ ...data, seller: session.name, sellerId: session.uid });
    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
