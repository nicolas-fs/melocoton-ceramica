import type { Metadata } from 'next';
// CAMBIO 2: Readex Pro se carga via @import en globals.css
import { Toaster } from 'react-hot-toast';
import { CarritoProvider } from '@/context/CarritoContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartSidebar from '@/components/shop/CartSidebar';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import Chatbot from '@/components/ui/Chatbot';
import './globals.css';

// CAMBIO 2: fuentes removidas — Readex Pro via globals.css

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
 <html lang="es-AR">
 <body className="text-tierra-800 bg-white antialiased">
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
