import { NextResponse } from 'next/server'
import { verifyAuth } from './lib/auth/auth-utils'
import { getSecurityHeaders } from './lib/security/headers'

// Define paths at the top level for better performance
const PUBLIC_PATHS = ['/', '/auth', '/auth/register', '/products', '/track']
const PUBLIC_PATH_PREFIXES = ['/verify/'] // Paths that start with these are public
const ROLE_PATHS = {
  '/admin': 'ADMIN',
  '/farmer': 'FARMER',
  '/retailer': 'RETAILER',
  '/distributor': 'DISTRIBUTOR',
}

export async function proxy(request) {
  try {
    const pathname = request.nextUrl.pathname

    // Skip proxy for API routes and static files
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico')
    ) {
      return NextResponse.next()
    }

    // Allow public paths
    if (PUBLIC_PATHS.includes(pathname)) {
      const response = NextResponse.next()
      
      // Apply security headers
      const isDev = process.env.NODE_ENV === 'development'
      const headers = getSecurityHeaders(isDev)
      
      Object.entries(headers).forEach(([key, value]) => {
        // Skip HSTS in development
        if (isDev && key === 'Strict-Transport-Security') return
        // Relax CSP in development
        if (isDev && key === 'Content-Security-Policy') {
          response.headers.set(key, value.replace('upgrade-insecure-requests', ''))
          return
        }
        response.headers.set(key, value)
      })
      
      return response
    }

    // Allow public path prefixes (e.g., /verify/*)
    if (PUBLIC_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
      const response = NextResponse.next()
      
      // Apply security headers
      const isDev = process.env.NODE_ENV === 'development'
      const headers = getSecurityHeaders(isDev)
      
      Object.entries(headers).forEach(([key, value]) => {
        // Skip HSTS in development
        if (isDev && key === 'Strict-Transport-Security') return
        // Relax CSP in development
        if (isDev && key === 'Content-Security-Policy') {
          response.headers.set(key, value.replace('upgrade-insecure-requests', ''))
          return
        }
        response.headers.set(key, value)
      })
      
      return response
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

    const response = NextResponse.next()
    
    // Apply security headers to authenticated routes too
    const isDev = process.env.NODE_ENV === 'development'
    const headers = getSecurityHeaders(isDev)
    
    Object.entries(headers).forEach(([key, value]) => {
      // Skip HSTS in development
      if (isDev && key === 'Strict-Transport-Security') return
      // Relax CSP in development
      if (isDev && key === 'Content-Security-Policy') {
        response.headers.set(key, value.replace('upgrade-insecure-requests', ''))
        return
      }
      response.headers.set(key, value)
    })
    
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/auth', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
