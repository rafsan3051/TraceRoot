import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

/**
 * POST /api/auth/forgot
 * Request password reset email
 * Rate limited: 5 requests per hour per IP
 * 
 * Request body:
 * {
 *   "email": "user@example.com"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "If an account exists, a reset link has been sent.",
 *   "token": "xxx" // Only in development for testing
 * }
 */
export async function POST(request) {
  try {
    // Rate limiting: max 5 requests per hour per IP
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const isAllowed = checkRateLimit(`forgot-password:${clientIp}`, 5, 3600)
    
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Too many reset requests. Please try again in an hour.' },
        { status: 429 }
      )
    }

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

    // Delete any existing tokens for this user
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

    // Send email with reset link
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
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
