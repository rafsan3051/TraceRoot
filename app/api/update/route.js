import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { recordToBlockchain } from '../../../lib/blockchain'
import { getSession } from '../../../lib/auth/auth-utils'
import { notifyWatchers } from '@/lib/notifications/notify'
import { createAuditLog, getAuditMetadata } from '@/lib/audit/audit-log'

export async function POST(request) {
  try {
    const data = await request.json()
    const { productId, eventType, location, latitude, longitude, locationAccuracy } = data

    // Get current user session
    const session = await getSession()
    const userId = session?.id || null

    // Record to blockchain with complete event data
    const blockchainTxId = await recordToBlockchain({
      id: String(Date.now()) + Math.random().toString(36).substr(2, 9),
      name: `Supply Chain Event - ${eventType}`,
      origin: location || 'Unknown Location',
      category: eventType,
      manufacturer: userId || 'System',
      mfgDate: new Date().toISOString(),
      productId,
      eventType,
      location,
      latitude: latitude || null,
      longitude: longitude || null,
      locationAccuracy: locationAccuracy || null,
      userId,
      recordedAt: new Date().toISOString()
    })

    // Create event in database
    const event = await prisma.supplyChainEvent.create({
      data: {
        productId,
        eventType,
        location,
        blockchainTxId,
        latitude: latitude || null,
        longitude: longitude || null,
        locationAccuracy: locationAccuracy || null,
        userId
      },
      include: {
        product: true
      }
    })

    // Audit log
    const { ipAddress, userAgent } = getAuditMetadata(request)
    await createAuditLog({
      userId,
      action: 'CREATE_EVENT',
      entityType: 'SupplyChainEvent',
      entityId: event.id,
      changes: { after: { eventType, location, productId } },
      ipAddress,
      userAgent,
    })

    // Notify watchers asynchronously (don't block response)
    notifyWatchers(productId, eventType, {
      productId,
      eventId: event.id,
      description: `${eventType} at ${location}`,
      timestamp: event.timestamp,
      location,
    }).catch(err => console.error('Notification failed:', err))

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}