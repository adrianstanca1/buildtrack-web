import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  // `default` is used when a page doesn't export its own metadata.
  // `template` is applied when a page DOES set its own `title` so each
  // tab reads e.g. "Sign in - BuildTrack" instead of the generic root.
  title: {
    default: 'BuildTrack - Construction Management',
    template: '%s - BuildTrack',
  },
  description: 'Modern construction project management platform',
  // Without this Next.js never emits <link rel="manifest"> and the
  // PWA isn't installable even though /manifest.json is served.
  manifest: '/manifest.json',
  themeColor: '#2563EB',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BuildTrack',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
