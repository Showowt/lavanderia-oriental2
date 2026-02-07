import { whatsappLinks } from '@/lib/whatsapp';

export function SofiaShowcase() {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Chat Preview */}
          <div className="order-2 md:order-1">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden max-w-sm mx-auto">
              {/* Chat Header */}
              <div className="bg-green-600 text-white px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-lg">S</span>
                </div>
                <div>
                  <div className="font-semibold">Sofia - Lavanderia Oriental</div>
                  <div className="text-xs text-green-100">En linea</div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-4 space-y-3 bg-gray-50 min-h-[280px]">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-green-100 text-gray-800 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                    <p className="text-sm">Hola! Cuanto cuesta lavar 10 libras?</p>
                    <span className="text-xs text-gray-500">10:30 AM</span>
                  </div>
                </div>

                {/* Sofia response */}
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] shadow-sm">
                    <p className="text-sm">Hola! Soy Sofia, tu asistente. El lavado por libra cuesta $3.25, asi que 10 libras serian $32.50. Incluye lavado, secado y doblado.</p>
                    <span className="text-xs text-gray-500">10:30 AM</span>
                  </div>
                </div>

                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-green-100 text-gray-800 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                    <p className="text-sm">Tienen delivery?</p>
                    <span className="text-xs text-gray-500">10:31 AM</span>
                  </div>
                </div>

                {/* Sofia response */}
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] shadow-sm">
                    <p className="text-sm">Si! Tenemos delivery por $2. Puedo agendar recogida para hoy?</p>
                    <span className="text-xs text-gray-500">10:31 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 md:order-2">
            <span className="inline-block bg-purple-100 text-purple-700 text-sm font-semibold px-4 py-1 rounded-full mb-4">
              Atencion Inteligente
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Conoce a Sofia,
              <br />
              <span className="text-purple-600">Tu Asistente por WhatsApp</span>
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Sofia responde tus dudas al instante, te da cotizaciones y agenda tu servicio en segundos. Disponible 24/7.
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <strong className="text-gray-900">Respuesta Inmediata</strong>
                  <p className="text-gray-600 text-sm">Sin esperas. Sofia responde en segundos a cualquier hora.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <strong className="text-gray-900">Cotizaciones al Instante</strong>
                  <p className="text-gray-600 text-sm">Precios claros para todos nuestros servicios.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <strong className="text-gray-900">Agenda Facil</strong>
                  <p className="text-gray-600 text-sm">Programa tu recogida y entrega sin llamadas.</p>
                </div>
              </li>
            </ul>

            <a
              href={whatsappLinks.booking}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chatea con Sofia
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
