import { NextResponse } from 'next/server'
import { generatePIN, storePIN } from '@/lib/pin-verification'
import { sendEmailVerificationPIN } from '@/lib/email'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

/**
 * POST /api/auth/register-send-pin
 * Step 1: Register user and send verification PIN
 * 
 * Request body:
 * {
 *   "name": "John Doe",
 *   "email": "user@example.com",
 *   "password": "password123",
 *   "username": "johndoe",
 *   "role": "CONSUMER",
 *   "phoneNumber": "1234567890",
 *   "address": "123 Main St"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Verification PIN sent to your email",
 *   "email": "user@example.com"
 * }
 */
export async function POST(request) {
  try {
    const userData = await request.json()
    
    if (!userData.email || !userData.password || !userData.name) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check role validity
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
    const emailExists = await prisma.user.findUnique({ 
      where: { email: userData.email } 
    })

    if (emailExists) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Check if username already exists (if provided)
    if (userData.username) {
      const usernameExists = await prisma.user.findUnique({ 
        where: { username: userData.username } 
      })

      if (usernameExists) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        )
      }
    }

    // Generate 6-digit PIN
    const pin = generatePIN(6)
    const expiryMinutes = 10

    // Store PIN and user data temporarily
    storePIN(userData.email, pin, 'email_verification', expiryMinutes)
    
    // Store user data temporarily (in a real app, use a session or temporary storage)
    // For now, we'll store it in the PIN metadata
    const registrationData = {
      name: userData.name,
      username: userData.username || null,
      email: userData.email,
      password: userData.password, // Will be hashed when verified
      role: safeRole,
      phoneNumber: userData.phoneNumber || null,
      address: userData.address || null,
      profileImage: userData.profileImage || null,
    }

    // Store registration data with the PIN (we'll retrieve this after verification)
    global.pendingRegistrations = global.pendingRegistrations || new Map()
    global.pendingRegistrations.set(userData.email, {
      data: registrationData,
      expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000)
    })

    // Send PIN via email
    const emailResult = await sendEmailVerificationPIN(userData.email, pin, expiryMinutes)

    if (!emailResult.success) {
      console.warn(`Email send failed for ${userData.email}: ${emailResult.error}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Verification PIN sent to your email. Please check your inbox.',
      email: userData.email,
      ...(process.env.NODE_ENV === 'development' && { pin, expiresIn: `${expiryMinutes} minutes` })
    })
  } catch (error) {
    console.error('Register send PIN error:', error)
    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    )
  }
}
