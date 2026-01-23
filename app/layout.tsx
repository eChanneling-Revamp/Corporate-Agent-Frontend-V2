import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Corporate Agent Module',
  description: 'Manage corporate agent appointments and notifications',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <script dangerouslySetInnerHTML={{
          __html: `
            // GLOBAL FETCH OVERRIDE - Disabled for local development
            if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
              const originalFetch = window.fetch;
              window.fetch = function(url, options) {
                if (typeof url === 'string' && url.includes('localhost')) {
                  url = url.replace('http://localhost:3001', 'https://dpdlab1.slt.lk:8645/corp-agent');
                }
                return originalFetch.call(this, url, options);
              };
            }
          `
        }} />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
