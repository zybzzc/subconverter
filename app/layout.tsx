import type { Metadata } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
});

export const metadata: Metadata = {
  title: 'Subconverter // Terminal',
  description: 'Clash Subscription Converter',
  keywords: ['clash', 'subscription', 'proxy', 'meta', 'converter'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${ibmPlexMono.variable} font-mono bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
