'use client';

import { useState } from 'react';
import { FAQSchema } from './StructuredData';

const faqs = [
  {
    question: 'Cuanto cuesta el lavado por libra?',
    answer: 'El lavado por libra cuesta $3.25 e incluye lavado con detergente premium, secado y doblado. Para ropa delicada o con manchas especiales, aplicamos tratamiento especial sin costo adicional.',
  },
  {
    question: 'Tienen servicio de delivery?',
    answer: 'Si! Tenemos servicio de delivery por $2. Recogemos tu ropa en casa u oficina y te la entregamos limpia y lista. Disponible en todas nuestras zonas de cobertura.',
  },
  {
    question: 'Cuanto tiempo tarda el servicio?',
    answer: 'El servicio regular se entrega en 24 horas. Tambien ofrecemos servicio express de 4-6 horas con un cargo adicional de $3.',
  },
  {
    question: 'Que metodos de pago aceptan?',
    answer: 'Aceptamos efectivo, tarjetas de credito/debito, transferencias bancarias y pagos por aplicacion. Puedes pagar al momento de la entrega o en sucursal.',
  },
  {
    question: 'Cuales son sus horarios de atencion?',
    answer: 'Nuestras sucursales estan abiertas de lunes a sabado de 7:00 AM a 6:00 PM. El servicio de WhatsApp con Sofia esta disponible 24/7.',
  },
  {
    question: 'Lavan edredones y cobertores?',
    answer: 'Si, lavamos edredones, cobertores, almohadas y toda ropa de cama. Los edredones matrimoniales cuestan $6.50 y los queen/king $8.50. Quedan perfectamente limpios y esponjosos.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <FAQSchema faqs={faqs} />
      <section className="py-20 bg-white" id="faq">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1 rounded-full mb-4">
              Preguntas Frecuentes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Resolvemos tus Dudas
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Todo lo que necesitas saber sobre nuestros servicios
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border-b border-gray-200 last:border-b-0"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors px-2 rounded-lg"
                >
                  <span className="font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-blue-600 flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="pb-5 px-2">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
