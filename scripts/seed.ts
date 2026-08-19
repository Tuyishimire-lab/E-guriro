/**
 * Direct seed script — runs locally, connects straight to Neon Postgres.
 * Usage: npx tsx scripts/seed.ts
 */
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local from project root
config({ path: resolve(process.cwd(), '.env.local') });

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const SEED_SELLERS = [
  { uid: 'seller1', name: 'TechHub Kigali',   email: 'tech@techhubkigali.rw',  shopName: 'TechHub Kigali',   district: 'Gasabo',     phone: '0788001001', rating: 4.8 },
  { uid: 'seller2', name: 'PhoneZone Rwanda', email: 'info@phonezonerw.rw',    shopName: 'PhoneZone Rwanda', district: 'Kicukiro',   phone: '0788001002', rating: 4.7 },
  { uid: 'seller3', name: 'iStore Kigali',    email: 'hello@istorekigali.rw',  shopName: 'iStore Kigali',    district: 'Nyarugenge', phone: '0788001003', rating: 4.9 },
  { uid: 'seller4', name: 'GadgetMart RW',    email: 'sales@gadgetmartrw.rw',  shopName: 'GadgetMart RW',    district: 'Gasabo',     phone: '0788001004', rating: 4.6 },
];

const SEED_PRODUCTS = [
  { title: 'Samsung Galaxy S24 5G',         price: 850000,  originalPrice: 980000,  image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', category: 'smartphones', brand: 'Samsung',  sellerId: 'seller1', sellerName: 'TechHub Kigali',   stock: 18, badge: 'Best Seller', condition: 'new',         warranty: '1 Year',   specs: { ram: '8GB', storage: '256GB', screen: '6.2"',  battery: '4000mAh', camera: '50MP'   }, description: 'Flagship Samsung with AI features, 200MP camera system, titanium design.' },
  { title: 'Samsung Galaxy A54 5G',         price: 350000,  originalPrice: 420000,  image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400', category: 'smartphones', brand: 'Samsung',  sellerId: 'seller2', sellerName: 'PhoneZone Rwanda', stock: 42, badge: 'Flash Sale',  condition: 'new',         warranty: '1 Year',   specs: { ram: '8GB', storage: '128GB', screen: '6.4"',  battery: '5000mAh', camera: '50MP'   }, description: 'Mid-range powerhouse with 5G, 50MP camera, and 5000mAh battery.' },
  { title: 'iPhone 15 Pro 256GB',           price: 1450000, originalPrice: 1600000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', category: 'smartphones', brand: 'Apple',    sellerId: 'seller3', sellerName: 'iStore Kigali',    stock: 8,  badge: 'Top Rated',  condition: 'new',         warranty: '1 Year',   specs: { ram: '8GB', storage: '256GB', screen: '6.1"',  battery: '3274mAh', camera: '48MP'   }, description: 'Apple A17 Pro chip, titanium body, USB 3 connectivity, ProRes video.' },
  { title: 'Tecno Spark 20 Pro+',           price: 155000,  originalPrice: 185000,  image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400', category: 'smartphones', brand: 'Tecno',    sellerId: 'seller4', sellerName: 'GadgetMart RW',    stock: 65, badge: 'Budget Pick', condition: 'new',         warranty: '1 Year',   specs: { ram: '8GB', storage: '256GB', screen: '6.78"', battery: '5000mAh', camera: '108MP'  }, description: 'Best budget smartphone in Rwanda with 108MP camera and fast charging.' },
  { title: 'Infinix Hot 40 Pro',            price: 120000,  originalPrice: 145000,  image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', category: 'smartphones', brand: 'Infinix',  sellerId: 'seller2', sellerName: 'PhoneZone Rwanda', stock: 80, badge: 'New',         condition: 'new',         warranty: '1 Year',   specs: { ram: '8GB', storage: '128GB', screen: '6.78"', battery: '5000mAh', camera: '108MP'  }, description: 'Gaming phone with 90Hz display, 108MP camera, and 5000mAh battery.' },
  { title: 'iPhone 13 - Refurbished',       price: 620000,  originalPrice: 900000,  image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400', category: 'smartphones', brand: 'Apple',    sellerId: 'seller3', sellerName: 'iStore Kigali',    stock: 14, badge: 'Refurbished', condition: 'refurbished', warranty: '6 Months', specs: { ram: '4GB', storage: '128GB', screen: '6.1"',  battery: '3227mAh', camera: '12MP'   }, description: 'Grade A refurbished iPhone 13. Tested, cleaned, 6-month warranty.' },
  { title: 'HP Pavilion Laptop 15 i5',      price: 780000,  originalPrice: 890000,  image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', category: 'laptops',    brand: 'HP',       sellerId: 'seller1', sellerName: 'TechHub Kigali',   stock: 11, badge: 'Top Pick',   condition: 'new',         warranty: '1 Year',   specs: { ram: '16GB', storage: '512GB', screen: '15.6"', processor: 'Intel i5-1235U'     }, description: '12th Gen Intel Core i5, 16GB RAM, 512GB SSD. Great for work & study.' },
  { title: 'Lenovo IdeaPad 3 Ryzen 5',      price: 640000,  originalPrice: 720000,  image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400', category: 'laptops',    brand: 'Lenovo',   sellerId: 'seller4', sellerName: 'GadgetMart RW',    stock: 9,  badge: 'Flash Sale',  condition: 'new',         warranty: '1 Year',   specs: { ram: '8GB', storage: '256GB', screen: '15.6"', processor: 'AMD Ryzen 5 5500U'  }, description: 'AMD Ryzen 5, 8GB RAM, 256GB SSD. Reliable everyday laptop.' },
  { title: 'Samsung 43 4K Smart TV',        price: 420000,  originalPrice: 490000,  image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', category: 'tvs',        brand: 'Samsung',  sellerId: 'seller1', sellerName: 'TechHub Kigali',   stock: 15, badge: 'Flash Sale',  condition: 'new',         warranty: '2 Years',  specs: { screen: '43"', resolution: '4K UHD', smart: 'Tizen OS' }, description: '4K Crystal UHD, built-in apps, voice control, HDR support.' },
  { title: 'Sony WH-1000XM5 Headphones',   price: 280000,  originalPrice: 340000,  image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', category: 'audio',      brand: 'Sony',     sellerId: 'seller2', sellerName: 'PhoneZone Rwanda', stock: 22, badge: 'Best Seller', condition: 'new',         warranty: '1 Year',   specs: { battery: '30hrs', anc: 'Industry-leading ANC', connectivity: 'Bluetooth 5.2' }, description: 'Industry-best noise cancellation, 30hr battery, multipoint connect.' },
  { title: 'Apple iPad 10th Gen 64GB WiFi', price: 680000,  originalPrice: 760000,  image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', category: 'tablets',    brand: 'Apple',    sellerId: 'seller3', sellerName: 'iStore Kigali',    stock: 7,  badge: 'New',         condition: 'new',         warranty: '1 Year',   specs: { ram: '4GB', storage: '64GB', screen: '10.9"', processor: 'Apple A14 Bionic'  }, description: 'All-new design, USB-C, landscape camera. Perfect for work & school.' },
  { title: 'Xiaomi Redmi Note 13 Pro',      price: 245000,  originalPrice: 290000,  image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400', category: 'smartphones', brand: 'Xiaomi',   sellerId: 'seller4', sellerName: 'GadgetMart RW',    stock: 33, badge: 'Top Rated',  condition: 'new',         warranty: '1 Year',   specs: { ram: '8GB', storage: '256GB', screen: '6.67"', battery: '5100mAh', camera: '200MP'  }, description: '200MP Hyper OIS camera, Snapdragon 7s Gen 2, 67W fast charging.' },
];

async function seed() {
  console.log('🌱 Seeding Neon Postgres...\n');

  // ── Sellers ──────────────────────────────────────────────────────────────────
  let sellersSeeded = 0;
  for (const s of SEED_SELLERS) {
    try {
      await sql`
        INSERT INTO users (uid, name, email, role, district, phone, shop_name, status)
        VALUES (${s.uid}, ${s.name}, ${s.email}, 'seller', ${s.district}, ${s.phone}, ${s.shopName}, 'active')
        ON CONFLICT (uid) DO NOTHING`;

      await sql`
        INSERT INTO sellers (uid, shop_name, district, phone, rating, status, verified)
        VALUES (${s.uid}, ${s.shopName}, ${s.district}, ${s.phone}, ${s.rating}, 'active', true)
        ON CONFLICT (uid) DO NOTHING`;

      console.log(`  ✅ Seller: ${s.name}`);
      sellersSeeded++;
    } catch (e: unknown) {
      console.error(`  ❌ Seller ${s.name}:`, (e as Error).message?.split('\n')[0]);
    }
  }

  // ── Products ─────────────────────────────────────────────────────────────────
  let productsSeeded = 0;
  for (const p of SEED_PRODUCTS) {
    try {
      // Use the same column list as createProduct() in the service
      await sql`
        INSERT INTO products
          (title, price, original_price, image, images,
           seller_name, seller_id, category, brand, badge,
           stock, condition, warranty, specs, description, status)
        VALUES
          (${p.title}, ${p.price}, ${p.originalPrice}, ${p.image}, ${[p.image] as unknown as string},
           ${p.sellerName}, ${p.sellerId}, ${p.category}, ${p.brand ?? null}, ${p.badge ?? null},
           ${p.stock}, ${p.condition ?? 'new'}, ${p.warranty ?? null},
           ${JSON.stringify(p.specs ?? {})}, ${p.description ?? null}, 'active')`;

      console.log(`  ✅ Product: ${p.title}`);
      productsSeeded++;
    } catch (e: unknown) {
      console.error(`  ❌ Product ${p.title}:`, (e as Error).message?.split('\n')[0]);
    }
  }

  console.log(`\n🎉 Done! ${sellersSeeded} sellers, ${productsSeeded} products seeded.`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
