import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import { cookies } from 'next/headers'
import { ThemeProvider } from '../components/theme-provider'
import { AuthProvider } from '../lib/auth/auth-context'
import { LocaleProvider } from '../lib/i18n/locale-context'
import LayoutWrapper from '../components/layout-wrapper'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'TraceRoot - Blockchain-based Product Traceability',
    template: '%s | TraceRoot'
  },
  description: 'Track and verify products through the supply chain using blockchain technology',
  keywords: ['blockchain', 'supply chain', 'traceability', 'product verification', 'farming'],
  authors: [{ name: 'TraceRoot Team', url: 'https://tracerootapp.com' }],
  creator: 'TraceRoot Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'TraceRoot - Blockchain-based Product Traceability',
    description: 'Track and verify products through the supply chain using blockchain technology',
    siteName: 'TraceRoot'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TraceRoot',
    description: 'Track and verify products through the supply chain using blockchain technology',
    creator: '@tracerootapp'
  },
  robots: {
    index: true,
    follow: true
  },
  icons: {
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
}

export default async function RootLayout({ children }) {
  const cookieStore = await cookies()
  const locale = cookieStore.get?.('locale')?.value || 'en-BD'
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <LocaleProvider>
            <AuthProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
              <Toaster 
                position="top-center"
                toastOptions={{
                  duration: 5000,
                  style: {
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)'
                  }
                }}
              />
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}