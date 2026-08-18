/**
 * GET /api/users/[uid]
 * Returns a user profile from Postgres by Firebase UID.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/lib/services/users';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const user = await getUserById(uid);
    if (!user) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
