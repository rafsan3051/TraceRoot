import { NextResponse } from 'next/server'
import { verifyAuth } from './lib/auth/auth-utils'

// Define paths at the top level for better performance
const PUBLIC_PATHS = ['/', '/auth', '/auth/register']
const ROLE_PATHS = {
  '/admin': 'ADMIN',
  '/farmer': 'FARMER',
  '/retailer': 'RETAILER',
  '/distributor': 'DISTRIBUTOR',
}

export async function proxy(request) {
  try {
    const pathname = request.nextUrl.pathname

    // Allow public paths
    if (PUBLIC_PATHS.includes(pathname)) {
      return NextResponse.next()
    }

    // Verify authentication
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    const verifiedToken = await verifyAuth(token)
    if (!verifiedToken) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Role-based access
    for (const [path, role] of Object.entries(ROLE_PATHS)) {
      if (pathname.startsWith(path) && verifiedToken.role !== role) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    // Special check for product registration (role gate only; API enforces verification)
    if (
      pathname.startsWith('/product/create') ||
      pathname.startsWith('/product/register') ||
      pathname.startsWith('/products/create') ||
      pathname.startsWith('/products/register')
    ) {
      if (verifiedToken.role !== 'FARMER') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.redirect(new URL('/auth', request.url))
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/farmer/:path*',
    '/retailer/:path*',
    '/distributor/:path*',
    '/profile/:path*',
    '/product/create',
    '/product/register',
    '/products/create',
    '/products/register',
    '/product/edit/:path*',
  ],
}
