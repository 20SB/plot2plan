import type { Metadata } from 'next'
import { Inter, Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { BackgroundSystem } from '@/components/layout/background-system'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({ variable: '--font-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Plot2Plan — Vastu Blueprint Generator',
  description: 'AI-powered Vastu-compliant floor plan design for architects',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <BackgroundSystem />
          <SessionProvider>
            <div className="relative z-10 flex flex-col min-h-screen">
              {children}
            </div>
            <Toaster position="top-right" closeButton richColors />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
