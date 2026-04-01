import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/app/components/providers/AppProvider';

export const metadata: Metadata = {
  title: 'Read Chinese or Die',
  description: 'Scan and learn Chinese characters',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Read Chinese or Die',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen w-screen overflow-hidden bg-[#0a0a0a]">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
