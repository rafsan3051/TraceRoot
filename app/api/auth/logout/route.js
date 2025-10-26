import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  // Delete the auth cookie with full options
  const cookieStore = await cookies()
  cookieStore.set('auth-token', '', {
    expires: new Date(0),
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
  
  return NextResponse.json(
    { success: true },
    {
      headers: {
        'Clear-Site-Data': '"cookies"'
      }
    }
  )
}