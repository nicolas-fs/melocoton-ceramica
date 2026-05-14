import type { Metadata } from 'next';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { CarritoProvider } from '@/context/CarritoContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/shop/CartSidebar';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import Chatbot from '@/components/ui/Chatbot';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Melocotón Cerámica | Artesanía hecha a mano — Carlos Paz',
    template: '%s | Melocotón Cerámica',
  },
  description:
    'Cerámica artesanal hecha a mano en Villa Carlos Paz, Córdoba. Tazas, tazones, bowls y sets únicos. Cada pieza es irrepetible.',
  keywords: ['cerámica artesanal', 'tazas con frases', 'cerámica córdoba', 'villa carlos paz', 'artesanías', 'regalo'],
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'Melocotón Cerámica',
    title: 'Melocotón Cerámica | Artesanía hecha a mano',
    description: 'Cerámica artesanal única, hecha con amor en Villa Carlos Paz, Córdoba.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body className="font-sans bg-melocoton-50 text-tierra-800 antialiased">
        <CarritoProvider>
          <Navbar />
          <CartSidebar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          {/* Botón flotante de WhatsApp */}
          <WhatsAppButton />
          {/* Chatbot de IA — funciona sin API key con respuestas básicas */}
          <Chatbot />
          <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
        </CarritoProvider>
      </body>
    </html>
  );
}
