import { z } from 'zod';

// ============================================
// Common Schemas
// ============================================
export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ============================================
// Customer Schemas
// ============================================
export const customerFilterSchema = paginationSchema.extend({
  search: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  language: z.enum(['es', 'en']).optional(),
  notes: z.string().max(1000).optional(),
});

// ============================================
// Conversation Schemas
// ============================================
export const conversationFilterSchema = paginationSchema.extend({
  status: z.enum(['active', 'escalated', 'resolved', 'closed']).optional(),
  search: z.string().optional(),
  customerId: z.string().uuid().optional(),
});

export const updateConversationSchema = z.object({
  status: z.enum(['active', 'escalated', 'resolved', 'closed']).optional(),
  assigned_agent: z.string().max(255).nullable().optional(),
});

export const escalateConversationSchema = z.object({
  reason: z.string().min(1).max(500),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(4096),
});

// ============================================
// Order Schemas
// ============================================
export const orderItemSchema = z.object({
  service_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(1000),
});

export const orderFilterSchema = paginationSchema.extend({
  status: z
    .enum(['pending', 'confirmed', 'in_progress', 'ready', 'delivered', 'cancelled'])
    .optional(),
  customerId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export const createOrderSchema = z.object({
  customer_id: z.string().uuid(),
  location_id: z.string().uuid().optional(),
  conversation_id: z.string().uuid().optional(),
  items: z.array(orderItemSchema).min(1),
  notes: z.string().max(1000).optional(),
  pickup_date: z.string().datetime().optional(),
  delivery_date: z.string().datetime().optional(),
});

export const updateOrderSchema = z.object({
  status: z
    .enum(['pending', 'confirmed', 'in_progress', 'ready', 'delivered', 'cancelled'])
    .optional(),
  items: z.array(orderItemSchema).min(1).optional(),
  notes: z.string().max(1000).optional(),
  pickup_date: z.string().datetime().nullable().optional(),
  delivery_date: z.string().datetime().nullable().optional(),
});

// ============================================
// Escalation Schemas
// ============================================
export const escalationFilterSchema = paginationSchema.extend({
  status: z.enum(['pending', 'claimed', 'resolved', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

export const claimEscalationSchema = z.object({
  claimed_by: z.string().min(1).max(255),
});

export const resolveEscalationSchema = z.object({
  resolution_notes: z.string().max(1000).optional(),
});

// ============================================
// Service Schemas
// ============================================
export const createServiceSchema = z.object({
  category_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  price: z.number().min(0).max(100000),
  unit: z.enum(['piece', 'kg', 'load', 'item']),
  estimated_hours: z.number().int().min(1).max(720).optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

// ============================================
// Location Schemas
// ============================================
const dayHoursSchema = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/),
  close: z.string().regex(/^\d{2}:\d{2}$/),
  closed: z.boolean().optional(),
});

export const businessHoursSchema = z.object({
  monday: dayHoursSchema.optional(),
  tuesday: dayHoursSchema.optional(),
  wednesday: dayHoursSchema.optional(),
  thursday: dayHoursSchema.optional(),
  friday: dayHoursSchema.optional(),
  saturday: dayHoursSchema.optional(),
  sunday: dayHoursSchema.optional(),
});

export const createLocationSchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string().min(1).max(500),
  phone: z.string().max(50).optional(),
  hours: businessHoursSchema.optional(),
});

export const updateLocationSchema = createLocationSchema.partial();

// ============================================
// Knowledge Base Schemas
// ============================================
export const createKnowledgeBaseSchema = z.object({
  category: z.string().min(1).max(100),
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(2000),
  keywords: z.array(z.string().max(50)).max(20).optional(),
  language: z.enum(['es', 'en']).default('es'),
});

export const updateKnowledgeBaseSchema = createKnowledgeBaseSchema.partial();

// ============================================
// Analytics Schemas
// ============================================
export const reportFilterSchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// ============================================
// Type Exports
// ============================================
export type CustomerFilterInput = z.infer<typeof customerFilterSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type ConversationFilterInput = z.infer<typeof conversationFilterSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type EscalateConversationInput = z.infer<typeof escalateConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type OrderFilterInput = z.infer<typeof orderFilterSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type EscalationFilterInput = z.infer<typeof escalationFilterSchema>;
export type ClaimEscalationInput = z.infer<typeof claimEscalationSchema>;
export type ResolveEscalationInput = z.infer<typeof resolveEscalationSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type CreateKnowledgeBaseInput = z.infer<typeof createKnowledgeBaseSchema>;
export type UpdateKnowledgeBaseInput = z.infer<typeof updateKnowledgeBaseSchema>;
export type ReportFilterInput = z.infer<typeof reportFilterSchema>;
