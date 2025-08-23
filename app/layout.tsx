import type {Metadata, Viewport} from 'next';
import '@/styles/globals.css';

import {Arimo, Syne} from 'next/font/google';
import AuthProvider from '@/context/AuthProvider';
import {CartProvider} from '@/context/CartProvider';
import {FavoritesProvider} from '@/context/FavoritesProvider';
import {SpeedInsights} from '@vercel/speed-insights/next';
import QueryProvider from '@/context/QueryProvider';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';

import {NavigatedHistoryProvider} from '@/context/NavigatedHistoryProvider';

const arimo = Arimo({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-arimo',
  display: 'swap',
  preload: true,
});

const syne = Syne({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'NC',
  description: 'E-commerce Next.js 2025',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get server-side session for hydration
  const session = await getServerSession(authOptions);
  // console.log('RootLayout - Server session:', session?.user?.id);

  return (
    <html lang='sv'>
      <body
        className={`${arimo.variable} ${syne.variable} ${arimo.className} `}
      >
        <QueryProvider>
          <AuthProvider session={session}>
            <CartProvider>
              <FavoritesProvider>
                <NavigatedHistoryProvider>
                  <SpeedInsights />
                  {children}
                </NavigatedHistoryProvider>
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
