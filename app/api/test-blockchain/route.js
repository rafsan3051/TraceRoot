import { NextResponse } from 'next/server'
import { recordToBlockchain } from '../../../lib/blockchain'

export async function POST(request) {
  try {
    const data = await request.json()
    
    console.log('🧪 TEST: Recording to blockchain:', data.name)
    
    const blockchainTxId = await recordToBlockchain({
      id: String(Date.now()) + Math.random().toString(36).substr(2, 9),
      name: data.name || 'Test Product',
      origin: data.origin || 'Test Farm',
      category: data.category || 'Test',
      manufacturer: 'Test User',
      mfgDate: new Date().toISOString(),
      description: data.description || 'Test product for blockchain validation'
    })
    
    console.log('🧪 TEST: Blockchain TX ID:', blockchainTxId)
    
    return NextResponse.json({
      success: true,
      blockchainTxId,
      message: 'Test blockchain record created successfully'
    })
  } catch (error) {
    console.error('🧪 TEST: Blockchain error:', error.message)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
