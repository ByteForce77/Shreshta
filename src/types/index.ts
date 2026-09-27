export type ScreenName =
  | 'SPLASH'
  | 'HOME'
  | 'PRODUCTS'
  | 'PRODUCT_DETAILS'
  | 'CART'
  | 'CHECKOUT'
  | 'ORDER_STATUS'
  | 'SUBSCRIPTION'
  | 'REWARDS'
  | 'ACCOUNT';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  profile_image?: string;
  referral_code: string;
  referred_by?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | 'ORDER_MANAGER';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  loyalty_points: number;
  created_at: string;
  updated_at?: string;
}

export interface Address {
  id: string;
  user_id: string;
  address_type: 'Home' | 'Work' | 'Other';
  name: string;
  mobile: string;
  door_no: string;
  street: string;
  locality?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  delivery_instructions?: string;
  is_default: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  name_telugu: string;
  slug: string;
  image: string;
  sort_order: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ProductVariant {
  id: string;
  size: string; // e.g. "500ml", "1 Litre", "5 Litres", "1 Kg", "5 Kg"
  unit: string; // "ml", "L", "g", "Kg"
  price: number;
  mrp: number;
  stock_quantity: number;
  sku: string;
  weight?: string;
  status: 'ACTIVE' | 'OUT_OF_STOCK';
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  name_telugu: string;
  slug: string;
  description: string;
  highlights: string[];
  ingredients: string;
  storage_information: string;
  delivery_information: string;
  main_image: string;
  gallery_images?: string[];
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  featured: boolean;
  rating: number;
  reviews_count: number;
  variants: ProductVariant[];
  created_at?: string;
}

export interface CartItem {
  product_id: string;
  variant_id: string;
  product_name: string;
  product_name_telugu?: string;
  variant_name: string;
  image: string;
  unit_price: number;
  mrp: number;
  quantity: number;
}

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'COD';

export interface OrderItem {
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_name: string;
  image?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  delivery_charge: number;
  reward_discount: number;
  coupon_discount: number;
  coupon_code?: string;
  total_amount: number;
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  order_status: OrderStatus;
  payment_method: PaymentMethod;
  address: Address;
  expected_delivery_date: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionItem {
  product_id: string;
  variant_id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  user_name?: string;
  plan_id: string;
  plan_name: string;
  kit_description: string;
  selected_oils: string[]; // e.g. ["2L Groundnut", "2L Sesame", "1L Coconut"]
  grains_kit: string[]; // Navaratnalu items
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  delivery_date_day: number; // e.g. 1 or 5 of every month
  next_delivery_date: string;
  next_billing_date: string;
  auto_renew: boolean;
  payment_method: string;
  total_amount: number;
  address?: Address;
  created_at: string;
  updated_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  minimum_order: number;
  maximum_discount: number;
  start_date: string;
  end_date: string;
  usage_limit: number;
  per_user_limit: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface RewardTransaction {
  id: string;
  user_id: string;
  type: 'EARNED_ORDER' | 'EARNED_REFERRAL' | 'REDEEMED' | 'BONUS';
  points: number;
  description: string;
  order_id?: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  order_id?: string;
  category: 'Order Status' | 'Payment Issue' | 'Delivery Delay' | 'Product Quality' | 'Subscription' | 'Other';
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  admin_reply?: string;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  highlight: string;
  image: string;
  action_url: string;
  active: boolean;
  sort_order: number;
}
