export type UserRole = 'customer' | 'seller' | 'ngo';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  // Seller profile fields
  business_name?: string;
  business_address?: string;
  locality?: string;
  city?: string;
  state?: string;
  pin_code?: string;
  business_type?: string;
  fssai_license?: string;
  // NGO profile fields
  org_name?: string;
  registration_number?: string;
  verification_status?: 'pending' | 'verified' | 'rejected';
  cause_area?: string;
  website?: string;
}

export interface Product {
  id: number;
  seller_id: number;
  name: string;
  category: string;
  description: string;
  image_url: string;
  original_price: number;
  discounted_price: number;
  quantity: number;
  unit: string;
  pickup_location: string;
  pickup_start?: string;
  pickup_end: string;
  expiry_date?: string;
  status: 'available' | 'reserved' | 'sold_out' | 'expired';
  is_eligible_for_donation: boolean | number;
  safety_notes?: string;
  discount_percentage?: number;
  // Seller info joined
  business_name?: string;
  business_address?: string;
  locality?: string;
  fssai_license?: string;
  seller_contact_name?: string;
  seller_phone?: string;
  created_at?: string;
}

export interface Reservation {
  id: number;
  customer_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  pickup_code: string;
  reserved_at: string;
  completed_at?: string;
  notes?: string;
  // Joined details
  product_name?: string;
  image_url?: string;
  category?: string;
  pickup_location?: string;
  pickup_end?: string;
  original_price?: number;
  business_name?: string;
  locality?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
}

export interface Donation {
  id: number;
  seller_id: number;
  product_id?: number;
  ngo_id?: number;
  title: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  expiry_date: string;
  pickup_location: string;
  pickup_deadline: string;
  status: 'available' | 'requested' | 'accepted' | 'completed' | 'rejected' | 'cancelled';
  request_notes?: string;
  safety_certification_acknowledged?: boolean;
  // Joined seller and ngo
  seller_name?: string;
  seller_phone?: string;
  business_name?: string;
  locality?: string;
  org_name?: string;
  ngo_contact_name?: string;
  verification_status?: string;
  cause_area?: string;
  created_at?: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'reservation' | 'donation' | 'alert' | 'system';
  is_read: boolean | number;
  created_at: string;
}

export interface GlobalImpact {
  overview: {
    total_products_listed: number;
    total_rescued_units: number;
    units_sold: number;
    units_donated: number;
    completed_reservations: number;
    total_customer_savings_inr: number;
    total_marketplace_volume_inr: number;
  };
  environmental: {
    estimated_waste_avoided_kg: number;
    estimated_co2_prevented_kg: number;
    estimated_water_saved_litres: number;
  };
  methodology: {
    assumptions: string[];
    location: string;
  };
}

export interface AiListingSuggestion {
  is_demo_mode: boolean;
  ai_engine: string;
  suggested_name: string;
  category: string;
  description: string;
  suggested_discount_percent: number;
  suggested_discounted_price: number;
  missing_information: string[];
  safety_notes: string[];
}
