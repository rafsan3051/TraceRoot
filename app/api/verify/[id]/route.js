/**
 * Public API endpoint for verifying products without authentication
 * GET /api/verify/[id]
 * Returns minimal product info and event summary
 */

import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { checkRateLimit, getClientIP } from '@/lib/api/rate-limit'
import { verifyQRToken } from '@/lib/qr/qr-token'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    const rateLimit = checkRateLimit(clientIP)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
            'Retry-After': Math.ceil((rateLimit.reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const { id } = params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('t')

    // Optional: verify token if provided
    if (token) {
      try {
        const payload = await verifyQRToken(token)
        if (payload.productId !== id) {
          return NextResponse.json(
            { error: 'Token does not match product ID' },
            { status: 403 }
          )
        }
      } catch (error) {
        // Token invalid but continue - allows URL to work even after token expires
        console.warn('QR token verification failed:', error.message)
      }
    }

    // Fetch product with minimal info
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        origin: true,
        images: true,
        currentLocation: {
          select: {
            latitude: true,
            longitude: true,
            address: true,
          },
        },
        events: {
          select: {
            id: true,
            type: true,
            timestamp: true,
            description: true,
            location: {
              select: {
                latitude: true,
                longitude: true,
                address: true,
              },
            },
            actor: {
              select: {
                name: true,
                role: true,
              },
            },
          },
          orderBy: { timestamp: 'desc' },
          take: 10, // Last 10 events only
        },
        creator: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Build response with cache headers
    const response = NextResponse.json(
      {
        success: true,
        data: {
          product: {
            id: product.id,
            name: product.name,
            category: product.category,
            description: product.description,
            status: product.status,
            origin: product.origin,
            images: product.images,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            currentLocation: product.currentLocation,
            creator: product.creator,
          },
          events: product.events.map((event) => ({
            id: event.id,
            type: event.type,
            timestamp: event.timestamp,
            description: event.description,
            location: event.location,
            actor: event.actor,
          })),
          eventCount: product.events.length,
        },
        verifiedAt: new Date().toISOString(),
      },
      {
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )

    return response
  } catch (error) {
    console.error('Verify API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
