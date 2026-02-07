'use client';

import { useState } from 'react';
import Link from 'next/link';
import { whatsappLinks } from '@/lib/whatsapp';

// Note: Metadata must be in a separate file for client components
// See app/(public)/franquicias/metadata.ts

export default function FranquiciasPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    zone: '',
    budget: '',
    experience: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/franchise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Error al enviar la solicitud');
      }
    } catch (err) {
      setError('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-800 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Unete a la Familia
            <br />
            <span className="text-yellow-400">Lavanderia Oriental</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Franquicias disponibles con modelo de negocio probado y en expansion por todo El Salvador
          </p>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            ¿Por que Lavanderia Oriental?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Modelo Probado</h3>
              <p className="text-gray-600 text-sm">5 sucursales exitosas operando en El Salvador</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛠️</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Equipos Incluidos</h3>
              <p className="text-gray-600 text-sm">Proveemos todo el equipamiento necesario</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Capacitacion Completa</h3>
              <p className="text-gray-600 text-sm">Te enseñamos todo el negocio de inicio a fin</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Retorno Rapido</h3>
              <p className="text-gray-600 text-sm">ROI en 12-18 meses promedio</p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Que Incluye tu Franquicia
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Licencia de marca Lavanderia Oriental',
                'Equipos industriales de lavado y secado',
                'Sistema de gestion y punto de venta',
                'Sistema de WhatsApp AI para atencion al cliente',
                'Capacitacion inicial (2 semanas)',
                'Manual de operaciones completo',
                'Soporte continuo de la franquicia matriz',
                'Materiales de marketing y branding',
                'Acceso a proveedores preferenciales',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Available Zones */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Zonas Disponibles
          </h2>
          <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              San Salvador (multiples zonas)
            </span>
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              La Libertad
            </span>
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Sonsonate
            </span>
            <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Ahuachapan
            </span>
            <span className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              Otras zonas (consultar)
            </span>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-gradient-to-br from-blue-800 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Solicita Informacion</h2>

            {submitted ? (
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h3>
                <p className="text-blue-100 mb-6">
                  Nos pondremos en contacto contigo pronto para discutir esta oportunidad.
                </p>
                <a
                  href={whatsappLinks.franchise}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  O escribenos por WhatsApp
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur rounded-2xl p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre completo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="+503 0000-0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Correo electronico *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">¿En que zona te interesa? *</label>
                  <select
                    required
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value="" className="text-gray-900">Selecciona una zona</option>
                    <option value="san-salvador" className="text-gray-900">San Salvador</option>
                    <option value="la-libertad" className="text-gray-900">La Libertad</option>
                    <option value="sonsonate" className="text-gray-900">Sonsonate</option>
                    <option value="ahuachapan" className="text-gray-900">Ahuachapan</option>
                    <option value="otra" className="text-gray-900">Otra zona</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Presupuesto de inversion</label>
                    <select
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="" className="text-gray-900">Selecciona</option>
                      <option value="<20k" className="text-gray-900">Menos de $20,000</option>
                      <option value="20k-40k" className="text-gray-900">$20,000 - $40,000</option>
                      <option value="40k-60k" className="text-gray-900">$40,000 - $60,000</option>
                      <option value="60k+" className="text-gray-900">Mas de $60,000</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">¿Experiencia en negocios?</label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="" className="text-gray-900">Selecciona</option>
                      <option value="yes-current" className="text-gray-900">Si, tengo negocio propio</option>
                      <option value="yes-past" className="text-gray-900">Si, he tenido</option>
                      <option value="no" className="text-gray-900">No, pero quiero emprender</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Cuentanos sobre ti (opcional)</label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                    placeholder="¿Por que te interesa esta franquicia?"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-400/50 text-red-100 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/50 text-gray-900 font-semibold px-6 py-4 rounded-xl transition-colors text-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    'Enviar Solicitud'
                  )}
                </button>

                <p className="text-blue-200 text-sm text-center">
                  Al enviar, aceptas nuestra <Link href="/legal/privacidad" className="underline">politica de privacidad</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
