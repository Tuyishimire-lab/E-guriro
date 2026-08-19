// Rwanda districts organized by province
export const RWANDA_PROVINCES = [
  'Kigali City',
  'Northern Province',
  'Southern Province',
  'Eastern Province',
  'Western Province',
];

export const RWANDA_DISTRICTS: Record<string, string[]> = {
  'Kigali City': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
  'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rutsiro', 'Rusizi'],
};

export const ALL_DISTRICTS = Object.values(RWANDA_DISTRICTS).flat();

// Delivery fees in RWF (nationwide delivery across all 30 Rwandan districts)
export const DELIVERY_FEES: Record<string, number> = {
  'Kigali City': 1500,
  'Northern Province': 4000,
  'Southern Province': 4000,
  'Eastern Province': 4000,
  'Western Province': 4000,
};
export const SHIPPING_FEES = DELIVERY_FEES;

export function getProvinceForDistrict(district: string): string {
  for (const [province, districts] of Object.entries(RWANDA_DISTRICTS)) {
    if (districts.includes(district)) return province;
  }
  return 'Kigali City';
}

export function getDeliveryFee(district: string): number {
  const province = getProvinceForDistrict(district);
  return DELIVERY_FEES[province] || 4000;
}
export const getShippingFee = getDeliveryFee;

// ─── Kigali Pickup Stations (Click & Collect) ──────────────────────────────
export interface PickupStation {
  id: string;
  name: string;
  district: string;
  landmark: string;
  address: string;
  hours: string;
  phone: string;
  popular?: boolean;
}

export const PICKUP_STATIONS: PickupStation[] = [
  {
    id: 'ps-chic',
    name: 'CHIC Building Hub (Downtown)',
    district: 'Nyarugenge',
    landmark: 'Ground Floor, Shop G-14 (Near Bank of Kigali)',
    address: 'KN 2 Ave, Kigali Downtown',
    hours: 'Mon – Sat: 8:00 AM – 8:00 PM',
    phone: '+250 788 123 001',
    popular: true,
  },
  {
    id: 'ps-kct',
    name: 'Kigali City Tower (KCT)',
    district: 'Nyarugenge',
    landmark: 'Mezzanine Floor, Hub M-02',
    address: 'KN 81 St, Kigali City Centre',
    hours: 'Mon – Sat: 8:00 AM – 8:00 PM',
    phone: '+250 788 123 002',
    popular: true,
  },
  {
    id: 'ps-remera',
    name: 'Remera Corner / Giporoso',
    district: 'Gasabo',
    landmark: 'Opposite Amahoro National Stadium Gate 2',
    address: 'KG 11 Ave, Remera',
    hours: 'Mon – Sat: 8:00 AM – 9:00 PM',
    phone: '+250 788 123 004',
    popular: true,
  },
  {
    id: 'ps-kimironko',
    name: 'Kimironko Market Plaza',
    district: 'Gasabo',
    landmark: '1st Floor Shop K-08 (Near Taxi Park Entrance)',
    address: 'KG 13 Ave, Kimironko',
    hours: 'Mon – Sat: 8:00 AM – 8:30 PM',
    phone: '+250 788 123 005',
    popular: true,
  },
  {
    id: 'ps-utc',
    name: 'UTC (Union Trade Centre)',
    district: 'Nyarugenge',
    landmark: 'Central Ground Hub, Opposite Simba Supermarket',
    address: 'KN 4 Ave, Nyarugenge',
    hours: 'Mon – Sat: 8:30 AM – 7:30 PM',
    phone: '+250 788 123 003',
  },
  {
    id: 'ps-kicukiro',
    name: 'Kicukiro Centre (Sonatubes Hub)',
    district: 'Kicukiro',
    landmark: 'Near Sonatubes Roundabout Commercial Complex',
    address: 'KK 15 Rd, Kicukiro',
    hours: 'Mon – Sat: 8:30 AM – 7:30 PM',
    phone: '+250 788 123 006',
  },
  {
    id: 'ps-nyamirambo',
    name: 'Nyamirambo Commercial Hub',
    district: 'Nyarugenge',
    landmark: 'Near Biryogo Green Mosque & Car-Free Zone',
    address: 'KN 134 St, Nyamirambo',
    hours: 'Mon – Sun: 8:00 AM – 9:00 PM',
    phone: '+250 788 123 007',
  },
];

export const PICKUP_FEE = 1000;
export const FREE_PICKUP_THRESHOLD = 50000;

export function getPickupFee(subtotal: number): number {
  return subtotal >= FREE_PICKUP_THRESHOLD ? 0 : PICKUP_FEE;
}

// Format currency in RWF
export function formatRWF(amount: number): string {
  return `RWF ${amount.toLocaleString('en-RW')}`;
}

