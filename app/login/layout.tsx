import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Panel de Administración',
  description: 'Acceso al panel de administración de Lavandería Oriental.',
  robots: 'noindex, nofollow',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page doesn't use the dashboard layout
  return <>{children}</>;
}
