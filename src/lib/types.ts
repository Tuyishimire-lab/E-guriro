/**
 * Centralized TypeScript interfaces for RwandaBuy.
 * These map 1:1 to future Firestore document shapes.
 * When Firebase is integrated, replace the service layer bodies —
 * these types remain unchanged.
 */

export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  district?: string;
  phone?: string;
  shopName?: string;
  avatarUrl?: string;
  createdAt?: string;
  status?: 'active' | 'suspended' | 'pending';
}

export interface Address {
  id: string;
  label: string;
  district: string;
  street: string;
  isDefault: boolean;
}

export interface ProductSpec {
  ram?: string;
  storage?: string;
  screen?: string;
  battery?: string;
  processor?: string;
  camera?: string;
  weight?: string;
  os?: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews?: number;
  seller: string;
  sellerId?: string;
  category?: string;
  brand?: string;
  badge?: string;
  stock?: number;
  condition?: 'new' | 'refurbished';
  warranty?: string;
  specs?: ProductSpec;
  description?: string;
  createdAt?: string;
  status?: 'active' | 'pending' | 'rejected' | 'archived';
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  seller: string;
  sellerId?: string;
  stock: number;
  qty: number;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  qty: number;
  image: string;
  seller: string;
  sellerId: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'mtn_momo' | 'airtel_money' | 'card';

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  items: OrderItem[];
  total: number;
  shipping: number;
  address: Address;
  district: string;
  phone: string;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  imageUrl?: string;
  sentAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  productId?: string;
  productTitle?: string;
}

export interface Category {
  id: string;
  label: string;
  icon?: string;
  imageUrl?: string;
  color: string;
  description?: string;
  productCount?: number;
  visible?: boolean;
}

export interface Promotion {
  id: string;
  type: 'flash_sale' | 'discount_code' | 'banner';
  title: string;
  description?: string;
  discount?: number;
  code?: string;
  endsAt?: string;
  active: boolean;
  productIds?: string[];
  imageUrl?: string;
  createdAt: string;
}

export interface SellerProfile extends User {
  role: 'seller';
  shopName: string;
  totalRevenue?: number;
  totalOrders?: number;
  totalProducts?: number;
  rating?: number;
  approvedAt?: string;
  rejectedReason?: string;
}

export interface PlatformSettings {
  platformName: string;
  commissionRate: number;
  kigaliShipping: number;
  provinceShipping: number;
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  allowSellerRegistrations: boolean;
  features: {
    chat: boolean;
    wishlist: boolean;
    reviews: boolean;
    flashSales: boolean;
  };
  payment: {
    mtnMomo: boolean;
    airtelMoney: boolean;
    card: boolean;
  };
}
