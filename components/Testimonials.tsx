const testimonials = [
  {
    id: 1,
    name: 'María Elena Rodríguez',
    location: 'San Miguel',
    rating: 5,
    text: 'Excelente servicio! Llevo 2 años trayendo mi ropa aquí y siempre queda impecable. El servicio de delivery es muy conveniente.',
    service: 'Lavado por Libra',
  },
  {
    id: 2,
    name: 'Carlos Martínez',
    location: 'Santa Ana',
    rating: 5,
    text: 'Tengo un AirBnB y uso su servicio de edredones semanalmente. Precios justos y siempre a tiempo. 100% recomendado.',
    service: 'Edredones',
  },
  {
    id: 3,
    name: 'Ana Patricia López',
    location: 'Lourdes Colón',
    rating: 5,
    text: 'El personal es muy amable y profesional. Mis camisas de trabajo siempre quedan perfectamente planchadas.',
    service: 'Planchado',
  },
  {
    id: 4,
    name: 'Roberto Hernández',
    location: 'Usulután',
    rating: 5,
    text: 'Responden super rápido por WhatsApp. Agendé mi lavada a las 10pm y a las 7am ya tenían mi ropa lista.',
    service: 'Lavado Express',
  },
  {
    id: 5,
    name: 'Sofía Mendoza',
    location: 'San Miguel',
    rating: 5,
    text: 'Mejor lavandería de la zona. Antes lavaba en casa pero ahora prefiero traerla aquí. Me ahorro tiempo y queda mejor.',
    service: 'Lavado por Libra',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-yellow-100 text-yellow-700 text-sm font-semibold px-4 py-1 rounded-full mb-4">
            Testimonios
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="font-semibold">5.0</span>
            <span>basado en 150+ reseñas</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
                <StarRating rating={testimonial.rating} />
              </div>
              <p className="text-gray-700 mb-3">&ldquo;{testimonial.text}&rdquo;</p>
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                {testimonial.service}
              </span>
            </div>
          ))}
        </div>

        {/* Google Reviews Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-6 py-3 shadow-sm">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <div className="text-left">
              <div className="flex items-center gap-1">
                <span className="font-bold text-gray-900">5.0</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500">Google Reviews</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
