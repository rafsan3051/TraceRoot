import { NextResponse } from 'next/server'
import { validateConfig, getConfigErrorMessage } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const validation = validateConfig()
    if (!validation.isValid) {
      return NextResponse.json({
        status: 'unhealthy',
        configured: false,
        message: getConfigErrorMessage(),
        missing: validation.missing,
        errors: validation.errors
      }, { status: 503 })
    }

    return NextResponse.json({
      status: 'healthy',
      configured: true,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Health check failed'
    }, { status: 500 })
  }
}
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Check external email service
 */
async function checkEmailService() {
  const apiKey = process.env.RESEND_API_KEY
  
  if (!apiKey) {
    return {
      status: 'unconfigured',
      reason: 'Resend API key not configured',
      timestamp: new Date().toISOString()
    }
  }

  try {
    const startTime = Date.now()
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      signal: controller.signal
    }).catch(e => ({ ok: false, error: e.message }))

    clearTimeout(timeout)
    const duration = Date.now() - startTime

    if (response.ok || response.status === 401) {
      // 401 is OK - means the endpoint is reachable
      return {
        status: 'healthy',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      }
    } else {
      return {
        status: 'unhealthy',
        error: `HTTP ${response.status}`,
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    logger.error('Email service health check failed', error)
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

/**
 * Determine overall health status
 */
function determineOverallStatus(checks) {
  const statuses = Object.values(checks).map(c => c.status)
  
  if (statuses.includes('unhealthy')) {
    return 'unhealthy'
  }
  if (statuses.includes('degraded')) {
    return 'degraded'
  }
  return 'healthy'
}

/**
 * Get overall health status code
 */
function getStatusCode(status) {
  switch (status) {
    case 'healthy':
      return 200
    case 'degraded':
      return 200 // Still OK but with warnings
    case 'unhealthy':
      return 503 // Service Unavailable
    case 'unconfigured':
      return 200 // Not critical
    default:
      return 500
  }
}

export async function GET(request) {
  try {
    const startTime = Date.now()

    // First check configuration
    const validation = validateConfig()
    if (!validation.isValid) {
      return NextResponse.json({
        status: 'unhealthy',
        configured: false,
        message: getConfigErrorMessage(),
        missing: validation.missing,
        errors: validation.errors,
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }

    // Run all health checks in parallel
    const [database, blockchain, email] = await Promise.all([
      checkDatabase(),
      checkBlockchain(),
      checkEmailService()
    ])

    const duration = Date.now() - startTime

    const checks = {
      database,
      blockchain,
      email
    }

    const overallStatus = determineOverallStatus(checks)
    const statusCode = getStatusCode(overallStatus)

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
      version: process.env.npm_package_version || '0.1.0',
      responseDuration: `${duration}ms`,
      environment: process.env.NODE_ENV,
      configured: true
    }

    logger.info(`Health check completed: ${overallStatus}`, { duration, statusCode })

    return NextResponse.json(response, { status: statusCode })
  } catch (error) {
    logger.critical('Health check endpoint failed', error)
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
