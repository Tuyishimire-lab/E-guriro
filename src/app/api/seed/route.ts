/**
 * GET /api/seed
 * One-time database seeder — populates Postgres with mock sellers + products.
 * Protected by CRON_SECRET. Delete or disable after first run.
 */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const SEED_SELLERS = [
  { uid: 'seller1', name: 'TechHub Kigali',    email: 'tech@techhubkigali.rw',   shopName: 'TechHub Kigali',    district: 'Gasabo',     phone: '0788001001', rating: 4.8 },
  { uid: 'seller2', name: 'PhoneZone Rwanda',  email: 'info@phonezonerw.rw',     shopName: 'PhoneZone Rwanda',  district: 'Kicukiro',   phone: '0788001002', rating: 4.7 },
  { uid: 'seller3', name: 'iStore Kigali',     email: 'hello@istorekigali.rw',   shopName: 'iStore Kigali',     district: 'Nyarugenge', phone: '0788001003', rating: 4.9 },
  { uid: 'seller4', name: 'GadgetMart RW',     email: 'sales@gadgetmartrw.rw',   shopName: 'GadgetMart RW',     district: 'Gasabo',     phone: '0788001004', rating: 4.6 },
];

const SEED_PRODUCTS = [
  { id: 'p1',  title: 'Samsung Galaxy S24 5G',          price: 850000,  originalPrice: 980000,  image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400', category: 'smartphones', brand: 'Samsung',  rating: 4.8, reviews: 214, sellerId: 'seller1', sellerName: 'TechHub Kigali',   district: 'Gasabo',     stock: 18, badge: 'Best Seller', condition: 'new',         warranty: '1 Year',   specs: { ram: '8GB', storage: '256GB', screen: '6.2"',  battery: '4000mAh', camera: '50MP'  } },
  { id: 'p2',  title: 'Samsung Galaxy A54 5G',          price: 350000,  originalPrice: 420000,  image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400', category: 'smartphones', brand: 'Samsung',  rating: 4.6, reviews: 312, sellerId: 'seller2', sellerName: 'PhoneZone Rwanda', district: 'Kicukiro',   stock: 42, badge: 'Flash Sale',  condition: 'new',         warranty: '1 Year',   specs: { ram: '8GB', storage: '128GB', screen: '6.4"',  battery: '5000mAh', camera: '50MP'  } },
  { id: 'p3',  title: 'iPhone 15 Pro 256GB',            price: 1450000, originalPrice: 1600000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400', category: 'smartphones', brand: 'Apple',    rating: 4.9, reviews: 178, sellerId: 'seller3', sellerName: 'iStore Kigali',    district: 'Nyarugenge', stock: 8,  badge: 'Top Rated',  condition: 'new',         warranty: '1 Year',   specs: { ram: '8GB', storage: '256GB', screen: '6.1"',  battery: '3274mAh', camera: '48MP'  } },
  { id: 'p4',  title: 'Tecno Spark 20 Pro+',            price: 155000,  originalPrice: 185000,  image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400', category: 'smartphones', brand: 'Tecno',    rating: 4.3, reviews: 524, sellerId: 'seller4', sellerName: 'GadgetMart RW',    district: 'Gasabo',     stock: 65, badge: 'Budget Pick', condition: 'new',         warranty: '1 Year',   specs: { ram: '8GB', storage: '256GB', screen: '6.78"', battery: '5000mAh', camera: '108MP' } },
  { id: 'p5',  title: 'Infinix Hot 40 Pro',             price: 120000,  originalPrice: 145000,  image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', category: 'smartphones', brand: 'Infinix',  rating: 4.2, reviews: 389, sellerId: 'seller2', sellerName: 'PhoneZone Rwanda', district: 'Kicukiro',   stock: 80, badge: 'New',         condition: 'new',         warranty: '1 Year',   specs: { ram: '8GB', storage: '128GB', screen: '6.78"', battery: '5000mAh', camera: '108MP' } },
  { id: 'p6',  title: 'iPhone 13 - Refurbished',        price: 620000,  originalPrice: 900000,  image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400', category: 'smartphones', brand: 'Apple',    rating: 4.5, reviews: 143, sellerId: 'seller3', sellerName: 'iStore Kigali',    district: 'Nyarugenge', stock: 14, badge: 'Refurbished', condition: 'refurbished', warranty: '6 Months', specs: { ram: '4GB', storage: '128GB', screen: '6.1"',  battery: '3227mAh', camera: '12MP'  } },
  { id: 'p7',  title: 'HP Pavilion Laptop 15 - i5',     price: 780000,  originalPrice: 890000,  image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', category: 'laptops',    brand: 'HP',       rating: 4.5, reviews: 97,  sellerId: 'seller1', sellerName: 'TechHub Kigali',   district: 'Gasabo',     stock: 11, badge: 'Top Pick',   condition: 'new',         warranty: '1 Year',   specs: { ram: '16GB', storage: '512GB', screen: '15.6"', processor: 'Intel i5-1235U' } },
  { id: 'p8',  title: 'Lenovo IdeaPad 3 - Ryzen 5',    price: 640000,  originalPrice: 720000,  image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400', category: 'laptops',    brand: 'Lenovo',   rating: 4.4, reviews: 73,  sellerId: 'seller4', sellerName: 'GadgetMart RW',    district: 'Gasabo',     stock: 9,  badge: 'Flash Sale',  condition: 'new',         warranty: '1 Year',   specs: { ram: '8GB', storage: '256GB', screen: '15.6"', processor: 'AMD Ryzen 5 5500U' } },
  { id: 'p9',  title: 'Samsung 43" 4K Smart TV',        price: 420000,  originalPrice: 490000,  image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', category: 'tvs',        brand: 'Samsung',  rating: 4.6, reviews: 156, sellerId: 'seller1', sellerName: 'TechHub Kigali',   district: 'Gasabo',     stock: 15, badge: 'Flash Sale',  condition: 'new',         warranty: '2 Years',  specs: { screen: '43"', storage: '4K UHD' } },
  { id: 'p10', title: 'Sony WH-1000XM5 Headphones',    price: 280000,  originalPrice: 340000,  image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', category: 'audio',      brand: 'Sony',     rating: 4.9, reviews: 231, sellerId: 'seller2', sellerName: 'PhoneZone Rwanda', district: 'Kicukiro',   stock: 22, badge: 'Best Seller', condition: 'new',         warranty: '1 Year',   specs: { battery: '30hrs' } },
  { id: 'p11', title: 'Apple iPad 10th Gen 64GB WiFi',  price: 680000,  originalPrice: 760000,  image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400', category: 'tablets',    brand: 'Apple',    rating: 4.7, reviews: 88,  sellerId: 'seller3', sellerName: 'iStore Kigali',    district: 'Nyarugenge', stock: 7,  badge: 'New',         condition: 'new',         warranty: '1 Year',   specs: { ram: '4GB', storage: '64GB', screen: '10.9"', processor: 'Apple A14 Bionic' } },
  { id: 'p12', title: 'Xiaomi Redmi Note 13 Pro',       price: 245000,  originalPrice: 290000,  image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400', category: 'smartphones', brand: 'Xiaomi',   rating: 4.4, reviews: 267, sellerId: 'seller4', sellerName: 'GadgetMart RW',    district: 'Gasabo',     stock: 33, badge: 'Top Rated',  condition: 'new',         warranty: '1 Year',   specs: { ram: '8GB', storage: '256GB', screen: '6.67"', battery: '5100mAh', camera: '200MP' } },
];

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Seed sellers → users + sellers tables
  let sellersSeeded = 0;
  for (const s of SEED_SELLERS) {
    await sql`
      INSERT INTO users (uid, name, email, role, district, phone, shop_name, status)
      VALUES (${s.uid}, ${s.name}, ${s.email}, 'seller', ${s.district}, ${s.phone}, ${s.shopName}, 'active')
      ON CONFLICT (uid) DO NOTHING`;

    await sql`
      INSERT INTO sellers (uid, shop_name, district, phone, rating, status, verified)
      VALUES (${s.uid}, ${s.shopName}, ${s.district}, ${s.phone}, ${s.rating}, 'active', true)
      ON CONFLICT (uid) DO NOTHING`;

    sellersSeeded++;
  }

  // Seed products
  let productsSeeded = 0;
  for (const p of SEED_PRODUCTS) {
    await sql`
      INSERT INTO products (id, title, price, original_price, image, category, brand, rating,
                            reviews, seller_id, seller_name, district, stock, badge, condition,
                            warranty, specs, status)
      VALUES (${p.id}, ${p.title}, ${p.price}, ${p.originalPrice}, ${p.image}, ${p.category},
              ${p.brand ?? null}, ${p.rating}, ${p.reviews}, ${p.sellerId}, ${p.sellerName},
              ${p.district}, ${p.stock}, ${p.badge ?? null}, ${p.condition ?? 'new'},
              ${p.warranty ?? null}, ${JSON.stringify(p.specs ?? {})}, 'active')
      ON CONFLICT (id) DO NOTHING`;
    productsSeeded++;
  }

  return NextResponse.json({
    success: true,
    sellersSeeded,
    productsSeeded,
    message: 'Database seeded successfully. You can now disable this route.',
  });
}
