import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { recordToBlockchain } from '../../../lib/blockchain'
import { getSession } from '../../../lib/auth/auth-utils'

export async function POST(request) {
  try {
    const data = await request.json()
    const { name, origin, manufactureDate, latitude, longitude, locationAccuracy, price, category, description } = data

    // Input validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 })
    }
    if (!origin || !origin.trim()) {
      return NextResponse.json({ error: 'Product origin is required' }, { status: 400 })
    }
    if (!manufactureDate) {
      return NextResponse.json({ error: 'Manufacture date is required' }, { status: 400 })
    }

    // Verify session and permissions
    const session = await getSession()
    if (!session || !session.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user is verified
    const user = await prisma.user.findUnique({ where: { id: session.id } })
    if (!user || !user.verified) {
      return NextResponse.json({ error: 'Account not verified' }, { status: 403 })
    }

    if (user.role !== 'FARMER') {
      return NextResponse.json({ error: 'Only farmers can register products' }, { status: 403 })
    }

    // Record to blockchain with location data
    const blockchainTxId = await recordToBlockchain({
      type: 'PRODUCT_CREATION',
      data: { 
        name, 
        origin, 
        manufactureDate,
        latitude: latitude || null,
        longitude: longitude || null,
        locationAccuracy: locationAccuracy || null
      }
    })

    // Create product in database
    const product = await prisma.product.create({
      data: {
        name,
        origin,
        manufactureDate: new Date(manufactureDate),
        blockchainTxId,
        qrCodeUrl: null, // Will be updated after creation
        farmerId: user.id,
        price: price ? Number(price) : 0,
        category: category || 'Uncategorized',
        latitude: latitude || null,
        longitude: longitude || null,
        locationAccuracy: locationAccuracy || null
      }
    })

    // Generate QR code URL
    const qrCodeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/product/${product.id}`
    
    // Update product with QR code URL
    await prisma.product.update({
      where: { id: product.id },
      data: { qrCodeUrl }
    })

    return NextResponse.json({ 
      success: true, 
      product: { ...product, qrCodeUrl } 
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const includeHiddenParam = url.searchParams.get('includeHidden')
    const includeHidden = includeHiddenParam === '1' || includeHiddenParam === 'true'

    let where = { hidden: { $ne: true } }

    if (includeHidden) {
      // Only admins can view hidden products list
      const session = await getSession()
      if (!session?.id) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      const user = await prisma.user.findUnique({ where: { id: session.id } })
      if (user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Admin access required to view hidden products' }, { status: 403 })
      }
      where = {} // Include all products, hidden and visible
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        events: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Convert Decimal to number for JSON serialization
    const serializedProducts = products.map(product => ({
      ...product,
      price: product.price ? Number(product.price) : 0
    }))

    return NextResponse.json({ products: serializedProducts })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}