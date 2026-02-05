-- =============================================
-- LAVANDERÍA ORIENTAL - PRODUCTION DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE TABLES (customers & conversations first)
-- =============================================

-- CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  phone varchar(50) NOT NULL UNIQUE,
  name varchar(255),
  email varchar(255),
  language varchar(10) DEFAULT 'es',
  notes text,
  total_orders integer DEFAULT 0,
  total_spent numeric DEFAULT 0,
  last_order_at timestamptz,
  is_blocked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);

-- CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'escalated', 'resolved', 'archived')),
  assigned_agent varchar(255),
  ai_enabled boolean DEFAULT true,
  context jsonb DEFAULT '{}'::jsonb,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id)
);

-- Index for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON public.conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);

-- =============================================
-- LOCATIONS TABLE
-- =============================================
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

-- =============================================
-- SERVICE CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name varchar(255) NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT service_categories_pkey PRIMARY KEY (id)
);

-- =============================================
-- SERVICES TABLE
-- =============================================
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

-- =============================================
-- MESSAGES TABLE
-- =============================================
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

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

-- =============================================
-- ESCALATIONS TABLE
-- =============================================
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

CREATE INDEX IF NOT EXISTS idx_escalations_status ON public.escalations(status);
CREATE INDEX IF NOT EXISTS idx_escalations_priority ON public.escalations(priority);

-- =============================================
-- ORDERS TABLE
-- =============================================
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

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- =============================================
-- KNOWLEDGE BASE TABLE
-- =============================================
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

CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_language ON public.knowledge_base(language);

-- =============================================
-- DAILY REPORTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.daily_reports (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  report_date date NOT NULL UNIQUE,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT daily_reports_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON public.daily_reports(report_date DESC);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
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

CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES (Full access for authenticated users)
-- =============================================
DO $$
BEGIN
  -- Customers
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = 'Full access to customers') THEN
    CREATE POLICY "Full access to customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Conversations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Full access to conversations') THEN
    CREATE POLICY "Full access to conversations" ON public.conversations FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Locations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'locations' AND policyname = 'Full access to locations') THEN
    CREATE POLICY "Full access to locations" ON public.locations FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Service Categories
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'service_categories' AND policyname = 'Full access to service_categories') THEN
    CREATE POLICY "Full access to service_categories" ON public.service_categories FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Services
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Full access to services') THEN
    CREATE POLICY "Full access to services" ON public.services FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Messages
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Full access to messages') THEN
    CREATE POLICY "Full access to messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Escalations
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'escalations' AND policyname = 'Full access to escalations') THEN
    CREATE POLICY "Full access to escalations" ON public.escalations FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Orders
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Full access to orders') THEN
    CREATE POLICY "Full access to orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Knowledge Base
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'knowledge_base' AND policyname = 'Full access to knowledge_base') THEN
    CREATE POLICY "Full access to knowledge_base" ON public.knowledge_base FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Daily Reports
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_reports' AND policyname = 'Full access to daily_reports') THEN
    CREATE POLICY "Full access to daily_reports" ON public.daily_reports FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- Notifications
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Full access to notifications') THEN
    CREATE POLICY "Full access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_locations_updated_at ON public.locations;
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_knowledge_base_updated_at ON public.knowledge_base;
CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON public.knowledge_base FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA
-- =============================================

