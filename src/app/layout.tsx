import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/lib/i18n/context';

export const metadata: Metadata = {
  title: 'Krishimitra AI - भारतीय किसानों का सच्चा डिजिटल सलाहकार',
  description: 'AI-powered decision support for Indian farmers: CNN crop disease diagnosis, yield prediction, multilingual AI agronomist chatbot, and KVK locator.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192.png',
  },
  keywords: [
    'Krishimitra AI',
    'Kisan AI',
    'Plantix alternative',
    'Crop Disease Diagnosis',
    'ICAR KVK locator',
    'Crop Yield Predictor',
    'Indian Agriculture AI',
  ],
};

export const viewport: Viewport = {
  themeColor: '#15803d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Krishimitra AI" />
      </head>
      <body className="antialiased selection:bg-green-200 selection:text-green-900">
        <LanguageProvider>
          {children}
        </LanguageProvider>

        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('[Krishimitra PWA] ServiceWorker registered with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('[Krishimitra PWA] ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
