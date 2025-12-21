import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth/auth-utils'

export async function POST(request, { params }) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const productId = resolvedParams.id

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } })
    
    // Convert both IDs to strings for comparison (handle MongoDB ObjectId)
    let ownerId = product.farmerId
    if (ownerId && typeof ownerId === 'object' && ownerId.toString) {
      ownerId = ownerId.toString()
    } else {
      ownerId = String(ownerId)
    }
    
    const sessionId = String(session.id)
    const isOwner = ownerId === sessionId
    const isAdmin = user?.role === 'ADMIN'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ 
        error: 'Forbidden: You can only unhide your own products' 
      }, { status: 403 })
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        hidden: false,
        hiddenAt: null,
        hiddenBy: null
      }
    })

    await prisma.auditLog.create({
      data: {
        type: 'PRODUCT_UNHIDDEN',
        message: `Product "${product.name}" has been restored to public view`,
        userId: session.id,
        productId: productId
      }
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Product has been unhidden successfully',
      product: updated
    })
  } catch (error) {
    console.error('POST /api/product/[id]/unhide error:', error)
    return NextResponse.json(
      { error: 'Failed to unhide product' },
      { status: 500 }
    )
  }
}