-- Locations
INSERT INTO public.locations (name, address, phone, hours, is_active) VALUES
(
  'Lavandería Oriental - Centro',
  'Calle Principal #123, Centro, Ciudad',
  '+52 555 123 4567',
  '{"monday": {"open": "08:00", "close": "20:00"}, "tuesday": {"open": "08:00", "close": "20:00"}, "wednesday": {"open": "08:00", "close": "20:00"}, "thursday": {"open": "08:00", "close": "20:00"}, "friday": {"open": "08:00", "close": "20:00"}, "saturday": {"open": "09:00", "close": "18:00"}, "sunday": {"open": "10:00", "close": "14:00"}}'::jsonb,
  true
),
(
  'Lavandería Oriental - Norte',
  'Av. Norte #456, Colonia Norte, Ciudad',
  '+52 555 987 6543',
  '{"monday": {"open": "07:00", "close": "21:00"}, "tuesday": {"open": "07:00", "close": "21:00"}, "wednesday": {"open": "07:00", "close": "21:00"}, "thursday": {"open": "07:00", "close": "21:00"}, "friday": {"open": "07:00", "close": "21:00"}, "saturday": {"open": "08:00", "close": "19:00"}, "sunday": {"closed": true}}'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- Service Categories
INSERT INTO public.service_categories (name, description, display_order, is_active) VALUES
('Lavado Regular', 'Servicios de lavado y secado estándar', 1, true),
('Servicios Especiales', 'Planchado, tintorería y tratamientos especiales', 2, true)
ON CONFLICT DO NOTHING;

-- Services
WITH categories AS (
  SELECT id, name FROM public.service_categories
)
INSERT INTO public.services (category_id, name, description, price, unit, estimated_hours, is_active)
SELECT c.id, s.name, s.description, s.price, s.unit, s.estimated_hours, s.is_active
FROM (
  VALUES
    ('Lavado Regular', 'Lavado por Kilo', 'Lavado y secado de ropa general', 45.00, 'kg', 24, true),
    ('Lavado Regular', 'Lavado de Cobijas', 'Lavado especial para cobijas y edredones', 80.00, 'piece', 48, true),
    ('Lavado Regular', 'Lavado Express', 'Servicio de lavado urgente (mismo día)', 75.00, 'kg', 4, true),
    ('Servicios Especiales', 'Planchado', 'Servicio de planchado profesional', 25.00, 'piece', 24, true),
    ('Servicios Especiales', 'Tintorería', 'Limpieza en seco para prendas delicadas', 120.00, 'piece', 72, true)
) AS s(category_name, name, description, price, unit, estimated_hours, is_active)
JOIN categories c ON c.name = s.category_name
ON CONFLICT DO NOTHING;

-- Knowledge Base
INSERT INTO public.knowledge_base (category, question, answer, keywords, language, is_active) VALUES
('horarios', '¿Cuál es su horario de atención?', 'Nuestros horarios son:
- Centro: Lunes a Viernes 8am-8pm, Sábados 9am-6pm, Domingos 10am-2pm
- Norte: Lunes a Viernes 7am-9pm, Sábados 8am-7pm, Domingos cerrado', ARRAY['horario', 'hora', 'abierto', 'cerrado', 'atienden'], 'es', true),

('precios', '¿Cuánto cuesta el lavado por kilo?', 'El lavado por kilo tiene un costo de $45 MXN. Incluye lavado y secado. El servicio regular tarda 24 horas.', ARRAY['precio', 'costo', 'kilo', 'cuanto', 'cobra'], 'es', true),

('precios', '¿Cuánto cuesta el lavado express?', 'El lavado express tiene un costo de $75 MXN por kilo. Tu ropa estará lista el mismo día (en 4 horas).', ARRAY['express', 'urgente', 'rapido', 'mismo dia', 'precio'], 'es', true),

('precios', '¿Cuánto cuesta lavar una cobija?', 'El lavado de cobijas y edredones tiene un costo de $80 MXN por pieza. El servicio tarda aproximadamente 48 horas.', ARRAY['cobija', 'edredon', 'cobertor', 'precio'], 'es', true),

('servicios', '¿Qué servicios ofrecen?', 'Ofrecemos los siguientes servicios:
1. Lavado por Kilo ($45/kg) - 24 hrs
2. Lavado Express ($75/kg) - mismo día
3. Lavado de Cobijas ($80/pieza) - 48 hrs
4. Planchado ($25/pieza) - 24 hrs
5. Tintorería ($120/pieza) - 72 hrs', ARRAY['servicio', 'ofrecen', 'tienen', 'hacen'], 'es', true),

('servicios', '¿Hacen planchado?', 'Sí, ofrecemos servicio de planchado profesional a $25 MXN por pieza. El tiempo de entrega es de 24 horas.', ARRAY['planchado', 'planchar', 'plancha'], 'es', true),

('servicios', '¿Tienen servicio de tintorería?', 'Sí, contamos con servicio de tintorería (limpieza en seco) para prendas delicadas a $120 MXN por pieza. Tarda aproximadamente 72 horas.', ARRAY['tintoreria', 'seco', 'delicado'], 'es', true),

('ubicacion', '¿Dónde están ubicados?', 'Tenemos 2 sucursales:
1. Centro: Calle Principal #123, Centro - Tel: 555 123 4567
2. Norte: Av. Norte #456, Colonia Norte - Tel: 555 987 6543', ARRAY['ubicacion', 'donde', 'direccion', 'sucursal'], 'es', true),

('tiempos', '¿Cuánto tardan en entregar mi ropa?', 'Los tiempos de entrega varían según el servicio:
- Lavado Regular: 24 horas
- Lavado Express: 4 horas (mismo día)
- Cobijas: 48 horas
- Planchado: 24 horas
- Tintorería: 72 horas', ARRAY['tiempo', 'tardan', 'entrega', 'listo', 'cuando'], 'es', true),

('pagos', '¿Qué formas de pago aceptan?', 'Aceptamos efectivo, tarjeta de débito/crédito y transferencia bancaria. El pago se realiza al momento de recoger tu ropa.', ARRAY['pago', 'tarjeta', 'efectivo', 'transferencia', 'pagar'], 'es', true),

('recoleccion', '¿Tienen servicio a domicilio?', 'Por el momento no contamos con servicio de recolección a domicilio. Te invitamos a visitarnos en cualquiera de nuestras 2 sucursales.', ARRAY['domicilio', 'recoger', 'casa', 'envio'], 'es', true),

('reclamos', '¿Qué hago si mi ropa tiene algún problema?', 'Si tienes algún problema con tu ropa, por favor contáctanos inmediatamente. Revisaremos tu caso y buscaremos la mejor solución. Tu satisfacción es nuestra prioridad.', ARRAY['problema', 'queja', 'reclamo', 'daño', 'mancha'], 'es', true)
ON CONFLICT DO NOTHING;

-- Sample customer for testing
INSERT INTO public.customers (phone, name, email, language, notes, total_orders, total_spent)
VALUES ('+52 555 111 2222', 'Cliente Demo', 'demo@example.com', 'es', 'Cliente de prueba', 3, 285.00)
ON CONFLICT (phone) DO NOTHING;

-- Sample conversation
INSERT INTO public.conversations (customer_id, status, ai_enabled, last_message_at)
SELECT id, 'active', true, now()
FROM public.customers WHERE phone = '+52 555 111 2222'
ON CONFLICT DO NOTHING;

-- Sample messages
INSERT INTO public.messages (conversation_id, direction, content, ai_generated)
SELECT c.id, 'inbound', 'Hola, ¿cuánto cuesta el lavado por kilo?', false
FROM public.conversations c
JOIN public.customers cu ON c.customer_id = cu.id
WHERE cu.phone = '+52 555 111 2222'
ON CONFLICT DO NOTHING;

INSERT INTO public.messages (conversation_id, direction, content, ai_generated)
SELECT c.id, 'outbound', '¡Hola! El lavado por kilo tiene un costo de $45 MXN. Incluye lavado y secado. El servicio regular tarda 24 horas. ¿Te gustaría agendar una cita?', true
FROM public.conversations c
JOIN public.customers cu ON c.customer_id = cu.id
WHERE cu.phone = '+52 555 111 2222'
ON CONFLICT DO NOTHING;

-- Sample order
INSERT INTO public.orders (customer_id, location_id, status, items, subtotal, tax, total, notes)
SELECT
  cu.id,
  l.id,
  'ready',
  '[{"service": "Lavado por Kilo", "quantity": 5, "unit_price": 45, "total": 225}]'::jsonb,
  225.00,
  36.00,
  261.00,
  'Ropa lista para recoger'
FROM public.customers cu, public.locations l
WHERE cu.phone = '+52 555 111 2222' AND l.name LIKE '%Centro%'
LIMIT 1
ON CONFLICT DO NOTHING;

-- =============================================
-- DONE! Database is ready for production
-- =============================================
SELECT 'Database setup complete!' as status;
