import './globals.css';
import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Sistema DNA — Defensoría de la Niñez y Adolescencia',
  description: 'Sistema de Gestión y Acompañamiento de Casos — Defensoría de la Niñez y Adolescencia (DNA)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
