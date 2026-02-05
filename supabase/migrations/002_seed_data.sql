-- Lavandería Oriental - Seed Data
-- Run this after the schema migration

-- ============================================
-- LOCATIONS (2 branches)
-- ============================================
INSERT INTO public.locations (name, address, phone, hours, is_active) VALUES
(
  'Lavandería Oriental - Centro',
  'Calle Principal #123, Centro, Ciudad',
  '+52 555 123 4567',
  '{
    "monday": {"open": "08:00", "close": "20:00"},
    "tuesday": {"open": "08:00", "close": "20:00"},
    "wednesday": {"open": "08:00", "close": "20:00"},
    "thursday": {"open": "08:00", "close": "20:00"},
    "friday": {"open": "08:00", "close": "20:00"},
    "saturday": {"open": "09:00", "close": "18:00"},
    "sunday": {"open": "10:00", "close": "14:00"}
  }'::jsonb,
  true
),
(
  'Lavandería Oriental - Norte',
  'Av. Norte #456, Colonia Norte, Ciudad',
  '+52 555 987 6543',
  '{
    "monday": {"open": "07:00", "close": "21:00"},
    "tuesday": {"open": "07:00", "close": "21:00"},
    "wednesday": {"open": "07:00", "close": "21:00"},
    "thursday": {"open": "07:00", "close": "21:00"},
    "friday": {"open": "07:00", "close": "21:00"},
    "saturday": {"open": "08:00", "close": "19:00"},
    "sunday": {"closed": true}
  }'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- ============================================
-- SERVICE CATEGORIES (2 categories)
-- ============================================
INSERT INTO public.service_categories (name, description, display_order, is_active) VALUES
('Lavado Regular', 'Servicios de lavado y secado estándar', 1, true),
('Servicios Especiales', 'Planchado, tintorería y tratamientos especiales', 2, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- SERVICES (5 services)
-- ============================================
-- First, get the category IDs
WITH categories AS (
  SELECT id, name FROM public.service_categories
)
INSERT INTO public.services (category_id, name, description, price, unit, estimated_hours, is_active)
SELECT
  c.id,
  s.name,
  s.description,
  s.price,
  s.unit,
  s.estimated_hours,
  s.is_active
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

-- ============================================
-- KNOWLEDGE BASE (10+ FAQs)
-- ============================================
INSERT INTO public.knowledge_base (category, question, answer, keywords, language, is_active) VALUES
-- Horarios
('horarios', '¿Cuál es su horario de atención?',
'Nuestros horarios son:
- Centro: Lunes a Viernes 8am-8pm, Sábados 9am-6pm, Domingos 10am-2pm
- Norte: Lunes a Viernes 7am-9pm, Sábados 8am-7pm, Domingos cerrado',
ARRAY['horario', 'hora', 'abierto', 'cerrado', 'atienden'], 'es', true),

-- Precios
('precios', '¿Cuánto cuesta el lavado por kilo?',
'El lavado por kilo tiene un costo de $45 MXN. Incluye lavado y secado. El servicio regular tarda 24 horas.',
ARRAY['precio', 'costo', 'kilo', 'cuanto', 'cobra'], 'es', true),

('precios', '¿Cuánto cuesta el lavado express?',
'El lavado express tiene un costo de $75 MXN por kilo. Tu ropa estará lista el mismo día (en 4 horas).',
ARRAY['express', 'urgente', 'rapido', 'mismo dia', 'precio'], 'es', true),

('precios', '¿Cuánto cuesta lavar una cobija?',
'El lavado de cobijas y edredones tiene un costo de $80 MXN por pieza. El servicio tarda aproximadamente 48 horas.',
ARRAY['cobija', 'edredon', 'cobertor', 'precio'], 'es', true),

-- Servicios
('servicios', '¿Qué servicios ofrecen?',
'Ofrecemos los siguientes servicios:
1. Lavado por Kilo ($45/kg) - 24 hrs
2. Lavado Express ($75/kg) - mismo día
3. Lavado de Cobijas ($80/pieza) - 48 hrs
4. Planchado ($25/pieza) - 24 hrs
5. Tintorería ($120/pieza) - 72 hrs',
ARRAY['servicio', 'ofrecen', 'tienen', 'hacen'], 'es', true),

('servicios', '¿Hacen planchado?',
'Sí, ofrecemos servicio de planchado profesional a $25 MXN por pieza. El tiempo de entrega es de 24 horas.',
ARRAY['planchado', 'planchar', 'plancha'], 'es', true),

('servicios', '¿Tienen servicio de tintorería?',
'Sí, contamos con servicio de tintorería (limpieza en seco) para prendas delicadas a $120 MXN por pieza. Tarda aproximadamente 72 horas.',
ARRAY['tintoreria', 'seco', 'delicado'], 'es', true),

-- Ubicación
('ubicacion', '¿Dónde están ubicados?',
'Tenemos 2 sucursales:
1. Centro: Calle Principal #123, Centro - Tel: 555 123 4567
2. Norte: Av. Norte #456, Colonia Norte - Tel: 555 987 6543',
ARRAY['ubicacion', 'donde', 'direccion', 'sucursal'], 'es', true),

-- Tiempos de entrega
('tiempos', '¿Cuánto tardan en entregar mi ropa?',
'Los tiempos de entrega varían según el servicio:
- Lavado Regular: 24 horas
- Lavado Express: 4 horas (mismo día)
- Cobijas: 48 horas
- Planchado: 24 horas
- Tintorería: 72 horas',
ARRAY['tiempo', 'tardan', 'entrega', 'listo', 'cuando'], 'es', true),

-- Pagos
('pagos', '¿Qué formas de pago aceptan?',
'Aceptamos efectivo, tarjeta de débito/crédito y transferencia bancaria. El pago se realiza al momento de recoger tu ropa.',
ARRAY['pago', 'tarjeta', 'efectivo', 'transferencia', 'pagar'], 'es', true),

-- Recolección
('recoleccion', '¿Tienen servicio a domicilio?',
'Por el momento no contamos con servicio de recolección a domicilio. Te invitamos a visitarnos en cualquiera de nuestras 2 sucursales.',
ARRAY['domicilio', 'recoger', 'casa', 'envio'], 'es', true),

-- Reclamos
('reclamos', '¿Qué hago si mi ropa tiene algún problema?',
'Si tienes algún problema con tu ropa, por favor contáctanos inmediatamente. Revisaremos tu caso y buscaremos la mejor solución. Tu satisfacción es nuestra prioridad.',
ARRAY['problema', 'queja', 'reclamo', 'daño', 'mancha'], 'es', true)

ON CONFLICT DO NOTHING;
