// Database entity types for Lavandería Oriental
// These types match the actual Supabase database schema

export interface Customer {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  language: 'es' | 'en';
  notes: string | null;
  total_orders?: number;
  total_spent?: number;
  last_order_at?: string | null;
  is_blocked?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  channel: 'whatsapp' | 'web' | 'phone';
  status: 'active' | 'escalated' | 'resolved' | 'closed';
  assigned_agent: string | null;
  message_count: number;
  ai_handled?: boolean;
  last_message_at: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  message_type: 'text' | 'image' | 'audio' | 'document';
  ai_generated: boolean;
  external_id: string | null;
  created_at: string;
}

export type EscalationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EscalationStatus = 'pending' | 'claimed' | 'resolved' | 'cancelled';

export interface Escalation {
  id: string;
  conversation_id: string;
  customer_id?: string;
  reason: string;
  priority: EscalationPriority;
  status: EscalationStatus;
  claimed_by: string | null;
  claimed_at: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

// Location matches actual DB schema
export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  hours_weekday: string;
  hours_saturday: string;
  hours_sunday: string;
  delivery_available: boolean;
  status: 'active' | 'coming_soon' | 'inactive';
  lat?: number | null;
  lng?: number | null;
  created_at: string;
}

// Service Category matches actual DB schema
export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

// Service matches actual DB schema with price tiers
export interface Service {
  id: string;
  category: string;
  category_id?: string | null;
  name: string;
  description: string | null;
  price_lavado_secado: number | null;
  price_solo_lavado: number | null;
  price_solo_secado: number | null;
  price_unit: string;
  active: boolean;
  created_at: string;
}

// Simplified service for display
export interface ServiceDisplay {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  unit: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItem {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  price_type?: 'lavado_secado' | 'solo_lavado' | 'solo_secado';
}

export interface Order {
  id: string;
  customer_id: string;
  location_id: string | null;
  conversation_id: string | null;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  pickup_date: string | null;
  delivery_date: string | null;
  created_at: string;
  updated_at?: string;
}

export interface KnowledgeBase {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  language: 'es' | 'en';
  active: boolean;
  created_at: string;
}

export interface DailyReportMetrics {
  total_conversations: number;
  new_conversations: number;
  resolved_conversations: number;
  escalated_conversations: number;
  total_messages: number;
  ai_messages: number;
  agent_messages: number;
  total_orders: number;
  orders_value: number;
  avg_response_time_seconds: number | null;
}

export interface DailyReport {
  id: string;
  report_date: string;
  metrics: DailyReportMetrics;
  created_at: string;
}

export type NotificationType = 'escalation' | 'order' | 'system' | 'reminder';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

// Employee / User types
export type EmployeeRole = 'admin' | 'employee';

export interface Employee {
  id: string;
  auth_id: string;
  email: string;
  name: string;
  role: EmployeeRole;
  phone: string | null;
  location_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface EmployeeWithLocation extends Employee {
  location?: Location | null;
}

// Service catalog for API responses
export interface ServiceCatalog {
  categories: ServiceCategoryWithServices[];
}

export interface ServiceCategoryWithServices extends ServiceCategory {
  services: Service[];
}
