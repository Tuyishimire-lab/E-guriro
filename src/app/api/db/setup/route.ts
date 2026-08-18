/**
 * POST /api/db/setup
 * Creates all Postgres tables. Run ONCE after creating the Neon database.
 * DELETE this file after running in production.
 * Call: GET http://localhost:3001/api/db/setup
 */
import { NextResponse } from 'next/server';
import { sqlDirect } from '@/lib/db';

export async function GET() {
  try {
    // Users
    await sqlDirect`
      CREATE TABLE IF NOT EXISTS users (
        uid          TEXT PRIMARY KEY,
        name         TEXT NOT NULL,
        email        TEXT UNIQUE NOT NULL,
        role         TEXT NOT NULL DEFAULT 'buyer',
        district     TEXT,
        phone        TEXT,
        shop_name    TEXT,
        avatar_url   TEXT,
        status       TEXT DEFAULT 'active',
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )`;

    // Sellers
    await sqlDirect`
      CREATE TABLE IF NOT EXISTS sellers (
        uid             TEXT PRIMARY KEY REFERENCES users(uid) ON DELETE CASCADE,
        shop_name       TEXT NOT NULL,
        district        TEXT,
        phone           TEXT,
        rating          DECIMAL(3,2) DEFAULT 0,
        total_products  INT DEFAULT 0,
        total_revenue   BIGINT DEFAULT 0,
        total_orders    INT DEFAULT 0,
        verified        BOOLEAN DEFAULT false,
        specialty       TEXT,
        status          TEXT DEFAULT 'pending',
        approved_at     TIMESTAMPTZ,
        rejected_reason TEXT,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      )`;

    // Products
    await sqlDirect`
      CREATE TABLE IF NOT EXISTS products (
        id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        title          TEXT NOT NULL,
        price          INT NOT NULL,
        original_price INT,
        image          TEXT,
        images         TEXT[],
        rating         DECIMAL(3,2) DEFAULT 0,
        reviews_count  INT DEFAULT 0,
        seller_name    TEXT NOT NULL,
        seller_id      TEXT REFERENCES users(uid) ON DELETE SET NULL,
        category       TEXT,
        brand          TEXT,
        badge          TEXT,
        stock          INT DEFAULT 0,
        condition      TEXT DEFAULT 'new',
        warranty       TEXT,
        specs          JSONB,
        description    TEXT,
        status         TEXT DEFAULT 'pending',
        created_at     TIMESTAMPTZ DEFAULT NOW(),
        updated_at     TIMESTAMPTZ DEFAULT NOW()
      )`;

    // Orders
    await sqlDirect`
      CREATE TABLE IF NOT EXISTS orders (
        id             TEXT PRIMARY KEY,
        buyer_id       TEXT REFERENCES users(uid) ON DELETE SET NULL,
        buyer_name     TEXT NOT NULL,
        total          INT NOT NULL,
        shipping       INT DEFAULT 0,
        address        JSONB NOT NULL,
        district       TEXT,
        phone          TEXT,
        payment_method TEXT NOT NULL,
        status         TEXT DEFAULT 'pending',
        seller_ids     TEXT[],
        created_at     TIMESTAMPTZ DEFAULT NOW(),
        updated_at     TIMESTAMPTZ DEFAULT NOW()
      )`;

    // Order Items
    await sqlDirect`
      CREATE TABLE IF NOT EXISTS order_items (
        id          SERIAL PRIMARY KEY,
        order_id    TEXT REFERENCES orders(id) ON DELETE CASCADE,
        product_id  TEXT,
        title       TEXT NOT NULL,
        price       INT NOT NULL,
        qty         INT NOT NULL,
        image       TEXT,
        seller_name TEXT,
        seller_id   TEXT
      )`;

    // Conversations
    await sqlDirect`
      CREATE TABLE IF NOT EXISTS conversations (
        id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        buyer_id        TEXT REFERENCES users(uid) ON DELETE SET NULL,
        seller_id       TEXT REFERENCES users(uid) ON DELETE SET NULL,
        product_id      TEXT,
        product_title   TEXT,
        last_message    TEXT DEFAULT '',
        last_message_at TIMESTAMPTZ DEFAULT NOW(),
        buyer_unread    INT DEFAULT 0,
        seller_unread   INT DEFAULT 0,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      )`;

    // Messages
    await sqlDirect`
      CREATE TABLE IF NOT EXISTS messages (
        id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
        sender_id       TEXT REFERENCES users(uid) ON DELETE SET NULL,
        sender_name     TEXT,
        content         TEXT NOT NULL,
        image_url       TEXT,
        read            BOOLEAN DEFAULT false,
        sent_at         TIMESTAMPTZ DEFAULT NOW()
      )`;

    // Reviews
    await sqlDirect`
      CREATE TABLE IF NOT EXISTS reviews (
        id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        product_id  TEXT REFERENCES products(id) ON DELETE CASCADE,
        user_id     TEXT REFERENCES users(uid) ON DELETE SET NULL,
        user_name   TEXT NOT NULL,
        rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment     TEXT,
        verified    BOOLEAN DEFAULT false,
        helpful     INT DEFAULT 0,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )`;

    // Promotions
    await sqlDirect`
      CREATE TABLE IF NOT EXISTS promotions (
        id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        type        TEXT NOT NULL,
        title       TEXT NOT NULL,
        description TEXT,
        discount    INT,
        code        TEXT UNIQUE,
        ends_at     TIMESTAMPTZ,
        active      BOOLEAN DEFAULT true,
        product_ids TEXT[],
        image_url   TEXT,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )`;

    // Indexes
    await sqlDirect`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`;
    await sqlDirect`CREATE INDEX IF NOT EXISTS idx_products_seller   ON products(seller_id)`;
    await sqlDirect`CREATE INDEX IF NOT EXISTS idx_products_status   ON products(status)`;
    await sqlDirect`CREATE INDEX IF NOT EXISTS idx_orders_buyer      ON orders(buyer_id)`;
    await sqlDirect`CREATE INDEX IF NOT EXISTS idx_messages_conv     ON messages(conversation_id, sent_at)`;
    await sqlDirect`CREATE INDEX IF NOT EXISTS idx_reviews_product   ON reviews(product_id)`;

    return NextResponse.json({ success: true, message: 'Schema created. DELETE this route now.' });
  } catch (error) {
    console.error('[DB Setup]', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
