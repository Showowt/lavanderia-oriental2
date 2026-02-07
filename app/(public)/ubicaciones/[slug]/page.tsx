import Link from 'next/link';
import { notFound } from 'next/navigation';
import { locations, getLocationBySlug } from '@/lib/data/locations';
import { services } from '@/lib/data/services';
import { getWhatsAppLink, WHATSAPP_DISPLAY } from '@/lib/whatsapp';

export async function generateStaticParams() {
  return locations.map((location) => ({
    slug: location.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const location = getLocationBySlug(params.slug);
  if (!location) return { title: 'Ubicacion no encontrada' };

  return {
    title: `Lavandería Oriental ${location.name} | Sucursal ${location.city}`,
    description: `Lavandería Oriental en ${location.name}, ${location.city}. Dirección: ${location.address}. Horario: Lun-Sab ${location.hours.weekdays}. ${location.deliveryAvailable ? 'Delivery disponible.' : ''} Contacto por WhatsApp.`,
    openGraph: {
      title: `Lavandería Oriental ${location.name}`,
      description: `Sucursal en ${location.city}. ${location.address}. Horario: ${location.hours.weekdays}. Agenda por WhatsApp.`,
    },
  };
}

export default function LocationDetailPage({ params }: { params: { slug: string } }) {
  const location = getLocationBySlug(params.slug);

  if (!location) {
    notFound();
  }

  const whatsappMessage = `Hola! Quiero información sobre la sucursal de ${location.name} 📍`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">Inicio</Link>
            <span className="mx-2">/</span>
            <Link href="/ubicaciones" className="hover:text-blue-600">Ubicaciones</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{location.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-5xl">{location.icon}</span>
            <div>
              <p className="text-blue-200 text-sm uppercase tracking-wide">Lavanderia Oriental</p>
              <h1 className="text-3xl md:text-4xl font-bold">{location.name}</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Map Area */}
            <div>
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl h-80 flex items-center justify-center mb-4">
                <div className="text-center">
                  <span className="text-6xl block mb-4">{location.icon}</span>
                  <p className="text-gray-600">Mapa de Google Maps</p>
                </div>
              </div>
              {location.status !== 'coming_soon' && (
                <a
                  href={location.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-4 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Como Llegar (Google Maps)
                </a>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              {/* Status Badge */}
              <div>
                {location.status === 'open' ? (
                  <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 font-medium px-4 py-2 rounded-full">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Abierto ahora
                  </span>
                ) : location.status === 'coming_soon' ? (
                  <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 font-medium px-4 py-2 rounded-full">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                    Proximamente
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 bg-red-100 text-red-700 font-medium px-4 py-2 rounded-full">
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                    Cerrado
                  </span>
                )}
              </div>

              {/* Address */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Direccion
                </h2>
                <p className="text-gray-700">
                  {location.address}
                  {location.addressLine2 && <><br />{location.addressLine2}</>}
                  <br />{location.city}, El Salvador
                </p>
              </div>

              {/* Hours */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Horario
                </h2>
                {location.status === 'coming_soon' ? (
                  <p className="text-gray-500">Horario proximamente</p>
                ) : (
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>Lunes - Viernes</span>
                      <span className="font-medium">{location.hours.weekdays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sabado</span>
                      <span className="font-medium">{location.hours.saturday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingo</span>
                      <span className="font-medium text-red-600">{location.hours.sunday}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Contacto
                </h2>
                <p className="text-gray-700 mb-4">WhatsApp: {WHATSAPP_DISPLAY}</p>
                <a
                  href={getWhatsAppLink(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-4 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                  Contactar por WhatsApp
                </a>
              </div>

              {/* Delivery */}
              {location.deliveryAvailable && (
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🚚</span>
                    <div>
                      <h3 className="font-bold text-blue-900">Delivery Disponible</h3>
                      <p className="text-blue-700 text-sm">Recogemos y entregamos en esta zona</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Services Available */}
      {location.status !== 'coming_soon' && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              Servicios Disponibles en esta Sucursal
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {services.map((service) => (
                <Link
                  key={service.id}
                  href={`/servicios/${service.slug}`}
                  className="inline-flex items-center gap-2 bg-green-100 text-green-700 font-medium px-4 py-2 rounded-full hover:bg-green-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {service.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other Locations */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Otras Sucursales
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            {locations.filter(l => l.id !== location.id).map((loc) => (
              <Link
                key={loc.id}
                href={`/ubicaciones/${loc.slug}`}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center"
              >
                <span className="text-3xl block mb-2">{loc.icon}</span>
                <span className="font-medium text-gray-900">{loc.name}</span>
                {loc.status === 'coming_soon' && (
                  <span className="block text-xs text-yellow-600 mt-1">Proximamente</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
