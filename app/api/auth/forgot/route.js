import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Exclude admin from forgot password flow
    if (user.role === 'ADMIN') {
      return NextResponse.json({ success: true })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    // TODO: In production, send email with reset link
    // For development, return token in response for convenience
    return NextResponse.json({ success: true, token })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
