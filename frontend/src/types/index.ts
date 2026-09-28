export type UserRole = 'CUSTOMER' | 'ADMIN' | 'STAFF' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url: string;
  parent_id?: string;
  display_order: number;
  is_active: boolean;
  item_count?: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  title: string;
  sku: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  attributes: Record<string, string>;
  image_url?: string;
  is_active: boolean;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  public_id?: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  base_price: number;
  compare_at_price?: number;
  sku: string;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  rating: number;
  review_count: number;
  badge?: string;
  images: ProductImage[];
  variants?: ProductVariant[];
  created_at?: string;
  updated_at?: string;
}

export interface Address {
  id: string;
  user_id?: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  total: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  shipping_fee: number;
  tax_amount: number;
  total_amount: number;
  free_shipping_threshold: number;
}

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  variant_name?: string;
  price: number;
  quantity: number;
  total: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  shipping_address: Address;
  payment_method: 'RAZORPAY' | 'COD';
  payment_status: PaymentStatus;
  tracking_number?: string;
  carrier?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  min_order_value: number;
  max_discount_amount?: number;
  is_active: boolean;
  expires_at?: string;
}
