// Registers a product on Fabric using lib/blockchain.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { recordToBlockchain } from '@/lib/blockchain'

export async function POST(req) {
  try {
    const body = await req.json()
    
    // Validate input
    if (!body.name || !body.origin) {
      return NextResponse.json(
        { error: 'Product name and origin are required' },
        { status: 400 }
      )
    }
    
    console.log('📝 Fabric register endpoint received:', { name: body.name, origin: body.origin })
    
    const txId = await recordToBlockchain(body)
    
    console.log('✅ Fabric register endpoint returning txId:', txId)
    
    return NextResponse.json({ 
      success: true,
      txId,
      message: 'Product registered on blockchain'
    })
  } catch (error) {
    console.error('❌ Fabric register endpoint error:', error.message)
    return NextResponse.json(
      { 
        error: 'Failed to register product on blockchain',
        message: error.message 
      }, 
      { status: 500 }
    )
  }
}

