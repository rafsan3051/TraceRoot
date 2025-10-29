'use client'

import { useMemo, useRef } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, Copy } from 'lucide-react'

/**
 * QrCodeCard
 * Renders a QR code for a product with a version key that changes when events change.
 * Also provides a role-gated download button (disabled for CONSUMER and ADMIN).
 *
 * Props:
 * - productId: string
 * - versionKey: string | number (e.g., latest event ISO timestamp or updatedAt)
 * - size?: number (px)
 */
export default function QrCodeCard({ productId, versionKey, size = 128 }) {
  const { user } = useAuth()
  const codeRef = useRef(null)

  const qrValue = useMemo(() => {
    const isLocalHost = (url) => {
      try {
        const { hostname } = new URL(url)
        return (
          hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname === '0.0.0.0' ||
          hostname.endsWith('.local')
        )
      } catch {
        return false
      }
    }

    const envBase = process.env.NEXT_PUBLIC_APP_URL
    const browserBase = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : undefined

    // Priority:
    // 1) If env base exists and is NOT localhost, prefer it (works when dev uses localhost but QR must be public via ngrok)
    // 2) Else if browser origin exists and is NOT localhost, use it (when you browse via ngrok/LAN IP)
    // 3) Else fallback to whichever is available, else default localhost
    const base = envBase && !isLocalHost(envBase)
      ? envBase
      : (browserBase && !isLocalHost(browserBase) ? browserBase : (envBase || browserBase || 'http://localhost:3000'))

    const v = typeof versionKey === 'string' ? encodeURIComponent(versionKey) : String(versionKey)
    return `${base}/product/${productId}?v=${v}`
  }, [productId, versionKey])

  const canDownload = useMemo(() => {
    const role = user?.role
    return !!role && role !== 'CONSUMER' && role !== 'ADMIN'
  }, [user])

  const handleDownload = () => {
    if (!codeRef.current) return
    try {
      const canvas = codeRef.current.querySelector('canvas') || codeRef.current
      const dataUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      const versionSafe = String(versionKey).replace(/[^a-zA-Z0-9_.-]/g, '_')
      a.href = dataUrl
      a.download = `product-${productId}-v-${versionSafe}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (_) {
      // noop
    }
  }

  return (
    <div className="flex flex-col items-center sm:items-end space-y-2">
      <div
        ref={codeRef}
        className="p-2 rounded-md bg-white shadow-sm ring-1 ring-black/5"
        aria-label="Product verification QR code"
      >
        <QRCodeCanvas
          value={qrValue}
          size={size}
          includeMargin={true}
          bgColor="#ffffff"
          fgColor="#111827"
          className={size < 128 ? 'w-24 h-24' : 'w-32 h-32'}
        />
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground">Scan to verify</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(qrValue)}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs hover:bg-muted"
          aria-label="Copy QR link"
        >
          <Copy className="h-3.5 w-3.5" /> Copy link
        </button>
        {canDownload && (
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/50 hover:bg-muted transition text-xs sm:text-sm"
            aria-label="Download QR code"
          >
            <Download className="h-4 w-4" /> Download QR
          </button>
        )}
      </div>
    </div>
  )
}
