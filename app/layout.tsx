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
            // GLOBAL FETCH OVERRIDE - Clean version
            if (typeof window !== 'undefined') {
              const originalFetch = window.fetch;
              window.fetch = function(url, options) {
                if (typeof url === 'string' && url.includes('localhost')) {
                  url = url.replace('http://localhost:3001', 'https://corporate-agent-backend-v2.onrender.com');
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
