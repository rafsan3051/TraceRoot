import { NextResponse } from 'next/server'
import { verifyPIN } from '@/lib/pin-verification'
import { hashPassword, createToken } from '@/lib/auth/auth-utils'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * POST /api/auth/verify-email-pin
 * Step 2: Verify PIN and create account
 * 
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "pin": "123456"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "user": {...},
 *   "message": "Account created successfully"
 * }
 */
export async function POST(request) {
  try {
    const { email, pin } = await request.json()

    if (!email || !pin) {
      return NextResponse.json(
        { error: 'Email and PIN are required' },
        { status: 400 }
      )
    }

    // Verify PIN
    const result = verifyPIN(email, pin, 'email_verification')

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error,
          attemptsLeft: result.attemptsLeft 
        },
        { status: 400 }
      )
    }

    // PIN verified - retrieve pending registration data
    global.pendingRegistrations = global.pendingRegistrations || new Map()
    const pendingReg = global.pendingRegistrations.get(email)

    if (!pendingReg) {
      return NextResponse.json(
        { error: 'Registration data not found. Please start registration again.' },
        { status: 404 }
      )
    }

    // Check if registration data expired
    if (new Date() > pendingReg.expiresAt) {
      global.pendingRegistrations.delete(email)
      return NextResponse.json(
        { error: 'Registration session expired. Please start again.' },
        { status: 400 }
      )
    }

    const userData = pendingReg.data

    // Hash password
    const hashedPassword = await hashPassword(userData.password)

    // Create user
    let user
    try {
      user = await prisma.user.create({
        data: {
          name: userData.name,
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
          profileImage: userData.profileImage,
        }
      })
    } catch (createError) {
      // Handle unique constraint violation
      if (createError.code === 11000 || createError.message?.includes('unique')) {
        return NextResponse.json({ 
          error: 'Email or username already exists' 
        }, { status: 400 })
      }
      throw createError
    }

    // Delete pending registration data
    global.pendingRegistrations.delete(email)

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
    return NextResponse.json({ 
      success: true,
      user: newUserData,
      message: 'Account created successfully! You are now logged in.'
    })
  } catch (error) {
    console.error('Verify email PIN error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
