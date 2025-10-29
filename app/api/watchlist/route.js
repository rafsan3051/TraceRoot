/**
 * Watchlist API endpoints
 * Allows users to watch products and get notified on changes
 */

import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'
import { verifyAuth } from '@/lib/auth/verify-auth'

export const dynamic = 'force-dynamic'

// GET /api/watchlist - Get user's watched products
export async function GET(request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const watches = await prisma.productWatch.findMany({
      where: { userId: auth.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            status: true,
            imageUrl: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: watches })
  } catch (error) {
    console.error('Watchlist GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/watchlist - Add product to watchlist
export async function POST(request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, notifyEmail = true, notifyPush = false } = body

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Create or update watch
    const watch = await prisma.productWatch.upsert({
      where: {
        userId_productId: {
          userId: auth.user.id,
          productId,
        },
      },
      create: {
        userId: auth.user.id,
        productId,
        notifyEmail,
        notifyPush,
      },
      update: {
        notifyEmail,
        notifyPush,
      },
    })

    return NextResponse.json({ success: true, data: watch })
  } catch (error) {
    console.error('Watchlist POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/watchlist?productId=xxx - Remove product from watchlist
export async function DELETE(request) {
  try {
    const auth = await verifyAuth(request)
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    await prisma.productWatch.deleteMany({
      where: {
        userId: auth.user.id,
        productId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Watchlist DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
