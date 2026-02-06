// API types for Lavandería Oriental

import type {
  Customer,
  Conversation,
  Message,
  Order,
  Escalation,
  Location,
  Service,
  ServiceCategory,
  DailyReportMetrics,
} from './database';

// Generic API response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  code?: string;
}

export interface ApiSuccess<T = void> {
  success: true;
  data?: T;
  message?: string;
}

// Conversation types with relations
export interface ConversationWithCustomer extends Conversation {
  customer: Customer;
}

export interface ConversationWithMessages extends Conversation {
  customer: Customer;
  messages: Message[];
}

export interface ConversationListItem extends Conversation {
  customer: Pick<Customer, 'id' | 'name' | 'phone'>;
  last_message?: Pick<Message, 'content' | 'direction' | 'created_at'>;
}

// Order types with relations
export interface OrderWithDetails extends Order {
  customer: Customer;
  location: Location | null;
}

export interface OrderListItem extends Order {
  customer: Pick<Customer, 'id' | 'name' | 'phone'>;
  location: Pick<Location, 'id' | 'name'> | null;
}

// Escalation types with relations
export interface EscalationWithDetails extends Escalation {
  conversation: ConversationWithCustomer;
}

// Customer types with history
export interface CustomerWithHistory extends Customer {
  conversations: Conversation[];
  orders: Order[];
  total_orders: number;
  total_spent: number;
}

// Dashboard analytics types
export interface DashboardStats {
  activeConversations: number;
  pendingEscalations: number;
  todayOrders: number;
  todayRevenue: number;
  totalCustomers: number;
  resolvedToday: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentConversations: ConversationListItem[];
  recentOrders: OrderListItem[];
  pendingEscalations: EscalationWithDetails[];
}

// API request types
export interface ConversationFilters {
  status?: Conversation['status'];
  search?: string;
  customerId?: string;
  page?: number;
  pageSize?: number;
}

export interface OrderFilters {
  status?: Order['status'];
  customerId?: string;
  locationId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface CustomerFilters {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface EscalationFilters {
  status?: Escalation['status'];
  priority?: Escalation['priority'];
  page?: number;
  pageSize?: number;
}

// API mutation types
export interface CreateOrderRequest {
  customer_id: string;
  location_id?: string;
  conversation_id?: string;
  items: Array<{
    service_id: string;
    quantity: number;
  }>;
  notes?: string;
  pickup_date?: string;
  delivery_date?: string;
}

export interface UpdateOrderRequest {
  status?: Order['status'];
  items?: Array<{
    service_id: string;
    quantity: number;
  }>;
  notes?: string;
  pickup_date?: string;
  delivery_date?: string;
}

export interface EscalateConversationRequest {
  reason: string;
  priority?: Escalation['priority'];
}

export interface ResolveEscalationRequest {
  resolution_notes?: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface UpdateConversationRequest {
  status?: Conversation['status'];
  assigned_agent?: string | null;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  language?: Customer['language'];
  notes?: string;
}

// Service catalog types
export interface ServiceWithCategoryDetails extends Omit<Service, 'category'> {
  category: ServiceCategory;
  categoryName: string;
}

// Re-export from database types
export type { ServiceCatalog, ServiceCategoryWithServices } from './database';

// Analytics report types
export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
}

export interface AnalyticsReport {
  period: {
    from: string;
    to: string;
  };
  totals: DailyReportMetrics;
  daily: Array<{
    date: string;
    metrics: DailyReportMetrics;
  }>;
}
