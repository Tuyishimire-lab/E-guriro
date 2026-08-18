// ── Cron: Daily sales report ───────────────────────────────────────────────────
// Schedule: 7am every day  →  vercel.json "0 7 * * *"
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  const [totals] = await sql`
    SELECT
      COUNT(*)            AS total_orders,
      SUM(total)          AS gross_revenue,
      SUM(shipping)       AS shipping_revenue,
      COUNT(DISTINCT buyer_id) AS unique_buyers
    FROM orders
    WHERE created_at::date = ${dateStr}::date
      AND status != 'cancelled'`;

  const topProducts = await sql`
    SELECT oi.title, SUM(oi.qty) AS units_sold, SUM(oi.price * oi.qty) AS revenue
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.created_at::date = ${dateStr}::date AND o.status != 'cancelled'
    GROUP BY oi.title ORDER BY units_sold DESC LIMIT 5`;

  const report = {
    date:          dateStr,
    totalOrders:   Number(totals?.total_orders  ?? 0),
    grossRevenue:  Number(totals?.gross_revenue ?? 0),
    uniqueBuyers:  Number(totals?.unique_buyers ?? 0),
    topProducts,
  };

  console.log('[Daily Report]', JSON.stringify(report, null, 2));
  return NextResponse.json(report);
}
