export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { initChaincode } from '@/lib/blockchain'

export async function POST() {
  try {
    await initChaincode()
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
