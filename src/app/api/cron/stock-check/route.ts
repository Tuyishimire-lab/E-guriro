// ── Cron: Low stock check ──────────────────────────────────────────────────────
// Schedule: 9am every day  →  vercel.json "0 9 * * *"
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const lowStock = await sql`
    SELECT p.id, p.title, p.stock, p.seller_id, u.name AS seller_name, u.email AS seller_email
    FROM products p
    JOIN users u ON u.uid = p.seller_id
    WHERE p.stock < 3 AND p.status = 'active'
    ORDER BY p.stock ASC`;

  // In production: send email via Resend / SendGrid
  // For now: log to Vercel logs
  if (lowStock.length > 0) {
    console.log(`[Stock Alert] ${lowStock.length} products low on stock:`,
      lowStock.map(p => `${p.title} (${p.stock} left) - ${p.seller_name}`));
  }

  return NextResponse.json({ lowStockCount: lowStock.length, products: lowStock });
}
