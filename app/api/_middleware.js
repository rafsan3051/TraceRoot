import { NextResponse } from 'next/server'
import { verifyAuth } from './lib/auth/auth-utils'

export async function middleware(request) {
  const pathname = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/register', '/auth']
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get('auth-token')?.value
  const verifiedToken = token && await verifyAuth(token)

  if (!verifiedToken) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Role-based access control
  if (pathname.startsWith('/admin') && verifiedToken.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname.startsWith('/farmer') && verifiedToken.role !== 'FARMER') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Specify which routes should be handled by the middleware
export const config = {
  matcher: [
    '/admin/:path*',
    '/farmer/:path*',
    '/profile/:path*',
    '/product/create',
    '/product/edit/:path*'
  ]
}