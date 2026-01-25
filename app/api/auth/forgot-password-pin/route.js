import { NextResponse } from 'next/server'
import { generatePIN, storePIN } from '@/lib/pin-verification'
import { sendPasswordResetPIN } from '@/lib/email'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * POST /api/auth/forgot-password-pin
 * Step 1: Request PIN for password reset
 * 
 * Request body:
 * {
 *   "email": "user@example.com"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "PIN sent to your email"
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

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a PIN has been sent.'
      })
    }

    // Exclude admin from forgot password flow
    if (user.role === 'ADMIN') {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a PIN has been sent.'
      })
    }

    // Generate 6-digit PIN
    const pin = generatePIN(6)
    const expiryMinutes = 10

    // Store PIN
    storePIN(email, pin, 'forgot_password', expiryMinutes)

    // Send PIN via email
    const emailResult = await sendPasswordResetPIN(email, pin, expiryMinutes)

    if (!emailResult.success) {
      console.warn(`Email send failed for ${email}: ${emailResult.error}`)
      // Still return success for security
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a PIN has been sent.',
      ...(process.env.NODE_ENV === 'development' && { pin, expiresIn: `${expiryMinutes} minutes` })
    })
  } catch (error) {
    console.error('Forgot password PIN error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
