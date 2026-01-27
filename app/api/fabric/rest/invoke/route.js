// Next.js API route to invoke Fabric via Kaleido REST
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { fn, args = [], transient } = await req.json()
    if (!fn) return NextResponse.json({ error: 'fn required' }, { status: 400 })
    const { invoke } = await import('../../../../../lib/fabric-rest.js')
    const result = await invoke(fn, args, transient)
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
