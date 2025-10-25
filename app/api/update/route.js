import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { recordToBlockchain } from '../../../lib/blockchain'

export async function POST(request) {
  try {
    const data = await request.json()
    const { productId, eventType, location } = data

    // Record to blockchain
    const blockchainTxId = await recordToBlockchain({
      type: 'SUPPLY_CHAIN_EVENT',
      data: { productId, eventType, location }
    })

    // Create event in database
    const event = await prisma.supplyChainEvent.create({
      data: {
        productId,
        eventType,
        location,
        blockchainTxId
      },
      include: {
        product: true
      }
    })

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}