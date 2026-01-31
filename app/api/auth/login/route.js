import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '../../../../lib/prisma'
import { comparePasswords, createToken } from '../../../../lib/auth/auth-utils'

export async function POST(request) {
  try {
    const body = await request.json()
    
    console.log('🔐 Login attempt:', { email: body.email, hasPassword: !!body.password })

    // Validate input
    if (!body.email || !body.password) {
      console.log('❌ Validation failed: missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Try to find user by email first, then by username, then fallback to name for backward compatibility
    let user = await prisma.user.findUnique({ where: { email: body.email } })
    console.log('👤 User lookup by email:', user ? `Found: ${user.email}` : 'Not found')

    if (!user) {
      user = await prisma.user.findUnique({ where: { username: body.email } }).catch(() => null)
      console.log('👤 User lookup by username:', user ? `Found: ${user.email}` : 'Not found')
    }

    if (!user) {
      user = await prisma.user.findFirst({ where: { name: body.email } }) // legacy fallback
      console.log('👤 User lookup by name:', user ? `Found: ${user.email}` : 'Not found')
    }

    if (!user) {
      console.log('❌ User not found in database')
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isValidPassword = await comparePasswords(body.password, user.password)
    console.log('🔑 Password validation:', isValidPassword ? '✅ Valid' : '❌ Invalid')

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Create JWT token
    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role
    })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    // Return user data (excluding password)
    const { password: _, ...userData } = user
    return NextResponse.json({ user: userData }, { status: 200 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}