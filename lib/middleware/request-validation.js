/**
 * Request Validation Middleware
 * 
 * Validates request bodies, query parameters, and headers
 * Uses Zod for schema validation
 */

import { z } from 'zod'
import { NextResponse } from 'next/server'
import { createValidationError } from '@/lib/api-error-handler'

/**
 * Validate request body against schema
 */
export async function validateRequestBody(request, schema) {
  try {
    const body = await request.clone().json()
    const result = schema.safeParse(body)

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      throw createValidationError(errors)
    }

    return result.data
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.flatten().fieldErrors
      throw createValidationError(errors)
    }
    throw error
  }
}

/**
 * Validate query parameters against schema
 */
export function validateQueryParams(request, schema) {
  const { searchParams } = new URL(request.url)
  const params = Object.fromEntries(searchParams)

  const result = schema.safeParse(params)

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    throw createValidationError(errors)
  }

  return result.data
}

/**
 * Validate request headers against schema
 */
export function validateHeaders(request, schema) {
  const headers = {}
  for (const [key, value] of request.headers) {
    headers[key] = value
  }

  const result = schema.safeParse(headers)

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    throw createValidationError(errors)
  }

  return result.data
}

/**
 * Middleware to validate request with schema
 */
export function withValidation(schemas = {}) {
  return (handler) => {
    return async (request, context) => {
      try {
        // Validate body if schema provided
        if (schemas.body && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
          try {
            const bodyText = await request.clone().text()
            if (!bodyText || bodyText.trim() === '') {
              throw createValidationError({ body: 'Request body is required' })
            }
            const bodyObj = JSON.parse(bodyText)
            const result = schemas.body.safeParse(bodyObj)
            
            if (!result.success) {
              const errors = result.error.flatten().fieldErrors
              throw createValidationError(errors)
            }
            
            request.validatedBody = result.data
          } catch (parseError) {
            if (parseError.code === 'VALIDATION_ERROR') {
              throw parseError
            }
            throw createValidationError({ body: 'Invalid JSON in request body' })
          }
        }

        // Validate query if schema provided
        if (schemas.query && ['GET', 'DELETE'].includes(request.method)) {
          const validatedQuery = validateQueryParams(request, schemas.query)
          request.validatedQuery = validatedQuery
        }

        // Validate headers if schema provided
        if (schemas.headers) {
          const validatedHeaders = validateHeaders(request, schemas.headers)
          request.validatedHeaders = validatedHeaders
        }

        return handler(request, context)
      } catch (error) {
        if (error.code === 'VALIDATION_ERROR') {
          const errorResponse = {
            success: false,
            error: {
              code: error.code,
              message: error.message,
              timestamp: new Date().toISOString()
            }
          }
          if (process.env.NODE_ENV === 'development' && error.details) {
            errorResponse.error.details = error.details
          }
          return NextResponse.json(errorResponse, { status: 400 })
        }
        throw error
      }
    }
  }
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  // Authentication
  login: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  }),

  register: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['FARMER', 'DISTRIBUTOR', 'RETAILER', 'CONSUMER']),
    username: z.string().optional()
  }),

  // Product
  product: z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().optional(),
    category: z.string().optional(),
    price: z.number().positive('Price must be positive').optional(),
    quantity: z.number().int().positive('Quantity must be positive').optional(),
    location: z.string().optional(),
    sku: z.string().optional()
  }),

  // Supply Chain Event
  supplyChainEvent: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    status: z.enum(['Created', 'InTransit', 'Delivered', 'Verified']),
    location: z.string().optional(),
    notes: z.string().optional(),
    timestamp: z.number().optional()
  }),

  // Price Update
  priceUpdate: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    price: z.number().positive('Price must be positive'),
    notes: z.string().optional()
  }),

  // Pagination
  pagination: z.object({
    page: z.string().transform(v => parseInt(v, 10)).pipe(z.number().int().positive()).optional().default('1'),
    limit: z.string().transform(v => parseInt(v, 10)).pipe(z.number().int().positive().max(100)).optional().default('20'),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('desc')
  })
}

/**
 * Create custom validation schema
 */
export function createSchema(fields) {
  return z.object(fields)
}

const requestValidationExports = {
  validateRequestBody,
  validateQueryParams,
  validateHeaders,
  withValidation,
  CommonSchemas,
  createSchema
}

export default requestValidationExports
