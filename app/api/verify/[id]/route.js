/**
 * Public API endpoint for verifying products without authentication
 * GET /api/verify/[id]
 * Returns minimal product info and event summary
 */

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    // Await params for Next.js 15+
    const resolvedParams = await params
    const { id } = resolvedParams

    console.log('🔍 Verify API called for product ID:', id)

    // Fetch product with includes
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        farmer: true,
        events: true
      }
    })

    console.log('📦 Product found:', product ? 'Yes' : 'No')
    if (product) {
      console.log('   - Name:', product.name)
      console.log('   - Farmer:', product.farmer ? product.farmer.name : 'None')
      console.log('   - Events count:', product.events ? product.events.length : 0)
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Sort events by timestamp descending
    const sortedEvents = (product.events || []).sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    ).slice(0, 10)

    // Build response
    return NextResponse.json({
      success: true,
      data: {
        product: {
          id: product.id,
          name: product.name,
          category: product.category || 'Uncategorized',
          origin: product.origin,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          manufactureDate: product.manufactureDate,
          blockchainTxId: product.blockchainTxId,
          latitude: product.latitude,
          longitude: product.longitude,
          locationAccuracy: product.locationAccuracy,
          price: product.price ? Number(product.price) : 0,
          creator: product.farmer ? {
            name: product.farmer.name,
            role: product.farmer.role
          } : null,
        },
        events: sortedEvents.map((event) => ({
          id: event.id,
          type: event.eventType,
          timestamp: event.timestamp,
          location: event.location,
          latitude: event.latitude,
          longitude: event.longitude,
          locationAccuracy: event.locationAccuracy,
          blockchainTxId: event.blockchainTxId,
        })),
        eventCount: sortedEvents.length,
      },
      verifiedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('❌ Verify API error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
