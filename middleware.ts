import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const path = req.nextUrl.pathname

  const isProtected = path.startsWith('/cabinet')
  const isAuthPage = path === '/' || path === '/recovery'

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/cabinet', req.url))
  }
})

export const config = {
  matcher: ['/', '/recovery', '/cabinet/:path*'],
}