// Electronics-focused product categories
export const PRODUCT_CATEGORIES = [
  { id: 'smartphones', label: 'Smartphones', icon: '', color: '#2563EB' },
  { id: 'tablets', label: 'Tablets & iPads', icon: '', color: '#7C3AED' },
  { id: 'laptops', label: 'Laptops & PCs', icon: '', color: '#0891B2' },
  { id: 'tvs', label: 'TVs & Displays', icon: '', color: '#1D4ED8' },
  { id: 'audio', label: 'Audio & Headphones', icon: '', color: '#4F46E5' },
  { id: 'cameras', label: 'Cameras & Drones', icon: '', color: '#B91C1C' },
  { id: 'accessories', label: 'Accessories & Cables', icon: '', color: '#059669' },
  { id: 'gaming', label: 'Gaming & Consoles', icon: '', color: '#9333EA' },
  { id: 'networking', label: 'Routers & Networking', icon: '', color: '#0F766E' },
  { id: 'powerbanks', label: 'Power & Batteries', icon: '', color: '#D97706' },
  { id: 'smartwatches', label: 'Smartwatches', icon: '', color: '#C2410C' },
  { id: 'refurbished', label: 'Refurbished Deals', icon: '', color: '#374151' },
];

// Phone brands featured on the platform
export const FEATURED_BRANDS = [
  { id: 'samsung', label: 'Samsung', color: '#1428A0' },
  { id: 'apple', label: 'Apple', color: '#1D1D1F' },
  { id: 'tecno', label: 'Tecno', color: '#0066CC' },
  { id: 'infinix', label: 'Infinix', color: '#FF4500' },
  { id: 'xiaomi', label: 'Xiaomi', color: '#FF6900' },
  { id: 'hp', label: 'HP', color: '#0096D6' },
  { id: 'lenovo', label: 'Lenovo', color: '#E2231A' },
  { id: 'sony', label: 'Sony', color: '#00439C' },
];

export interface ProductSpec {
  ram?: string;
  storage?: string;
  screen?: string;
  battery?: string;
  processor?: string;
  camera?: string;
  os?: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  seller: string;
  sellerId: string;
  district: string;
  stock: number;
  badge?: string;
  brand?: string;
  condition?: 'new' | 'refurbished';
  warranty?: string;
  specs?: ProductSpec;
}

