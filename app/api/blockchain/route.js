import { NextResponse } from 'next/server'
import { verifyTransaction, queryProductHistory } from '../../../lib/blockchain'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const txId = searchParams.get('txId')
    const productId = searchParams.get('productId')

    if (txId) {
      const verification = await verifyTransaction(txId)
      return NextResponse.json(verification)
    }

    if (productId) {
      const history = await queryProductHistory(productId)
      return NextResponse.json({ history })
    }

    return NextResponse.json(
      { error: 'Missing txId or productId parameter' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Blockchain verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify blockchain data' },
      { status: 500 }
    )
  }
}