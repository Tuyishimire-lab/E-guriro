import { NextRequest, NextResponse } from 'next/server';
import { getUserById, suspendUser, activateUser, updateUserProfile } from '@/lib/services/users';

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    const body = await req.json();
    if (body.action === 'suspend' || body.status === 'suspended') {
      await suspendUser(uid);
    } else if (body.action === 'restore' || body.action === 'activate' || body.status === 'active') {
      await activateUser(uid);
    } else {
      await updateUserProfile(uid, body);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
