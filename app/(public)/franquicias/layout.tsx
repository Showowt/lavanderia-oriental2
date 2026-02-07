import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Franquicias | Únete a Lavandería Oriental',
  description: 'Abre tu propia Lavandería Oriental. Modelo de negocio probado, capacitación completa, equipos incluidos. ROI en 12-18 meses. Zonas disponibles en El Salvador.',
  openGraph: {
    title: 'Franquicias Lavandería Oriental | Oportunidad de Negocio',
    description: 'Únete a la familia Lavandería Oriental. Modelo probado, capacitación incluida, soporte continuo. Solicita información hoy.',
  },
};

export default function FranquiciasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
