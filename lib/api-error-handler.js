/**
 * Standardized API Error Handler
 * 
 * Provides consistent error responses across all API routes
 * with proper logging, error codes, and messages
 */

import { NextResponse } from 'next/server'

// Error severity levels
const ErrorLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
}

// Standard API error codes
const ApiErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVER_ERROR: 'SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  BLOCKCHAIN_ERROR: 'BLOCKCHAIN_ERROR'
}

// HTTP status codes mapping
const HTTP_STATUS_CODES = {
  [ApiErrorCode.VALIDATION_ERROR]: 400,
  [ApiErrorCode.UNAUTHORIZED]: 401,
  [ApiErrorCode.FORBIDDEN]: 403,
  [ApiErrorCode.NOT_FOUND]: 404,
  [ApiErrorCode.CONFLICT]: 409,
  [ApiErrorCode.RATE_LIMIT]: 429,
  [ApiErrorCode.SERVER_ERROR]: 500,
  [ApiErrorCode.DATABASE_ERROR]: 503,
  [ApiErrorCode.EXTERNAL_SERVICE_ERROR]: 503,
  [ApiErrorCode.BLOCKCHAIN_ERROR]: 503
}

/**
 * Log error with context
 */
function logError(code, message, level, context = {}) {
  const timestamp = new Date().toISOString()
  const errorLog = {
    timestamp,
    code,
    message,
    level,
    context,
    env: process.env.NODE_ENV
  }

  // Log to console
  console.error(`[${level}] [${code}] ${message}`, context)

  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with Sentry, LogRocket, or similar
    // Example: Sentry.captureException(new Error(message), { contexts: { api: context } })
  }

  return errorLog
}

/**
 * Create standardized error response
 */
export class ApiError extends Error {
  constructor(code, message, statusCode = null, details = {}) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.statusCode = statusCode || HTTP_STATUS_CODES[code] || 500
    this.details = details
    this.timestamp = new Date().toISOString()
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        timestamp: this.timestamp,
        ...(process.env.NODE_ENV === 'development' && { details: this.details })
      }
    }
  }
}

/**
 * Handle API errors and return standardized response
 */
export async function handleApiError(error, request = null) {
  let apiError

  if (error instanceof ApiError) {
    apiError = error
  } else if (error.name === 'ValidationError' || error.name === 'ZodError') {
    // Handle Zod validation errors
    apiError = new ApiError(
      ApiErrorCode.VALIDATION_ERROR,
      'Request validation failed',
      400,
      { errors: error.errors || error.message }
    )
  } else if (error.message?.includes('DATABASE_URL')) {
    apiError = new ApiError(
      ApiErrorCode.DATABASE_ERROR,
      'Database connection error',
      503,
      { details: 'MongoDB connection failed' }
    )
  } else if (error.message?.includes('blockchain') || error.message?.includes('fabric')) {
    apiError = new ApiError(
      ApiErrorCode.BLOCKCHAIN_ERROR,
      'Blockchain service unavailable',
      503,
      { service: 'blockchain' }
    )
  } else {
    // Unknown error
    apiError = new ApiError(
      ApiErrorCode.SERVER_ERROR,
      process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      500,
      { originalError: error.message }
    )
  }

  // Determine log level
  const level = apiError.statusCode >= 500 ? ErrorLevel.ERROR : ErrorLevel.WARN

  // Log the error
  logError(apiError.code, apiError.message, level, {
    statusCode: apiError.statusCode,
    url: request?.url,
    method: request?.method,
    details: apiError.details
  })

  const errorResponse = {
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
      timestamp: apiError.timestamp
    }
  }
  
  if (process.env.NODE_ENV === 'development' && apiError.details) {
    errorResponse.error.details = apiError.details
  }

  return NextResponse.json(errorResponse, { status: apiError.statusCode })
}

/**
 * Wrap async route handlers with error handling
 */
export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleApiError(error, request)
    }
  }
}

/**
 * Create validation error
 */
export function createValidationError(errors) {
  return new ApiError(
    ApiErrorCode.VALIDATION_ERROR,
    'Request validation failed',
    400,
    { errors }
  )
}

/**
 * Create unauthorized error
 */
export function createUnauthorizedError(message = 'Unauthorized') {
  return new ApiError(ApiErrorCode.UNAUTHORIZED, message, 401)
}

/**
 * Create forbidden error
 */
export function createForbiddenError(message = 'Access forbidden') {
  return new ApiError(ApiErrorCode.FORBIDDEN, message, 403)
}

/**
 * Create not found error
 */
export function createNotFoundError(resource) {
  return new ApiError(
    ApiErrorCode.NOT_FOUND,
    `${resource} not found`,
    404
  )
}

/**
 * Create rate limit error
 */
export function createRateLimitError(retryAfter = 60) {
  return new ApiError(
    ApiErrorCode.RATE_LIMIT,
    'Rate limit exceeded',
    429,
    { retryAfter }
  )
}

/**
 * Create database error
 */
export function createDatabaseError(details = 'Database operation failed') {
  return new ApiError(
    ApiErrorCode.DATABASE_ERROR,
    'Database error',
    503,
    { details }
  )
}

/**
 * Create blockchain error
 */
export function createBlockchainError(details = 'Blockchain service unavailable') {
  return new ApiError(
    ApiErrorCode.BLOCKCHAIN_ERROR,
    'Blockchain error',
    503,
    { details }
  )
}

export { ApiErrorCode, ErrorLevel }
