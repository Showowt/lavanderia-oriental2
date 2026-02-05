// Database entity types for Lavandería Oriental

export interface Customer {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  language: 'es' | 'en';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  channel: 'whatsapp' | 'web' | 'phone';
  status: 'active' | 'escalated' | 'resolved' | 'closed';
  assigned_agent: string | null;
  message_count: number;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
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
  reason: string;
  priority: EscalationPriority;
  status: EscalationStatus;
  claimed_by: string | null;
  claimed_at: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  hours: BusinessHours;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  unit: 'piece' | 'kg' | 'load' | 'item';
  estimated_hours: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'in_progress' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItem {
  service_id: string;
  service_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
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
  updated_at: string;
}

export interface KnowledgeBase {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  language: 'es' | 'en';
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
