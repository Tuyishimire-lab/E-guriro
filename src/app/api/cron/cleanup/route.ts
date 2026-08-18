// ── Cron: Conversation cleanup ─────────────────────────────────────────────────
// Schedule: Sunday 3am  →  vercel.json "0 3 * * 0"
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Archive conversations with no messages in the last 90 days
  const result = await sql`
    DELETE FROM conversations
    WHERE id NOT IN (
      SELECT DISTINCT conversation_id FROM messages
      WHERE sent_at > NOW() - INTERVAL '90 days'
    )
    AND created_at < NOW() - INTERVAL '90 days'
    RETURNING id`;

  return NextResponse.json({ archivedConversations: result.length });
}
