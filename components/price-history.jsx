"use client"
import { useEffect, useState } from 'react'
import { useLocale } from '@/lib/i18n/locale-context'
import { t, formatCurrency } from '@/lib/i18n/translations'

export default function PriceHistory({ productId, canEdit = false }) {
  const { locale } = useLocale()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [latest, setLatest] = useState(null)
  const [history, setHistory] = useState([])
  const [dbPrice, setDbPrice] = useState(null)
  const [formPrice, setFormPrice] = useState('')
  const [formNotes, setFormNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchData() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/price/${productId}`)
      const data = await res.json()
      setLatest(data.latestPrice ?? null)
      setHistory(Array.isArray(data.priceHistory) ? data.priceHistory : [])
      setDbPrice(data.dbPrice ?? null)
    } catch (_) {
      setError(t(locale, 'product.priceLoadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [productId])

  async function submitUpdate() {
    try {
      setSaving(true)
      setError(null)
      const priceNum = Number(formPrice)
      if (!Number.isFinite(priceNum) || priceNum < 0) {
        setError(t(locale, 'product.priceInvalid'))
        setSaving(false)
        return
      }
      const res = await fetch(`/api/price/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: priceNum, notes: formNotes })
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || t(locale, 'product.priceUpdateFailed'))
      } else {
        setFormPrice('')
        setFormNotes('')
        setTimeout(() => fetchData(), 500)
      }
    } catch (err) {
      setError(t(locale, 'product.priceUpdateFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg sm:text-xl font-semibold">{t(locale, 'product.price')}</h2>
      {loading ? (
        <p className="text-muted-foreground">{t(locale, 'product.priceLoading')}</p>
      ) : error ? (
        <p className="text-red-500 text-sm">{error}</p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">{formatCurrency((latest && latest > 0) ? latest : (dbPrice ?? 0), locale)}</span>
            {dbPrice != null && (!latest || latest === 0) && (
              <span className="text-xs text-muted-foreground">{t(locale, 'product.priceFromDatabase')}</span>
            )}
          </div>
          {history.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">{t(locale, 'product.previousPrices')}</h3>
              <ul className="space-y-1">
                {history.map((h, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {formatCurrency(h.price, locale)} — {new Date(h.timestamp * 1000).toLocaleString(locale)}
                    {h.notes ? ` — ${h.notes}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t(locale, 'product.noPreviousPrices')}</p>
          )}
        </div>
      )}

      {canEdit && (
        <div className="mt-6 p-4 rounded-lg border-2 border-emerald-500/20 bg-emerald-500/5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3">📝 {t(locale, 'product.updatePriceTitle')}</h3>
            {error && (
              <div className="mb-3 p-2 rounded-md bg-red-500/10 border border-red-500/30 text-red-600 text-sm">
                ⚠️ {error}
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">{t(locale, 'product.newPriceLabel')}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t(locale, 'product.newPriceLabel')}
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                disabled={saving}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">{t(locale, 'product.notesOptionalLabel')}</label>
              <input
                type="text"
                className="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={t(locale, 'product.notesOptionalLabel')}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
          
          <button
            className="w-full px-4 py-2 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            onClick={submitUpdate}
            disabled={saving || !formPrice}
          >
            {saving ? `⏳ ${t(locale, 'product.updatingPriceButton')}` : `✓ ${t(locale, 'product.updatePriceButton')}`}
          </button>
          
          <p className="text-xs text-muted-foreground">
            💡 {t(locale, 'product.priceUpdateHelp')}
          </p>
        </div>
      )}
    </div>
  )
}
