import { NextRequest, NextResponse } from 'next/server';
import { getAllBuyers } from '@/lib/services/users';
import { getSession } from '@/lib/auth';

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const buyers = await getAllBuyers();
    return NextResponse.json(buyers);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
