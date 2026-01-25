import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export const runtime = 'nodejs'

/**
 * POST /api/auth/resend
 * Resend password reset email if the initial one was missed or expired
 * 
 * Request body:
 * {
 *   "email": "user@example.com"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "If an account exists, a reset link has been sent to your email."
 * }
 */
export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset link has been sent to your email.'
      })
    }

    // Exclude admin from forgot password flow
    if (user.role === 'ADMIN') {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset link has been sent to your email.'
      })
    }

    // Delete any existing tokens for this user (clean up old ones)
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Create password reset token
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    // Send email
    const emailResult = await sendPasswordResetEmail(email, token)

    if (!emailResult.success) {
      // Token was created but email failed - still return success for security
      console.warn(`Email send failed for ${email}: ${emailResult.error}`)
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a reset link has been sent to your email.',
      ...(process.env.NODE_ENV === 'development' && { token }) // Dev only
    })
  } catch (error) {
    console.error('Resend password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
