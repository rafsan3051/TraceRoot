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

    // Verify product exists and user is the owner
    const product = await prisma.product.findUnique({ where: { id: productId } })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Authorize: owner farmer or admin may hide
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
      console.log('Authorization failed:', {
        ownerId,
        sessionId,
        userRole: user?.role,
        message: 'You can only hide your own products unless you are an admin'
      })
      return NextResponse.json({ 
        error: 'Forbidden: You can only hide your own products' 
      }, { status: 403 })
    }

    // Soft delete: mark as hidden instead of deleting
    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        hidden: true,
        hiddenAt: new Date(),
        hiddenBy: session.id
      }
    })

    // Log the deletion action
    await prisma.auditLog.create({
      data: {
        type: 'PRODUCT_HIDDEN',
        message: `Product "${product.name}" has been hidden from public view`,
        userId: session.id,
        productId: productId
      }
    }).catch(() => {
      // Ignore audit log errors
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Product has been hidden successfully',
      product: updated 
    })
  } catch (error) {
    console.error('DELETE /api/product/[id]/delete error:', error)
    return NextResponse.json(
      { error: 'Failed to hide product' },
      { status: 500 }
    )
  }
}
