import { NextRequest, NextResponse } from 'next/server';
import { getUserConversations, getOrCreateConversation, sendMessage } from '@/lib/services/chat';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const convs = await getUserConversations(session.uid);
    return NextResponse.json(convs);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // If sending a message to an existing conversation
    if (body.convId && body.content !== undefined) {
      const msg = await sendMessage(body.convId, session.uid, session.name, body.content, body.imageUrl);
      return NextResponse.json(msg, { status: 201 });
    }

    // If starting a new conversation
    if (body.sellerId && body.sellerName) {
      const convId = await getOrCreateConversation(
        session.uid, session.name,
        body.sellerId, body.sellerName,
        body.productId, body.productTitle
      );
      return NextResponse.json({ convId });
    }

    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
