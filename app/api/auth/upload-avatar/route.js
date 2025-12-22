import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/auth-utils'
import prisma from '@/lib/prisma'
import { saveAvatar } from '@/lib/storage'

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

    const { url: publicUrl } = await saveAvatar({
      buffer,
      filename: file.name,
      contentType: file.type,
    })

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
