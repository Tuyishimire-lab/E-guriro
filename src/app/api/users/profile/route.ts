import { NextRequest, NextResponse } from 'next/server';
import { updateUserProfile } from '@/lib/services/users';
import { getSession } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const data = await req.json();
    await updateUserProfile(session.uid, data);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
