export interface Location {
  id: string;
  slug: string;
  name: string;
  city: string;
  address: string;
  addressLine2?: string;
  phone: string;
  whatsapp: string;
  googleMapsUrl: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  status: 'open' | 'closed' | 'coming_soon';
  deliveryAvailable: boolean;
  icon: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const locations: Location[] = [
  {
    id: 'san-miguel',
    slug: 'san-miguel',
    name: 'San Miguel',
    city: 'San Miguel',
    address: 'Col. Ciudad Real C. Elizabeth Lote #2',
    phone: '+503 7947-5950',
    whatsapp: '50379475950',
    googleMapsUrl: 'https://maps.google.com/?q=San+Miguel+El+Salvador',
    hours: {
      weekdays: '7:00am - 6:00pm',
      saturday: '7:00am - 6:00pm',
      sunday: 'Cerrado',
    },
    status: 'open',
    deliveryAvailable: true,
    icon: '🏙️',
    coordinates: { lat: 13.4833, lng: -88.1833 },
  },
  {
    id: 'usulutan',
    slug: 'usulutan',
    name: 'Usulután',
    city: 'Usulután',
    address: 'Calle Dr. Federico Penado',
    addressLine2: 'Parada los Pinos',
    phone: '+503 7947-5950',
    whatsapp: '50379475950',
    googleMapsUrl: 'https://maps.google.com/?q=Usulutan+El+Salvador',
    hours: {
      weekdays: '7:00am - 6:00pm',
      saturday: '7:00am - 6:00pm',
      sunday: 'Cerrado',
    },
    status: 'open',
    deliveryAvailable: true,
    icon: '🌿',
    coordinates: { lat: 13.35, lng: -88.45 },
  },
  {
    id: 'lourdes-colon',
    slug: 'lourdes-colon',
    name: 'Lourdes Colón',
    city: 'La Libertad',
    address: '7a Calle Oriente',
    addressLine2: 'Atrás de Metrocentro',
    phone: '+503 7947-5950',
    whatsapp: '50379475950',
    googleMapsUrl: 'https://maps.google.com/?q=Lourdes+Colon+El+Salvador',
    hours: {
      weekdays: '7:00am - 6:00pm',
      saturday: '7:00am - 6:00pm',
      sunday: 'Cerrado',
    },
    status: 'open',
    deliveryAvailable: true,
    icon: '🏛️',
    coordinates: { lat: 13.6833, lng: -89.2833 },
  },
  {
    id: 'santa-ana',
    slug: 'santa-ana',
    name: 'Santa Ana',
    city: 'Santa Ana',
    address: '25a calle pte Plaza Lily',
    addressLine2: 'Antes de PNC',
    phone: '+503 7947-5950',
    whatsapp: '50379475950',
    googleMapsUrl: 'https://maps.google.com/?q=Santa+Ana+El+Salvador',
    hours: {
      weekdays: '7:00am - 6:00pm',
      saturday: '7:00am - 6:00pm',
      sunday: 'Cerrado',
    },
    status: 'open',
    deliveryAvailable: true,
    icon: '⛰️',
    coordinates: { lat: 13.9942, lng: -89.5597 },
  },
  {
    id: 'la-union',
    slug: 'la-union',
    name: 'La Unión',
    city: 'La Unión',
    address: 'Próximamente',
    phone: '+503 7947-5950',
    whatsapp: '50379475950',
    googleMapsUrl: 'https://maps.google.com/?q=La+Union+El+Salvador',
    hours: {
      weekdays: 'Próximamente',
      saturday: 'Próximamente',
      sunday: 'Próximamente',
    },
    status: 'coming_soon',
    deliveryAvailable: false,
    icon: '🌊',
    coordinates: { lat: 13.3333, lng: -87.8333 },
  },
];

export function getLocationBySlug(slug: string): Location | undefined {
  return locations.find((loc) => loc.slug === slug);
}
