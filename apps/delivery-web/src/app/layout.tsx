import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Delivery Agent | WaterCan',
  description: 'WaterCan Delivery Routing',
  themeColor: '#16a34a', // Green theme for mobile address bar
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 pb-20`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
