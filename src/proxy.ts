import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

const proxy = auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/register')

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.nextUrl))
  }

  return NextResponse.next()
})

export default proxy

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
