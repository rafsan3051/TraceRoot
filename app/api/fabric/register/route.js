// Registers a product on Fabric using lib/blockchain.js
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { recordToBlockchain } from '@/lib/blockchain'

export async function POST(req) {
  try {
    const body = await req.json()
    const txId = await recordToBlockchain(body)
    return NextResponse.json({ txId })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
