import { NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params

    // Try direct ID first
    let product = await prisma.product.findUnique({
      where: { id },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
            verified: true
          }
        },
        events: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    })

    // If not found by ID, try blockchain reference
    if (!product) {
      product = await prisma.product.findUnique({
        where: { blockchainTxId: id },
        include: {
          farmer: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
              verified: true
            }
          },
          events: {
            orderBy: {
              timestamp: 'desc'
            }
          }
        }
      })
    }

    // If still not found, search in events
    if (!product) {
      const event = await prisma.event.findFirst({
        where: { blockchainTxId: id }
      })
      if (event) {
        product = await prisma.product.findUnique({
          where: { id: event.productId },
          include: {
            farmer: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                verified: true
              }
            },
            events: {
              orderBy: {
                timestamp: 'desc'
              }
            }
          }
        })
      }
    }


    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Convert Decimal to number for JSON serialization
    const serializedProduct = {
      ...product,
      price: product.price ? Number(product.price) : 0
    }

    return NextResponse.json({ product: serializedProduct })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
