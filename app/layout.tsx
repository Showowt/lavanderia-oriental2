import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://lavanderia-oriental2.vercel.app'),
  title: {
    default: "Lavandería Oriental | Servicio de Lavandería en El Salvador",
    template: "%s | Lavandería Oriental",
  },
  description: "Servicio profesional de lavandería en El Salvador. 5 sucursales, delivery disponible, precios desde $3.25/libra. Agenda por WhatsApp y recibe tu ropa limpia el mismo día.",
  keywords: ["lavandería", "El Salvador", "lavado de ropa", "delivery", "San Miguel", "Santa Ana", "servicio de lavandería", "edredones", "planchado"],
  authors: [{ name: "Lavandería Oriental" }],
  openGraph: {
    title: "Lavandería Oriental | Tu Ropa Limpia, Fresca y Cuidada",
    description: "5 sucursales en El Salvador. Lavado profesional desde $3.25/libra. Delivery disponible. Agenda por WhatsApp.",
    type: "website",
    locale: "es_SV",
    siteName: "Lavandería Oriental",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lavandería Oriental | Servicio de Lavandería en El Salvador",
    description: "5 sucursales en El Salvador. Lavado profesional desde $3.25/libra. Delivery disponible.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
