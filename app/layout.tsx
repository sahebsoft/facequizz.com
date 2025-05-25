import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers/providers';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'فيس كويز - اختبارات الشخصية والمعرفة',
  description: 'اكتشف شخصيتك واختبر معلوماتك مع مجموعة متنوعة من الاختبارات والألغاز الممتعة',
  keywords: ['اختبارات', 'شخصية', 'معرفة', 'ألغاز', 'تحليل الشخصية', 'فيس كويز'],
  authors: [{ name: 'FaceQuizz Team' }],
  openGraph: {
    title: 'فيس كويز - اختبارات الشخصية والمعرفة',
    description: 'اكتشف شخصيتك واختبر معلوماتك مع مجموعة متنوعة من الاختبارات والألغاز الممتعة',
    url: 'https://facequizz.com',
    siteName: 'فيس كويز',
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'فيس كويز - اختبارات الشخصية والمعرفة',
    description: 'اكتشف شخصيتك واختبر معلوماتك مع مجموعة متنوعة من الاختبارات والألغاز الممتعة',
    site: '@facequizz',
    creator: '@facequizz',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://facequizz.com',
  },
  verification: {
    google: 'your-google-verification-code',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}