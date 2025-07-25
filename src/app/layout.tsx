import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import {
  Sidebar,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { MainNav } from '@/components/main-nav';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'AI Daily Toolkit',
  description: 'An all-in-one toolkit for your daily AI needs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        ></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-body antialiased">
        <SidebarProvider>
          <div className="flex min-h-screen">
            <Sidebar>
              <SidebarHeader>
                <Link
                  href="/"
                  className="flex items-center gap-2.5"
                  aria-label="AI Daily Toolkit Home"
                >
                  <Sparkles className="h-6 w-6 text-primary" />
                  <h1 className="font-headline text-lg font-semibold tracking-tight">
                    AI Daily Toolkit
                  </h1>
                </Link>
              </SidebarHeader>
              <MainNav />
            </Sidebar>
            <SidebarInset>
              <SiteHeader />
              <div className="p-4 sm:p-6 lg:p-8">{children}</div>
            </SidebarInset>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
