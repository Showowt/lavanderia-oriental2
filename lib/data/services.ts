export interface Service {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  pricing: {
    basePrice: number;
    unit: 'lb' | 'piece' | 'item' | 'min' | 'flat';
    unitLabel: string;
    variations?: {
      name: string;
      price: number;
    }[];
  };
  turnaroundTime: string;
  includes: string[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const services: Service[] = [
  {
    id: 'lavado',
    slug: 'lavado',
    name: 'Lavado por Libra',
    shortDescription: 'Lavado profesional con detergente premium y suavizante.',
    fullDescription: 'Servicio completo de lavado profesional. Separamos tu ropa por colores, usamos detergente premium y suavizante de alta calidad. Incluye secado y doblado.',
    icon: '🧺',
    pricing: {
      basePrice: 3.25,
      unit: 'lb',
      unitLabel: 'por libra',
    },
    turnaroundTime: 'Mismo día (si entregas antes de 12pm)',
    includes: [
      'Separación por colores',
      'Detergente premium',
      'Suavizante de telas',
      'Secado completo',
      'Doblado',
    ],
    faqs: [
      {
        question: '¿Hay mínimo de libras?',
        answer: 'No hay mínimo para servicio en sucursal. Para delivery el mínimo es $10 en servicios.',
      },
      {
        question: '¿Puedo traer ropa delicada?',
        answer: 'Sí, separamos las prendas delicadas y las lavamos con cuidado especial.',
      },
    ],
  },
  {
    id: 'secado',
    slug: 'secado',
    name: 'Secado',
    shortDescription: 'Secadoras industriales de alta capacidad.',
    fullDescription: 'Secado rápido y eficiente en nuestras secadoras industriales. Perfecto para todo tipo de prendas.',
    icon: '🌀',
    pricing: {
      basePrice: 1.00,
      unit: 'min',
      unitLabel: 'por 10 minutos',
    },
    turnaroundTime: '30-60 minutos',
    includes: [
      'Secado en secadora industrial',
      'Control de temperatura',
      'Supervisión del proceso',
    ],
    faqs: [
      {
        question: '¿Cuánto tiempo toma secar mi ropa?',
        answer: 'Depende del tipo de ropa y cantidad. En promedio, 30-40 minutos.',
      },
    ],
  },
  {
    id: 'edredones',
    slug: 'edredones',
    name: 'Edredones y Cobertores',
    shortDescription: 'Lavado especializado para ropa de cama.',
    fullDescription: 'Servicio especializado para edredones, cobertores, almohadas y sábanas. Perfecto para hogares, AirBnB, hoteles y hospedajes.',
    icon: '🛏️',
    pricing: {
      basePrice: 6.50,
      unit: 'item',
      unitLabel: 'desde',
      variations: [
        { name: 'Edredón Individual (Twin)', price: 6.50 },
        { name: 'Edredón Matrimonial (Full/Queen)', price: 8.00 },
        { name: 'Edredón King Size', price: 10.00 },
        { name: 'Edredón California King', price: 12.00 },
        { name: 'Cobertores/Mantas', price: 5.00 },
        { name: 'Almohadas (c/u)', price: 3.00 },
        { name: 'Sábanas (juego completo)', price: 4.00 },
      ],
    },
    turnaroundTime: '24-48 horas',
    includes: [
      'Detergente premium hipoalergénico',
      'Suavizante de telas',
      'Secado completo en secadoras industriales',
      'Doblado y empaque',
    ],
    faqs: [
      {
        question: '¿Puedo llevar edredones muy grandes?',
        answer: 'Sí, nuestras lavadoras industriales tienen capacidad para edredones de cualquier tamaño, incluyendo California King.',
      },
      {
        question: '¿Qué pasa si mi edredón tiene manchas?',
        answer: 'Tratamos las manchas sin costo adicional. Si requiere tratamiento especial, te avisamos antes de proceder.',
      },
      {
        question: '¿Tienen servicio de delivery para edredones?',
        answer: 'Sí, recogemos y entregamos. El costo de delivery es $2.00.',
      },
    ],
  },
  {
    id: 'planchado',
    slug: 'planchado',
    name: 'Planchado',
    shortDescription: 'Planchado profesional para camisas, pantalones y más.',
    fullDescription: 'Servicio de planchado profesional. Dejamos tus prendas impecables y listas para usar.',
    icon: '👔',
    pricing: {
      basePrice: 1.50,
      unit: 'piece',
      unitLabel: 'por pieza',
    },
    turnaroundTime: '24 horas',
    includes: [
      'Planchado profesional',
      'Colgado en gancho',
      'Empaque protector',
    ],
    faqs: [
      {
        question: '¿Qué tipo de prendas planchan?',
        answer: 'Camisas, pantalones, blusas, faldas, vestidos y más. Consulta por prendas especiales.',
      },
    ],
  },
  {
    id: 'tratamientos',
    slug: 'tratamientos',
    name: 'Tratamientos Especiales',
    shortDescription: 'Manchas difíciles, blanqueado, prendas delicadas.',
    fullDescription: 'Servicios especializados para manchas difíciles, blanqueado de prendas y cuidado de telas delicadas.',
    icon: '✨',
    pricing: {
      basePrice: 5.00,
      unit: 'item',
      unitLabel: 'desde',
    },
    turnaroundTime: '24-48 horas',
    includes: [
      'Evaluación de la prenda',
      'Tratamiento especializado',
      'Productos de alta calidad',
    ],
    faqs: [
      {
        question: '¿Pueden quitar cualquier mancha?',
        answer: 'Hacemos nuestro mejor esfuerzo. Algunas manchas antiguas o de tintes pueden ser difíciles. Siempre te avisamos antes de proceder.',
      },
    ],
  },
  {
    id: 'delivery',
    slug: 'delivery',
    name: 'Delivery',
    shortDescription: 'Recogemos y entregamos tu ropa donde estés.',
    fullDescription: 'Servicio de recogida y entrega a domicilio. Agenda por WhatsApp y nosotros hacemos el resto.',
    icon: '🚚',
    pricing: {
      basePrice: 2.00,
      unit: 'flat',
      unitLabel: 'por viaje',
    },
    turnaroundTime: 'Según disponibilidad',
    includes: [
      'Recogida a domicilio',
      'Entrega a domicilio',
      'Coordinación por WhatsApp',
    ],
    faqs: [
      {
        question: '¿Cuáles zonas cubren?',
        answer: 'Cada sucursal tiene su zona de cobertura. Contáctanos por WhatsApp para confirmar si llegamos a tu dirección.',
      },
      {
        question: '¿Hay mínimo para delivery?',
        answer: 'Sí, el mínimo es $10 en servicios para solicitar delivery.',
      },
    ],
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
