import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})
const geistMono = Geist_Mono({ variable: '--font-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Plot2Plan — Vastu Blueprint Generator',
  description: 'AI-powered Vastu-compliant floor plan design for architects',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${geistMono.variable} antialiased bg-[#07080D]`}>
        <SessionProvider>
          {children}
          <Toaster theme="dark" position="top-right" />
        </SessionProvider>
      </body>
    </html>
  )
}
