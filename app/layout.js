import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const SITE_DESCRIPTION =
  'Find your ideal visa path and journey, powered by AI. Get visa requirements, embassy info, costs, and wait times instantly.';

export const metadata = {
  metadataBase: new URL('https://visainfo.ai'),
  title: 'VisaInfo.ai — Do I need a visa? Instant visa requirements checker',
  description: SITE_DESCRIPTION,
  openGraph: {
    title: 'VisaInfo.ai — Do I need a visa? Instant visa requirements checker',
    description: SITE_DESCRIPTION,
    url: 'https://visainfo.ai',
    siteName: 'VisaInfo.ai',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'VisaInfo.ai — Do I need a visa? Instant visa requirements checker',
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export const viewport = {
  themeColor: '#0f0d0a',
};

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
