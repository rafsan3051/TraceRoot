import { NextResponse } from 'next/server'
import { validateRole } from '@/lib/auth/validate-role'
import { getToken } from 'next-auth/jwt'

export default async function middleware(request) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  
  // Check if user is authenticated and has FARMER role
  if (!token || !(await validateRole(token, ['FARMER']))) {
    // Redirect to access denied page
    return NextResponse.redirect(new URL('/access-denied', request.url))
  }

  return NextResponse.next()
}