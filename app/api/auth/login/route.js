import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '../../../../lib/prisma'
import { comparePasswords, createToken } from '../../../../lib/auth/auth-utils'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Try to find user by email first, then by name (username)
    let user = await prisma.user.findUnique({
      where: { email }
    })

    // If not found by email, try to find by name
    if (!user) {
      user = await prisma.user.findFirst({
        where: { name: email } // User entered username in email field
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValidPassword = await comparePasswords(password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role
    })

    // Set cookie
    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    // Return user data (excluding password)
    const { password: _, ...userData } = user
    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}