// Mock electronics product data
export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Samsung Galaxy S24 5G',
    price: 850000,
    originalPrice: 980000,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400',
    category: 'smartphones',
    brand: 'Samsung',
    rating: 4.8,
    reviews: 214,
    seller: 'TechHub Kigali',
    sellerId: 'seller1',
    district: 'Gasabo',
    stock: 18,
    badge: 'Best Seller',
    condition: 'new',
    warranty: '1 Year',
    specs: { ram: '8GB', storage: '256GB', screen: '6.2"', battery: '4000mAh', camera: '50MP' },
  },
  {
    id: '2',
    title: 'Samsung Galaxy A54 5G',
    price: 350000,
    originalPrice: 420000,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',
    category: 'smartphones',
    brand: 'Samsung',
    rating: 4.6,
    reviews: 312,
    seller: 'PhoneZone Rwanda',
    sellerId: 'seller2',
    district: 'Kicukiro',
    stock: 42,
    badge: 'Flash Sale',
    condition: 'new',
    warranty: '1 Year',
    specs: { ram: '8GB', storage: '128GB', screen: '6.4"', battery: '5000mAh', camera: '50MP' },
  },
  {
    id: '3',
    title: 'iPhone 15 Pro 256GB',
    price: 1450000,
    originalPrice: 1600000,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400',
    category: 'smartphones',
    brand: 'Apple',
    rating: 4.9,
    reviews: 178,
    seller: 'iStore Kigali',
    sellerId: 'seller3',
    district: 'Nyarugenge',
    stock: 8,
    badge: 'Top Rated',
    condition: 'new',
    warranty: '1 Year',
    specs: { ram: '8GB', storage: '256GB', screen: '6.1"', battery: '3274mAh', camera: '48MP' },
  },
  {
    id: '4',
    title: 'Tecno Spark 20 Pro+',
    price: 155000,
    originalPrice: 185000,
    image: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400',
    category: 'smartphones',
    brand: 'Tecno',
    rating: 4.3,
    reviews: 524,
    seller: 'GadgetMart RW',
    sellerId: 'seller4',
    district: 'Gasabo',
    stock: 65,
    badge: 'Budget Pick',
    condition: 'new',
    warranty: '1 Year',
    specs: { ram: '8GB', storage: '256GB', screen: '6.78"', battery: '5000mAh', camera: '108MP' },
  },
  {
    id: '5',
    title: 'Infinix Hot 40 Pro',
    price: 120000,
    originalPrice: 145000,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    category: 'smartphones',
    brand: 'Infinix',
    rating: 4.2,
    reviews: 389,
    seller: 'PhoneZone Rwanda',
    sellerId: 'seller2',
    district: 'Kicukiro',
    stock: 80,
    badge: 'New',
    condition: 'new',
    warranty: '1 Year',
    specs: { ram: '8GB', storage: '128GB', screen: '6.78"', battery: '5000mAh', camera: '108MP' },
  },
  {
    id: '6',
    title: 'iPhone 13 - Refurbished',
    price: 620000,
    originalPrice: 900000,
    image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400',
    category: 'smartphones',
    brand: 'Apple',
    rating: 4.5,
    reviews: 143,
    seller: 'iStore Kigali',
    sellerId: 'seller3',
    district: 'Nyarugenge',
    stock: 14,
    badge: 'Refurbished',
    condition: 'refurbished',
    warranty: '6 Months',
    specs: { ram: '4GB', storage: '128GB', screen: '6.1"', battery: '3227mAh', camera: '12MP' },
  },
  {
    id: '7',
    title: 'HP Pavilion Laptop 15 - i5 12th Gen',
    price: 780000,
    originalPrice: 890000,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
    category: 'laptops',
    brand: 'HP',
    rating: 4.5,
    reviews: 97,
    seller: 'TechHub Kigali',
    sellerId: 'seller1',
    district: 'Gasabo',
    stock: 11,
    badge: 'Top Pick',
    condition: 'new',
    warranty: '1 Year',
    specs: { ram: '16GB', storage: '512GB', screen: '15.6"', processor: 'Intel i5-1235U' },
  },
  {
    id: '8',
    title: 'Lenovo IdeaPad 3 - Ryzen 5',
    price: 640000,
    originalPrice: 720000,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
    category: 'laptops',
    brand: 'Lenovo',
    rating: 4.4,
    reviews: 73,
    seller: 'GadgetMart RW',
    sellerId: 'seller4',
    district: 'Gasabo',
    stock: 9,
    badge: 'Flash Sale',
    condition: 'new',
    warranty: '1 Year',
    specs: { ram: '8GB', storage: '256GB', screen: '15.6"', processor: 'AMD Ryzen 5 5500U' },
  },
  {
    id: '9',
    title: 'Samsung 43" 4K Smart TV',
    price: 420000,
    originalPrice: 490000,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
    category: 'tvs',
    brand: 'Samsung',
    rating: 4.6,
    reviews: 156,
    seller: 'TechHub Kigali',
    sellerId: 'seller1',
    district: 'Gasabo',
    stock: 15,
    badge: 'Flash Sale',
    condition: 'new',
    warranty: '2 Years',
    specs: { screen: '43"', storage: '4K UHD', processor: 'Smart TV (Tizen)' },
  },
  {
    id: '10',
    title: 'Sony WH-1000XM5 Headphones',
    price: 280000,
    originalPrice: 340000,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    category: 'audio',
    brand: 'Sony',
    rating: 4.9,
    reviews: 231,
    seller: 'PhoneZone Rwanda',
    sellerId: 'seller2',
    district: 'Kicukiro',
    stock: 22,
    badge: 'Best Seller',
    condition: 'new',
    warranty: '1 Year',
    specs: { battery: '30hrs', processor: 'Noise Cancelling' },
  },
  {
    id: '11',
    title: 'Apple iPad 10th Gen 64GB WiFi',
    price: 680000,
    originalPrice: 760000,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
    category: 'tablets',
    brand: 'Apple',
    rating: 4.7,
    reviews: 88,
    seller: 'iStore Kigali',
    sellerId: 'seller3',
    district: 'Nyarugenge',
    stock: 7,
    badge: 'New',
    condition: 'new',
    warranty: '1 Year',
    specs: { ram: '4GB', storage: '64GB', screen: '10.9"', processor: 'Apple A14 Bionic' },
  },
  {
    id: '12',
    title: 'Xiaomi Redmi Note 13 Pro',
    price: 245000,
    originalPrice: 290000,
    image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400',
    category: 'smartphones',
    brand: 'Xiaomi',
    rating: 4.4,
    reviews: 267,
    seller: 'GadgetMart RW',
    sellerId: 'seller4',
    district: 'Gasabo',
    stock: 33,
    badge: 'Top Rated',
    condition: 'new',
    warranty: '1 Year',
    specs: { ram: '8GB', storage: '256GB', screen: '6.67"', battery: '5100mAh', camera: '200MP' },
  },
];

export const MOCK_SELLERS = [
  { id: 'seller1', name: 'TechHub Kigali', rating: 4.8, products: 145, district: 'Gasabo', verified: true, specialty: 'Samsung & HP' },
  { id: 'seller2', name: 'PhoneZone Rwanda', rating: 4.7, products: 98, district: 'Kicukiro', verified: true, specialty: 'All Brands' },
  { id: 'seller3', name: 'iStore Kigali', rating: 4.9, products: 54, district: 'Nyarugenge', verified: true, specialty: 'Apple Authorized' },
  { id: 'seller4', name: 'GadgetMart RW', rating: 4.6, products: 212, district: 'Gasabo', verified: true, specialty: 'Budget Phones' },
];
