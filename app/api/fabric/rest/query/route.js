// Next.js API route to query Fabric via Kaleido REST
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { fn, args = [] } = await req.json()
    if (!fn) return NextResponse.json({ error: 'fn required' }, { status: 400 })
    const { query } = await import('../../../../../lib/fabric-rest.js')
    const result = await query(fn, args)
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
