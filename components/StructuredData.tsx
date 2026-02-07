import { locations } from '@/lib/data/locations';

export function LocalBusinessSchema() {
  const mainLocation = locations[0]; // San Miguel as main

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://lavanderia-oriental2.vercel.app',
    name: 'Lavandería Oriental',
    description: 'Servicio profesional de lavandería en El Salvador. 5 sucursales, delivery disponible, precios desde $3.25/libra.',
    url: 'https://lavanderia-oriental2.vercel.app',
    telephone: '+503 7947-5950',
    email: 'info@lavanderiaoriental.com',
    image: 'https://lavanderia-oriental2.vercel.app/logo.png',
    priceRange: '$$',
    currenciesAccepted: 'USD',
    paymentAccepted: 'Cash, Credit Card',
    address: {
      '@type': 'PostalAddress',
      streetAddress: mainLocation.address,
      addressLocality: mainLocation.city,
      addressCountry: 'SV',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: mainLocation.coordinates.lat,
      longitude: mainLocation.coordinates.lng,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '07:00',
        closes: '18:00',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '150',
    },
    sameAs: [
      'https://www.facebook.com/lavanderiaoriental',
      'https://www.instagram.com/lavanderiaoriental',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicios de Lavandería',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Lavado por Libra',
            description: 'Lavado profesional con detergente premium y suavizante',
          },
          price: '3.25',
          priceCurrency: 'USD',
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Edredones y Cobertores',
            description: 'Lavado especializado para ropa de cama',
          },
          price: '6.50',
          priceCurrency: 'USD',
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Delivery',
            description: 'Recogemos y entregamos tu ropa a domicilio',
          },
          price: '2.00',
          priceCurrency: 'USD',
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
