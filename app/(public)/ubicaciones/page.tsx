import Link from 'next/link';
import { locations } from '@/lib/data/locations';
import { whatsappLinks } from '@/lib/whatsapp';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sucursales y Ubicaciones | 5 Locales en El Salvador',
  description: 'Encuentra tu Lavandería Oriental más cercana: San Miguel, Usulután, Lourdes Colón, Santa Ana y La Unión. Horarios, direcciones y delivery disponible.',
  openGraph: {
    title: 'Sucursales Lavandería Oriental | El Salvador',
    description: '5 ubicaciones estratégicas en El Salvador. Horario Lun-Sab 7am-6pm. Delivery disponible en todas las zonas.',
  },
};

export default function UbicacionesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nuestras Sucursales</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            5 ubicaciones en El Salvador para servirte mejor
          </p>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Map placeholder / Image area */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <span className="text-6xl">{location.icon}</span>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">{location.name}</h2>
                    {location.status === 'open' ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        Abierto
                      </span>
                    ) : location.status === 'coming_soon' ? (
                      <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-sm font-medium px-3 py-1 rounded-full">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                        Pronto
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="text-gray-600">
                        {location.address}
                        {location.addressLine2 && <><br />{location.addressLine2}</>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">
                        {location.status === 'coming_soon' ? 'Proximamente' : `Lun-Sab ${location.hours.weekdays}`}
                      </span>
                    </div>

                    {location.deliveryAvailable && (
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">🚚</span>
                        <span className="text-gray-600">Delivery disponible</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {location.status !== 'coming_soon' ? (
                      <>
                        <a
                          href={location.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-3 rounded-xl transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          Como Llegar
                        </a>
                        <Link
                          href={`/ubicaciones/${location.slug}`}
                          className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-xl transition-colors"
                        >
                          Ver Detalles
                        </Link>
                      </>
                    ) : (
                      <Link
                        href={`/ubicaciones/${location.slug}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-3 rounded-xl transition-colors"
                      >
                        Mas Informacion
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ¿No estas cerca de una sucursal?
          </h2>
          <p className="text-green-100 mb-8">
            Pregunta por nuestro servicio de delivery
          </p>
          <a
            href={whatsappLinks.delivery}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-green-600 font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-xl"
          >
            🚚 Agendar Delivery
          </a>
        </div>
      </section>
    </div>
  );
}
