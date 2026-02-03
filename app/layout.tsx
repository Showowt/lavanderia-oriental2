import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lavandería Oriental - Admin Dashboard",
  description: "AI-powered WhatsApp concierge platform for Lavandería Oriental",
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
