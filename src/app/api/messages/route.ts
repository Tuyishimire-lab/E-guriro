import { NextRequest, NextResponse } from 'next/server';
import { getUserConversations, getOrCreateConversation, sendMessage } from '@/lib/services/chat';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = req.nextUrl;
    const userId = session?.uid || searchParams.get('userId') || '';
    if (!userId) {
      return NextResponse.json([]);
    }
    const convs = await getUserConversations(userId);
    return NextResponse.json(convs);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const senderId = session?.uid || body.senderId || 'anonymous';
    const senderName = session?.name || body.senderName || 'Customer';

    // If sending a message to an existing conversation
    if (body.convId && body.content !== undefined) {
      const msg = await sendMessage(body.convId, senderId, senderName, body.content, body.imageUrl);
      return NextResponse.json(msg, { status: 201 });
    }

    // If starting a new conversation
    if (body.sellerId) {
      const convId = await getOrCreateConversation(
        senderId, senderName,
        body.sellerId, body.sellerName || 'Seller',
        body.productId, body.productTitle
      );
      return NextResponse.json({ convId }, { status: 201 });
    }

    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
