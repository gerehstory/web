import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/context';
import { Navbar } from '@/components/layout/Navbar';
import { Vazirmatn } from 'next/font/google';
export const metadata: Metadata = {
  title: 'سبزلرن',
  description: 'آثار خلاقانه را کشف کنید و به اشتراک بگذارید',
};

const vazir = Vazirmatn({ subsets: ['arabic'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className="h-full antialiased">
      <body className={vazir.className}>
        <AuthProvider>
          <Navbar />
          <main className="container flex-1">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
