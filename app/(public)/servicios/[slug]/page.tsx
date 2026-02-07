import Link from 'next/link';
import { notFound } from 'next/navigation';
import { services, getServiceBySlug } from '@/lib/data/services';
import { whatsappLinks, getWhatsAppLink } from '@/lib/whatsapp';

export async function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug);
  if (!service) return { title: 'Servicio no encontrado' };

  return {
    title: `${service.name} | Precio $${service.pricing.basePrice.toFixed(2)} ${service.pricing.unitLabel}`,
    description: `${service.fullDescription} Precio: $${service.pricing.basePrice.toFixed(2)} ${service.pricing.unitLabel}. Tiempo de entrega: ${service.turnaroundTime}. Agenda por WhatsApp.`,
    openGraph: {
      title: `${service.name} - Lavandería Oriental`,
      description: `${service.shortDescription} Desde $${service.pricing.basePrice.toFixed(2)} ${service.pricing.unitLabel}.`,
    },
  };
}

export default function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const service = getServiceBySlug(params.slug);

  if (!service) {
    notFound();
  }

  const whatsappMessage = `Hola! Quiero información sobre ${service.name} ${service.icon}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">Inicio</Link>
            <span className="mx-2">/</span>
            <Link href="/servicios" className="hover:text-blue-600">Servicios</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{service.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-cyan-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{service.icon}</span>
            <h1 className="text-3xl md:text-4xl font-bold">{service.name}</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-2xl">{service.fullDescription}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Pricing Table */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Precios</h2>
                {service.pricing.variations ? (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-gray-600 font-medium">Tipo</th>
                        <th className="text-right py-3 text-gray-600 font-medium">Precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {service.pricing.variations.map((v, i) => (
                        <tr key={i} className="border-b last:border-0 border-gray-100">
                          <td className="py-3 text-gray-700">{v.name}</td>
                          <td className="py-3 text-right font-semibold text-gray-900">${v.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-blue-600">${service.pricing.basePrice.toFixed(2)}</span>
                    <span className="text-gray-500">{service.pricing.unitLabel}</span>
                  </div>
                )}
              </div>

              {/* Includes */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Incluye</h2>
                <ul className="space-y-3">
                  {service.includes.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Turnaround */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tiempo de Entrega</h2>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⏱️</span>
                  <span className="text-lg text-gray-700">{service.turnaroundTime}</span>
                </div>
              </div>

              {/* Business CTA for edredones */}
              {service.slug === 'edredones' && (
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                  <h2 className="text-xl font-bold mb-2">💼 ¿Negocio de Hospedaje?</h2>
                  <p className="text-blue-100 mb-4">
                    Ofrecemos precios especiales para AirBnB, hoteles y hospedajes con servicio recurrente. Contactanos para una cotizacion personalizada.
                  </p>
                  <a
                    href={whatsappLinks.businessQuote}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg transition-all hover:shadow-lg"
                  >
                    Cotizacion para Negocios
                  </a>
                </div>
              )}

              {/* FAQ */}
              {service.faqs.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h2>
                  <div className="space-y-4">
                    {service.faqs.map((faq, i) => (
                      <details key={i} className="group">
                        <summary className="flex items-center justify-between cursor-pointer list-none py-3 border-b border-gray-100">
                          <span className="font-medium text-gray-900">{faq.question}</span>
                          <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <p className="py-3 text-gray-600">{faq.answer}</p>
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* CTA Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">¿Listo para ordenar?</h3>
                <a
                  href={getWhatsAppLink(whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-4 rounded-xl text-lg transition-all"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                  Agendar por WhatsApp
                </a>
                <p className="text-gray-500 text-sm text-center mt-3">
                  Respuesta inmediata
                </p>
              </div>

              {/* Other Services */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Otros Servicios</h3>
                <div className="space-y-3">
                  {services.filter(s => s.id !== service.id).slice(0, 4).map((s) => (
                    <Link
                      key={s.id}
                      href={`/servicios/${s.slug}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl">{s.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{s.name}</div>
                        <div className="text-sm text-gray-500">${s.pricing.basePrice.toFixed(2)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
