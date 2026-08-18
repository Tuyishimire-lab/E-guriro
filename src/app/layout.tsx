import type { Metadata, Viewport } from 'next';
import './globals.css';
import PublicShell from '@/components/PublicShell';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const SITE_URL = 'https://rwandabuy.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "RwandaBuy | Rwanda's #1 Electronics & Phone Store",
  description: "Buy smartphones, laptops, tablets, TVs, and more in Rwanda. 500+ phone models from Samsung, Apple, Tecno, Infinix & more. Genuine products, official warranty, delivered to all 30 districts. MTN MoMo & Airtel Money accepted.",
  keywords: 'smartphones Rwanda, buy phone Kigali, Samsung Rwanda, iPhone Rwanda, Tecno Kigali, laptop Rwanda, electronics Rwanda, MTN MoMo, e-commerce Rwanda, refurbished phones Rwanda',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "RwandaBuy — Rwanda's #1 Electronics & Phone Store",
    description: "Shop 500+ phone models & electronics in Rwanda. Official warranty, genuine products. MTN MoMo & Airtel Money accepted.",
    url: SITE_URL,
    siteName: 'RwandaBuy',
    type: 'website',
    locale: 'en_RW',
  },
  twitter: {
    card: 'summary_large_image',
    title: "RwandaBuy — Rwanda's #1 Electronics Store",
    description: "500+ phones & electronics. MTN MoMo accepted. Delivered to all 30 districts.",
    site: '@rwandabuy',
  },
  robots: { index: true, follow: true },
};


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <PublicShell>{children}</PublicShell>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
