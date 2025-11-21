import { NextResponse } from 'next/server'
import { validateConfig, getConfigErrorMessage } from '@/lib/config'

export async function GET() {
  const validation = validateConfig()
  
  if (!validation.isValid) {
    return NextResponse.json({
      status: 'error',
      configured: false,
      message: getConfigErrorMessage(),
      missing: validation.missing,
      errors: validation.errors,
    }, { status: 500 })
  }

  return NextResponse.json({
    status: 'ok',
    configured: true,
    message: 'All required environment variables are set',
  })
}
