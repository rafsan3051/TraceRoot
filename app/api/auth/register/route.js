import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'
import { hashPassword, createToken } from '../../../../lib/auth/auth-utils'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const userData = await request.json()
    const allowedRoles = new Set(['CONSUMER', 'FARMER', 'DISTRIBUTOR', 'RETAILER'])
    const requestedRole = (userData.role || 'CONSUMER').toString().toUpperCase()

    if (requestedRole === 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin accounts cannot be self-registered' },
        { status: 400 }
      )
    }

    const safeRole = allowedRoles.has(requestedRole) ? requestedRole : 'CONSUMER'
    
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

    // Validate uniqueness
    const [emailExists, usernameExists] = await Promise.all([
      prisma.user.findUnique({ where: { email: userData.email } }),
      userData.username ? prisma.user.findUnique({ where: { username: userData.username } }) : null,
    ])

    if (emailExists) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }
    if (userData.username && usernameExists) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password)

    // Create user (whitelist fields and sanitize role)
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        username: userData.username || null,
        email: userData.email,
        password: hashedPassword,
        role: safeRole,
        phoneNumber: userData.phoneNumber || null,
        address: userData.address || null,
        profileImage: userData.profileImage || null,
      }
    })

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