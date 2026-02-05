import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lavandería Oriental",
    template: "%s | Lavandería Oriental",
  },
  description: "Plataforma de gestión con IA para WhatsApp - Lavandería Oriental",
  keywords: ["lavandería", "whatsapp", "ia", "gestión", "pedidos"],
  authors: [{ name: "Lavandería Oriental" }],
  openGraph: {
    title: "Lavandería Oriental - Panel de Administración",
    description: "Plataforma de gestión con IA para WhatsApp",
    type: "website",
    locale: "es_MX",
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
