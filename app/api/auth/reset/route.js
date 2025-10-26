import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/auth-utils'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const reset = await prisma.passwordResetToken.findUnique({ where: { token } })
    if (!reset || reset.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
    }

    const hashed = await hashPassword(password)
    await prisma.user.update({ where: { id: reset.userId }, data: { password: hashed } })

    // Clean up tokens for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: reset.userId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
