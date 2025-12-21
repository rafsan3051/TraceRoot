import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth/auth-utils'
import { getLatestPrice, getPriceHistory, updatePrice as updateOnchainPrice } from '@/lib/blockchain-price'

export const runtime = 'nodejs'

function ok(data, status = 200) {
  return NextResponse.json(data, { status })
}

function err(message, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const productId = resolvedParams.id

    // Get DB price first (source of truth in mock mode)
    let dbPrice = null
    let productDoc = null
    try {
      productDoc = await prisma.product.findUnique({ where: { id: productId } })
      dbPrice = productDoc?.price ? Number(productDoc.price) : 0
    } catch (dbErr) {
      console.error('⚠️ DB query failed:', dbErr)
    }

    // Attempt to read on-chain latest price and history
    const [latest, history] = await Promise.all([
      getLatestPrice(productId),
      getPriceHistory(productId)
    ])

    // Use blockchain price if available and > 0, otherwise use DB price
    const displayPrice = (latest.price && latest.price > 0) ? latest.price : dbPrice

    // Build off-chain history from audit logs when blockchain history is unavailable/empty
    let offchainHistory = []
    try {
      const logs = await prisma.auditLog.findMany({
        where: { productId, type: 'PRICE_UPDATE' },
        orderBy: { createdAt: 'desc' }
      })

      offchainHistory = Array.isArray(logs) ? logs.map((log) => {
        // Extract numeric price from message like "Price updated to 12.34"
        const match = String(log.message || '').match(/([0-9]+(?:\.[0-9]+)?)/)
        const priceVal = match ? Number(match[1]) : null
        const ts = log.createdAt ? Math.floor(new Date(log.createdAt).getTime() / 1000) : Math.floor(Date.now() / 1000)
        return {
          price: priceVal ?? dbPrice ?? 0,
          notes: log.notes || '',
          timestamp: ts
        }
      }) : []

      // Include initial registration price as first record if present
      if (productDoc && productDoc.price) {
        const initialTs = productDoc.createdAt ? Math.floor(new Date(productDoc.createdAt).getTime() / 1000) : Math.floor(Date.now() / 1000)
        offchainHistory.push({
          price: Number(productDoc.price),
          notes: 'Registered',
          timestamp: initialTs
        })
        // Sort descending by timestamp to match UI expectation
        offchainHistory.sort((a, b) => b.timestamp - a.timestamp)
      }
    } catch (logErr) {
      // Non-fatal; history may remain empty in mock mode
      console.warn('⚠️ Failed to build off-chain price history:', logErr)
    }

    return ok({
      productId,
      latestPrice: displayPrice,
      latestSource: (latest.price && latest.price > 0) ? latest.source : 'database',
      // Prefer on-chain history when available, else use off-chain audit history
      priceHistory: (Array.isArray(history.history) && history.history.length > 0) ? history.history : offchainHistory,
      historySource: (Array.isArray(history.history) && history.history.length > 0) ? history.source : 'database',
      dbPrice,
      blockchainPrice: latest.price
    })
  } catch (error) {
    console.error('GET /api/price/[id] error:', error)
    return err('unavailable', 500)
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getSession()
    if (!session?.id) return err('Unauthorized', 401)

    // Role gating: allow non-consumer roles to edit price
    const user = await prisma.user.findUnique({ where: { id: session.id } })
    if (!user || ['CONSUMER'].includes(user.role)) return err('Forbidden', 403)

    const resolvedParams = await params
    const productId = resolvedParams.id
    
    // Verify product exists and check ownership
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return err('Product not found', 404)
    
    // Check if user owns the product (unless admin)
    if (user.role !== 'ADMIN') {
      const ownerId = product.farmerId?.toString?.() ?? String(product.farmerId)
      const userId = String(session.id)
      if (ownerId !== userId) {
        return err('Forbidden: You can only update prices for your own products', 403)
      }
    }
    
    const body = await request.json()
    const newPrice = Number(body?.price)
    const notes = String(body?.notes || '')
    if (!Number.isFinite(newPrice) || newPrice < 0) return err('Invalid price', 422)

    // On-chain update (graceful fallback)
    const result = await updateOnchainPrice(productId, newPrice, notes)

    // Mirror price off-chain for UI convenience (safe, non-blocking)
    try {
      await prisma.product.update({ where: { id: productId }, data: { price: newPrice } })
      await prisma.auditLog.create({
        data: {
          type: 'PRICE_UPDATE',
          message: `Price updated to ${newPrice}`,
          notes,
          userId: session.id,
          productId
        }
      })
    } catch (dbErr) {
      console.error('⚠️ DB update failed:', dbErr)
      // ignore DB errors; do not fail request
    }

    return ok({ 
      success: true,
      updated: result.updated, 
      txHash: result.txHash, 
      source: result.source,
      newPrice
    })
  } catch (error) {
    console.error('POST /api/price/[id] error:', error)
    return err('Server error', 500)
  }
}
