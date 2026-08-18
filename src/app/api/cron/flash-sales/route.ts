// ── Cron: Expire flash sales ──────────────────────────────────────────────────
// Schedule: every hour  →  vercel.json "0 * * * *"
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await sql`
    UPDATE promotions SET active = false
    WHERE active = true AND ends_at IS NOT NULL AND ends_at < NOW()
    RETURNING id, title`;
  return NextResponse.json({ expired: result.length, promotions: result });
}
