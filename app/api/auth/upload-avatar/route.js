import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/auth-utils'
import prisma from '@/lib/prisma'
import path from 'path'
import { promises as fs } from 'fs'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const session = await getSession()
    if (!session?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase()
    const filename = `${randomUUID()}.${ext}`
    const filePath = path.join(uploadsDir, filename)

    await fs.writeFile(filePath, buffer)

    const publicUrl = `/uploads/${filename}`

    await prisma.user.update({
      where: { id: session.id },
      data: { profileImage: publicUrl },
    })

    return NextResponse.json({ success: true, url: publicUrl })
  } catch (error) {
    console.error('Upload avatar error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
