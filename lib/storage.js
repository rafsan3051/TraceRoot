import { randomUUID } from 'crypto'
import path from 'path'
import { promises as fs } from 'fs'

// Best-effort dynamic imports to avoid bundling when not used
async function tryImportVercelBlob() {
  try {
    const mod = await import('@vercel/blob')
    return mod
  } catch {
    return null
  }
}

async function tryImportS3() {
  try {
    const mod = await import('@aws-sdk/client-s3')
    return mod
  } catch {
    return null
  }
}

function getExt(filename, fallback = 'jpg') {
  const raw = filename?.split('.')?.pop()?.toLowerCase()
  return raw && raw.length <= 5 ? raw : fallback
}

export async function saveAvatar({ buffer, filename, contentType }) {
  const ext = getExt(filename)
  const key = `avatars/${randomUUID()}.${ext}`

  // 1) Prefer Vercel Blob when token available (production on Vercel)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await tryImportVercelBlob()
    if (!blob) throw new Error('Vercel Blob SDK not installed')
    const { put } = blob
    const res = await put(key, buffer, {
      access: 'public',
      contentType: contentType || 'application/octet-stream',
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    return { url: res.url }
  }

  // 2) Fallback to S3 if configured
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET) {
    const s3mod = await tryImportS3()
    if (!s3mod) throw new Error('AWS SDK not installed')
    const { S3Client, PutObjectCommand } = s3mod
    const client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' })
    const put = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
      ACL: 'public-read',
    })
    await client.send(put)
    const region = process.env.AWS_REGION || 'us-east-1'
    const base = `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com`
    return { url: `${base}/${key}` }
  }

  // 3) Local dev fallback to public/uploads (non-persistent in serverless)
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadsDir, { recursive: true })
  const filenameOut = key.split('/').pop()
  const filePath = path.join(uploadsDir, filenameOut)
  await fs.writeFile(filePath, buffer)
  return { url: `/uploads/${filenameOut}` }
}
