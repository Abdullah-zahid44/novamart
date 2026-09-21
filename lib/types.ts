// NovaMart shared domain types. Shapes are contract-fixed (see CONTRACT.md);
// every agent imports from here.

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string; /* category slug */
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewsCount: number;
  images: string[];
  colors: string[];
  sizes?: string[];
  stock: number;
  tags: string[];
  badge?: 'NEW' | 'SALE' | 'HOT' | 'BESTSELLER';
  description: string;
  specs: Record<string, string>;
  featured?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  color?: string;
  size?: string;
  qty: number;
}

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  postal: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  addresses: Address[];
  wishlist: string[];
  createdAt: string;
}

export type CouponType = 'percent' | 'flat' | 'freeship';

export interface Coupon {
  code: string;
  type: CouponType;
  value: number;
  minOrder: number;
  expiresAt: string;
  usageLimit: number;
  used: number;
  active: boolean;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  color?: string;
  size?: string;
}

export interface Order {
  id: string;
  number: string;
  email: string;
  name: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentLast4?: string;
  address: Address;
  timeline: { status: OrderStatus; at: string; note?: string }[];
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  announcement: string;
  shippingFlat: number;
  freeShipOver: number;
  taxRate: number;
  supportEmail: string;
}
