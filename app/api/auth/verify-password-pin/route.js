import { NextResponse } from 'next/server'
import { verifyPIN } from '@/lib/pin-verification'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export const runtime = 'nodejs'

/**
 * POST /api/auth/verify-password-pin
 * Step 2: Verify PIN and get reset token
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
 *   "resetToken": "xxx",
 *   "message": "PIN verified. You can now reset your password."
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
    const result = verifyPIN(email, pin, 'forgot_password')

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error,
          attemptsLeft: result.attemptsLeft 
        },
        { status: 400 }
      )
    }

    // PIN verified - find user
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Delete any existing password reset tokens
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Create password reset token
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt,
      },
    })

    return NextResponse.json({
      success: true,
      resetToken,
      message: 'PIN verified. You can now reset your password.',
      resetUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset?token=${resetToken}`
    })
  } catch (error) {
    console.error('Verify password PIN error:', error)
    return NextResponse.json(
      { error: 'Failed to verify PIN' },
      { status: 500 }
    )
  }
}
