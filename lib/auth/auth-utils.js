import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const secretKey = process.env.JWT_SECRET_KEY || 'your-secret-key'
const key = new TextEncoder().encode(secretKey)

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

export async function comparePasswords(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

export async function createToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key)
}

export async function verifyAuth(token) {
  try {
    const verified = await jwtVerify(token, key)
    if (!verified?.payload?.id || !verified?.payload?.role) {
      throw new Error('Invalid token payload')
    }
    return verified.payload
  } catch (err) {
    console.error('Token verification failed:', err)
    return null
  }
}

export async function getSession() {
  try {
    const token = cookies().get('auth-token')?.value
    if (!token) {
      return null
    }
    const session = await verifyAuth(token)
    if (!session?.id) {
      // Invalid session, clear the cookie
      cookies().set('auth-token', '', {
        expires: new Date(0),
        path: '/'
      })
      return null
    }
    return session
  } catch (error) {
    console.error('Session check failed:', error)
    return null
  }
}