/**
 * POST /api/users/register
 * Creates user profile in Postgres after Firebase Auth registration.
 */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, name, email, role, phone, shopName, district } = body;

    if (!uid || !name || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert user
    await sql`
      INSERT INTO users (uid, name, email, role, phone, shop_name, district, status)
      VALUES (${uid}, ${name}, ${email}, ${role}, ${phone ?? null}, ${shopName ?? null},
              ${district ?? null}, ${role === 'seller' ? 'pending' : 'active'})
      ON CONFLICT (uid) DO NOTHING`;

    // Insert seller profile if applicable
    if (role === 'seller' && shopName) {
      await sql`
        INSERT INTO sellers (uid, shop_name, district, phone, status)
        VALUES (${uid}, ${shopName}, ${district ?? null}, ${phone ?? null}, 'pending')
        ON CONFLICT (uid) DO NOTHING`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Register API]', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
