import Link from 'next/link';
import { services } from '@/lib/data/services';
import { whatsappLinks } from '@/lib/whatsapp';

export const metadata = {
  title: 'Servicios | Lavanderia Oriental',
  description: 'Servicios de lavanderia profesional en El Salvador. Lavado por libra, secado, edredones, planchado y delivery.',
};

export default function ServiciosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nuestros Servicios</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Precios transparentes, calidad garantizada
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-6 max-w-4xl mx-auto">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  {/* Icon & Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="text-4xl">{service.icon}</span>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{service.name}</h2>
                        <p className="text-gray-600 mt-1">{service.shortDescription}</p>
                      </div>
                    </div>

                    {/* Price variations if any */}
                    {service.pricing.variations ? (
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <table className="w-full text-sm">
                          <tbody>
                            {service.pricing.variations.map((v, i) => (
                              <tr key={i} className="border-b last:border-0 border-gray-200">
                                <td className="py-2 text-gray-700">{v.name}</td>
                                <td className="py-2 text-right font-semibold text-gray-900">${v.price.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}

                    {/* Includes */}
                    <div className="flex flex-wrap gap-2">
                      {service.includes.slice(0, 3).map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="md:text-right">
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-blue-600">
                        ${service.pricing.basePrice.toFixed(2)}
                      </span>
                      <span className="text-gray-500 ml-1">{service.pricing.unitLabel}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/servicios/${service.slug}`}
                        className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2 rounded-lg transition-colors"
                      >
                        Ver Detalles
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                      <a
                        href={whatsappLinks.quote}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        </svg>
                        Cotizar
                      </a>
                    </div>
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
            ¿Tienes preguntas sobre nuestros servicios?
          </h2>
          <p className="text-green-100 mb-8">
            Escribenos por WhatsApp y te ayudamos al instante
          </p>
          <a
            href={whatsappLinks.general}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-green-600 font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-xl"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
