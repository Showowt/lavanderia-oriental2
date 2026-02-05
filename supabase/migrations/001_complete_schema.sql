-- Lavandería Oriental - Complete Database Schema
-- Run this migration in Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- LOCATIONS TABLE
-- Business branches/locations
-- ============================================
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL,
  address text NOT NULL,
  phone varchar(50),
  hours jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT locations_pkey PRIMARY KEY (id)
);

-- ============================================
-- SERVICE CATEGORIES TABLE
-- Groups of services
-- ============================================
CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT service_categories_pkey PRIMARY KEY (id)
);

-- ============================================
-- SERVICES TABLE
-- Individual services offered
-- ============================================
CREATE TABLE IF NOT EXISTS public.services (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL,
  name varchar(255) NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  unit varchar(50) DEFAULT 'piece' CHECK (unit IN ('piece', 'kg', 'load', 'item')),
  estimated_hours integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id)
);

-- ============================================
-- CUSTOMERS TABLE (update if exists)
-- ============================================
-- Add columns if they don't exist (for existing tables)
DO $$
BEGIN
  -- Ensure customers table has all required columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'total_orders') THEN
    ALTER TABLE public.customers ADD COLUMN total_orders integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'total_spent') THEN
    ALTER TABLE public.customers ADD COLUMN total_spent numeric DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'last_order_at') THEN
    ALTER TABLE public.customers ADD COLUMN last_order_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'is_blocked') THEN
    ALTER TABLE public.customers ADD COLUMN is_blocked boolean DEFAULT false;
  END IF;
END $$;

-- ============================================
-- CONVERSATIONS TABLE (update if exists)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'last_message_at') THEN
    ALTER TABLE public.conversations ADD COLUMN last_message_at timestamptz;
  END IF;
END $$;

-- ============================================
-- MESSAGES TABLE
-- Chat messages in conversations
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  direction varchar(20) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content text NOT NULL,
  message_type varchar(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'document')),
  ai_generated boolean DEFAULT false,
  external_id varchar(255),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id)
);

-- Index for fast message lookups by conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- ============================================
-- ESCALATIONS TABLE
-- Human handoff queue
-- ============================================
CREATE TABLE IF NOT EXISTS public.escalations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  reason text NOT NULL,
  priority varchar(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status varchar(20) DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'resolved', 'cancelled')),
  claimed_by varchar(255),
  claimed_at timestamptz,
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT escalations_pkey PRIMARY KEY (id)
);

-- Index for fast escalation queue lookups
CREATE INDEX IF NOT EXISTS idx_escalations_status ON public.escalations(status);
CREATE INDEX IF NOT EXISTS idx_escalations_priority ON public.escalations(priority);

-- ============================================
-- ORDERS TABLE
-- Service orders
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  status varchar(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'ready', 'delivered', 'cancelled')),
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  tax numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  notes text,
  pickup_date timestamptz,
  delivery_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id)
);

-- Indexes for order queries
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ============================================
-- KNOWLEDGE BASE TABLE
-- AI FAQ source
-- ============================================
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  category varchar(100) NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  keywords text[] DEFAULT '{}',
  language varchar(10) DEFAULT 'es' CHECK (language IN ('es', 'en')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT knowledge_base_pkey PRIMARY KEY (id)
);

-- Index for knowledge base searches
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_language ON public.knowledge_base(language);

-- ============================================
-- DAILY REPORTS TABLE
-- Analytics snapshots
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  report_date date NOT NULL UNIQUE,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT daily_reports_pkey PRIMARY KEY (id)
);

-- Index for date lookups
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON public.daily_reports(report_date DESC);

-- ============================================
-- NOTIFICATIONS TABLE
-- Agent alerts
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  type varchar(50) NOT NULL CHECK (type IN ('escalation', 'order', 'system', 'reminder')),
  title varchar(255) NOT NULL,
  message text NOT NULL,
  link varchar(500),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES (Allow service role full access)
-- ============================================
-- Locations
CREATE POLICY "Service role has full access to locations" ON public.locations
  FOR ALL USING (true) WITH CHECK (true);

-- Service Categories
CREATE POLICY "Service role has full access to service_categories" ON public.service_categories
  FOR ALL USING (true) WITH CHECK (true);

-- Services
CREATE POLICY "Service role has full access to services" ON public.services
  FOR ALL USING (true) WITH CHECK (true);

-- Messages
CREATE POLICY "Service role has full access to messages" ON public.messages
  FOR ALL USING (true) WITH CHECK (true);

-- Escalations
CREATE POLICY "Service role has full access to escalations" ON public.escalations
  FOR ALL USING (true) WITH CHECK (true);

-- Orders
CREATE POLICY "Service role has full access to orders" ON public.orders
  FOR ALL USING (true) WITH CHECK (true);

-- Knowledge Base
CREATE POLICY "Service role has full access to knowledge_base" ON public.knowledge_base
  FOR ALL USING (true) WITH CHECK (true);

-- Daily Reports
CREATE POLICY "Service role has full access to daily_reports" ON public.daily_reports
  FOR ALL USING (true) WITH CHECK (true);

-- Notifications
CREATE POLICY "Service role has full access to notifications" ON public.notifications
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_locations_updated_at ON public.locations;
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON public.knowledge_base;
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
