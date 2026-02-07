import Link from 'next/link';
import { whatsappLinks, WHATSAPP_DISPLAY } from '@/lib/whatsapp';
import { GoogleAnalytics } from '@/components/Analytics';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <GoogleAnalytics />
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🧺</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-gray-900">Lavanderia Oriental</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/servicios" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Servicios
              </Link>
              <Link href="/ubicaciones" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Ubicaciones
              </Link>
              <Link href="/franquicias" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Franquicias
              </Link>
            </nav>

            {/* CTA */}
            <a
              href={whatsappLinks.general}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🧺</span>
                </div>
                <span className="font-bold text-lg">Lavanderia Oriental</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Tu ropa limpia, fresca y cuidada. 5 ubicaciones en El Salvador. Delivery disponible.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                  <span>📘</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors">
                  <span>📸</span>
                </a>
                <a href={whatsappLinks.general} className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                  <span>💬</span>
                </a>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/servicios/lavado" className="hover:text-white transition-colors">Lavado por Libra</Link></li>
                <li><Link href="/servicios/secado" className="hover:text-white transition-colors">Secado</Link></li>
                <li><Link href="/servicios/edredones" className="hover:text-white transition-colors">Edredones</Link></li>
                <li><Link href="/servicios/planchado" className="hover:text-white transition-colors">Planchado</Link></li>
                <li><Link href="/servicios/delivery" className="hover:text-white transition-colors">Delivery</Link></li>
              </ul>
            </div>

            {/* Locations */}
            <div>
              <h4 className="font-semibold mb-4">Sucursales</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="/ubicaciones/san-miguel" className="hover:text-white transition-colors">San Miguel</Link></li>
                <li><Link href="/ubicaciones/usulutan" className="hover:text-white transition-colors">Usulutan</Link></li>
                <li><Link href="/ubicaciones/lourdes-colon" className="hover:text-white transition-colors">Lourdes Colon</Link></li>
                <li><Link href="/ubicaciones/santa-ana" className="hover:text-white transition-colors">Santa Ana</Link></li>
                <li><Link href="/ubicaciones/la-union" className="hover:text-white transition-colors">La Union</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <a href={whatsappLinks.general} className="hover:text-white transition-colors flex items-center gap-2">
                    <span>💬</span> WhatsApp: {WHATSAPP_DISPLAY}
                  </a>
                </li>
                <li className="pt-4">
                  <Link href="/franquicias" className="hover:text-white transition-colors">Franquicias</Link>
                </li>
                <li>
                  <Link href="/trabaja-con-nosotros" className="hover:text-white transition-colors">Trabaja con Nosotros</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
            <p>&copy; 2026 Lavanderia Oriental. Todos los derechos reservados.</p>
            <div className="flex gap-4">
              <Link href="/legal/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
              <Link href="/legal/terminos" className="hover:text-white transition-colors">Terminos</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={whatsappLinks.booking}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group"
        aria-label="Chat on WhatsApp"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          WhatsApp
        </span>
      </a>
    </div>
  );
}
