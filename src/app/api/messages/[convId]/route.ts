import { NextRequest, NextResponse } from 'next/server';
import { getMessages, getMessagesSince, markConversationRead } from '@/lib/services/chat';
import { getSession } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ convId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { convId } = await params;
    const since = req.nextUrl.searchParams.get('since');

    const messages = since
      ? await getMessagesSince(convId, since)
      : await getMessages(convId);

    return NextResponse.json(messages);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ convId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { convId } = await params;
    const { role } = await req.json() as { role: 'buyer' | 'seller' };
    await markConversationRead(convId, session.uid, role);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
