import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { hashPassword, createToken } from '../../../../lib/auth/auth-utils'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const userData = await request.json()
    
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword
      }
    })

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
    const { password: _, ...newUserData } = user
    return NextResponse.json({ user: newUserData })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}