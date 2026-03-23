import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://plot2plan.com'),
  title: {
    default: 'Plot2Plan - AI House Design & Floor Plan Generator',
    template: '%s | Plot2Plan'
  },
  description: 'Generate 2D floor plans, 3D elevations, and complete house designs instantly with AI. Convert your plot into a perfect home. Vastu-compliant designs for Indian homes.',
  keywords: [
    'house plan generator India',
    'naksha design online',
    '2D floor plan generator',
    '3D house elevation AI',
    'vastu house plan',
    'plot design tool',
    'architectural drawings online',
    'home design AI',
    'floor plan maker',
    'house blueprint generator'
  ],
  authors: [{ name: 'Plot2Plan' }],
  creator: 'Plot2Plan',
  publisher: 'Plot2Plan',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://plot2plan.com',
    title: 'Plot2Plan - AI House Design & Floor Plan Generator',
    description: 'Generate 2D floor plans, 3D elevations, and complete house designs instantly with AI. Convert your plot into a perfect home.',
    siteName: 'Plot2Plan',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Plot2Plan - AI-Powered House Design Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plot2Plan - AI House Design & Floor Plan Generator',
    description: 'Generate 2D floor plans, 3D elevations, and complete house designs instantly with AI.',
    images: ['/og-image.png'],
    creator: '@plot2plan',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
