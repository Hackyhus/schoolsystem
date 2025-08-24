import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { Analytics } from "@vercel/analytics/react"


export const metadata: Metadata = {
  title: 'InsightConnect Portal',
  description: 'A role-based portal for staff and parents of Great Insight International Academy (GIIA).',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
