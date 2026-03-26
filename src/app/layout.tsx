import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/layout/navbar';
import { QueryProvider } from '@/providers/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Blog Platform',
  description: 'Blog Platform - a full stack blog sharing web application'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <Navbar />
          <main className="mx-auto min-h-[calc(100vh-80px)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
