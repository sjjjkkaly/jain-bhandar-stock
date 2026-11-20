import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jain Bhandar | Wholesale Stock Management',
  description: 'Wholesale inventory and daily stock ledger management portal for Jain Bhandar (stock.jainbhandar.com).',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100/70 antialiased selection:bg-amber-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
