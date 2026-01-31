'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, Copy, Printer } from 'lucide-react'
import { buildSecureQRValue } from '@/lib/qr/qr-token'
import { useLocale } from '@/lib/i18n/locale-context'
import { t } from '@/lib/i18n/translations'

/**
 * QrCodeCard
 * Renders a QR code for a product with a version key that changes when events change.
 * Also provides a role-gated download button (disabled for CONSUMER and ADMIN).
 *
 * Props:
 * - productId: string
 * - versionKey: string | number (e.g., latest event ISO timestamp or updatedAt)
 * - size?: number (px)
 * - printMode?: boolean (use high-res, high ECC)
 */
export default function QrCodeCard({ 
  productId, 
  versionKey, 
  size = 128,
  printMode = false 
}) {
  const { user } = useAuth()
  const { locale } = useLocale()
  const codeRef = useRef(null)
  const [qrValue, setQrValue] = useState('')
  const [isGenerating, setIsGenerating] = useState(true)

  // Generate signed QR value
  useEffect(() => {
    async function generateQR() {
      try {
        // Fallback to simple URL (no signed token without product data)
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

        const base = envBase && !isLocalHost(envBase)
          ? envBase
          : (browserBase && !isLocalHost(browserBase) ? browserBase : (envBase || browserBase || 'http://localhost:3000'))

        const v = typeof versionKey === 'string' ? encodeURIComponent(versionKey) : String(versionKey)
        setQrValue(`${base}/verify/${productId}?v=${v}`)
      } catch (error) {
        console.error('Failed to generate QR:', error)
        // Fallback to simple URL on error
        const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
        const v = typeof versionKey === 'string' ? encodeURIComponent(versionKey) : String(versionKey)
        setQrValue(`${base}/verify/${productId}?v=${v}`)
      } finally {
        setIsGenerating(false)
      }
    }

    generateQR()
  }, [productId, versionKey])

  const qrSize = printMode ? 512 : size
  const eccLevel = printMode ? 'H' : 'M'

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

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center sm:items-end space-y-2">
        <div className="p-2 rounded-md bg-white shadow-sm ring-1 ring-black/5 w-32 h-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
        <p className="text-xs text-muted-foreground">{t(locale, 'product.qrGenerating')}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center sm:items-end space-y-2">
      <div
        ref={codeRef}
        className="p-2 rounded-md bg-white shadow-sm ring-1 ring-black/5"
        aria-label={t(locale, 'product.qrCode')}
      >
        <QRCodeCanvas
          value={qrValue}
          size={qrSize}
          level={eccLevel}
          includeMargin={true}
          bgColor="#ffffff"
          fgColor="#111827"
          className={qrSize < 128 ? 'w-24 h-24' : qrSize > 256 ? 'w-full h-full' : 'w-32 h-32'}
        />
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground">
        {t(locale, 'common.scanToVerify')}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(qrValue)}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs hover:bg-muted"
          aria-label={t(locale, 'product.copyQrLink')}
        >
          <Copy className="h-3.5 w-3.5" /> {t(locale, 'common.copyLink')}
        </button>
        {canDownload && (
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border bg-muted/50 hover:bg-muted transition text-xs sm:text-sm"
            aria-label={t(locale, 'product.downloadQR')}
          >
            <Download className="h-4 w-4" /> {t(locale, 'product.downloadQR')}
          </button>
        )}
      </div>
    </div>
  )
}
