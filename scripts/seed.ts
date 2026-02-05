import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('Seeding database...');

  // Seed Locations
  const { error: locationsError } = await supabase.from('locations').upsert([
    {
      id: 'loc-centro',
      name: 'Sucursal Centro',
      address: 'Av. Principal #123, Centro',
      phone: '+52 55 1234 5678',
      hours: {
        mon: '8:00-20:00',
        tue: '8:00-20:00',
        wed: '8:00-20:00',
        thu: '8:00-20:00',
        fri: '8:00-20:00',
        sat: '9:00-18:00',
        sun: 'Cerrado',
      },
      is_active: true,
    },
    {
      id: 'loc-norte',
      name: 'Sucursal Norte',
      address: 'Blvd. Norte #456, Col. Industrial',
      phone: '+52 55 8765 4321',
      hours: {
        mon: '7:00-21:00',
        tue: '7:00-21:00',
        wed: '7:00-21:00',
        thu: '7:00-21:00',
        fri: '7:00-21:00',
        sat: '8:00-20:00',
        sun: '9:00-14:00',
      },
      is_active: true,
    },
  ], { onConflict: 'id' });

  if (locationsError) {
    console.error('Error seeding locations:', locationsError);
  } else {
    console.log('✓ Locations seeded');
  }

  // Seed Service Categories
  const { error: categoriesError } = await supabase.from('service_categories').upsert([
    { id: 'cat-lavado', name: 'Lavado', description: 'Servicios de lavado de ropa', display_order: 1 },
    { id: 'cat-planchado', name: 'Planchado', description: 'Servicios de planchado', display_order: 2 },
    { id: 'cat-tintoreria', name: 'Tintorería', description: 'Servicios de tintorería y limpieza en seco', display_order: 3 },
    { id: 'cat-especial', name: 'Servicios Especiales', description: 'Edredones, cortinas y artículos especiales', display_order: 4 },
  ], { onConflict: 'id' });

  if (categoriesError) {
    console.error('Error seeding categories:', categoriesError);
  } else {
    console.log('✓ Service categories seeded');
  }

  // Seed Services
  const { error: servicesError } = await supabase.from('services').upsert([
    { id: 'srv-lavado-kg', category_id: 'cat-lavado', name: 'Lavado por Kilo', description: 'Lavado y secado de ropa común', price: 25.00, unit: 'kg', estimated_time: '24 horas', is_active: true },
    { id: 'srv-lavado-express', category_id: 'cat-lavado', name: 'Lavado Express', description: 'Lavado y secado urgente', price: 45.00, unit: 'kg', estimated_time: '4 horas', is_active: true },
    { id: 'srv-planchado-camisa', category_id: 'cat-planchado', name: 'Planchado Camisa', description: 'Planchado profesional de camisas', price: 35.00, unit: 'pieza', estimated_time: '24 horas', is_active: true },
    { id: 'srv-planchado-pantalon', category_id: 'cat-planchado', name: 'Planchado Pantalón', description: 'Planchado de pantalones', price: 30.00, unit: 'pieza', estimated_time: '24 horas', is_active: true },
    { id: 'srv-traje', category_id: 'cat-tintoreria', name: 'Traje Completo', description: 'Limpieza en seco de traje (saco + pantalón)', price: 180.00, unit: 'pieza', estimated_time: '48 horas', is_active: true },
    { id: 'srv-vestido', category_id: 'cat-tintoreria', name: 'Vestido', description: 'Limpieza en seco de vestido', price: 120.00, unit: 'pieza', estimated_time: '48 horas', is_active: true },
    { id: 'srv-abrigo', category_id: 'cat-tintoreria', name: 'Abrigo/Chamarra', description: 'Limpieza de abrigos y chamarras', price: 150.00, unit: 'pieza', estimated_time: '72 horas', is_active: true },
    { id: 'srv-edredon-ind', category_id: 'cat-especial', name: 'Edredón Individual', description: 'Lavado de edredón tamaño individual', price: 180.00, unit: 'pieza', estimated_time: '48 horas', is_active: true },
    { id: 'srv-edredon-mat', category_id: 'cat-especial', name: 'Edredón Matrimonial', description: 'Lavado de edredón tamaño matrimonial', price: 220.00, unit: 'pieza', estimated_time: '48 horas', is_active: true },
    { id: 'srv-cortinas', category_id: 'cat-especial', name: 'Cortinas (por metro)', description: 'Lavado de cortinas', price: 45.00, unit: 'metro', estimated_time: '72 horas', is_active: true },
  ], { onConflict: 'id' });

  if (servicesError) {
    console.error('Error seeding services:', servicesError);
  } else {
    console.log('✓ Services seeded');
  }

  // Seed Knowledge Base
  const { error: knowledgeError } = await supabase.from('knowledge_base').upsert([
    { id: 'kb-horario-1', category: 'horarios', question: '¿Cuál es el horario de atención?', answer: 'Nuestro horario es de Lunes a Viernes de 8:00 a 20:00, Sábados de 9:00 a 18:00. Los domingos la sucursal Norte abre de 9:00 a 14:00.', language: 'es', is_active: true },
    { id: 'kb-horario-2', category: 'horarios', question: '¿Abren los domingos?', answer: 'Nuestra sucursal Norte abre los domingos de 9:00 a 14:00. La sucursal Centro permanece cerrada los domingos.', language: 'es', is_active: true },
    { id: 'kb-precio-1', category: 'precios', question: '¿Cuánto cuesta el lavado por kilo?', answer: 'El lavado por kilo tiene un costo de $25 MXN con entrega en 24 horas. También tenemos servicio express a $45 MXN con entrega en 4 horas.', language: 'es', is_active: true },
    { id: 'kb-precio-2', category: 'precios', question: '¿Cuánto cuesta lavar un edredón?', answer: 'El lavado de edredón individual cuesta $180 MXN y el matrimonial $220 MXN, con entrega en 48 horas.', language: 'es', is_active: true },
    { id: 'kb-precio-3', category: 'precios', question: '¿Cuánto cuesta la tintorería de un traje?', answer: 'La limpieza en seco de un traje completo (saco y pantalón) tiene un costo de $180 MXN con entrega en 48 horas.', language: 'es', is_active: true },
    { id: 'kb-servicio-1', category: 'servicios', question: '¿Qué servicios ofrecen?', answer: 'Ofrecemos: lavado por kilo (normal y express), planchado de camisas y pantalones, tintorería (trajes, vestidos, abrigos), y servicios especiales (edredones, cortinas). ¡Consulta precios específicos!', language: 'es', is_active: true },
    { id: 'kb-servicio-2', category: 'servicios', question: '¿Tienen servicio express?', answer: 'Sí, tenemos lavado express con entrega en 4 horas a $45 MXN por kilo. Ideal para urgencias.', language: 'es', is_active: true },
    { id: 'kb-ubicacion-1', category: 'ubicacion', question: '¿Dónde están ubicados?', answer: 'Tenemos dos sucursales: Centro en Av. Principal #123 y Norte en Blvd. Norte #456, Col. Industrial.', language: 'es', is_active: true },
    { id: 'kb-entrega-1', category: 'entrega', question: '¿Cuánto tardan en entregar?', answer: 'Los tiempos varían: lavado normal 24 horas, express 4 horas, tintorería 48-72 horas, edredones 48 horas.', language: 'es', is_active: true },
    { id: 'kb-pago-1', category: 'pago', question: '¿Qué formas de pago aceptan?', answer: 'Aceptamos efectivo, tarjetas de crédito/débito y transferencias bancarias.', language: 'es', is_active: true },
    { id: 'kb-pago-2', category: 'pago', question: '¿Puedo pagar al recoger?', answer: 'Sí, puede pagar al momento de recoger su ropa. También aceptamos pago anticipado.', language: 'es', is_active: true },
    { id: 'kb-general-1', category: 'general', question: '¿Cómo puedo hacer un pedido?', answer: 'Puede hacer su pedido por WhatsApp enviando qué prendas necesita lavar, o visitando cualquiera de nuestras sucursales.', language: 'es', is_active: true },
  ], { onConflict: 'id' });

  if (knowledgeError) {
    console.error('Error seeding knowledge base:', knowledgeError);
  } else {
    console.log('✓ Knowledge base seeded');
  }

  console.log('Seeding complete!');
}

seed().catch(console.error);
