/**
 * Watchlist Component
 * Allows users to watch/unwatch products and manage notifications
 */

'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import toast from 'react-hot-toast'
import { useLocale } from '@/lib/i18n/locale-context'
import { t } from '@/lib/i18n/translations'

export default function WatchButton({ productId, compact = false }) {
  const { user } = useAuth()
  const { locale } = useLocale()
  const [isWatching, setIsWatching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState(true)

  useEffect(() => {
    if (!user) return
    
    async function checkWatchStatus() {
      try {
        const res = await fetch('/api/watchlist')
        const data = await res.json()
        
        if (data.success) {
          const watch = data.data.find((w) => w.productId === productId)
          if (watch) {
            setIsWatching(true)
            setNotifyEmail(watch.notifyEmail)
          }
        }
      } catch (error) {
        console.error('Failed to check watch status:', error)
      }
    }
    
    checkWatchStatus()
  }, [productId, user])

  async function toggleWatch() {
    if (!user) {
      toast.error(t(locale, 'messages.watchLoginRequired'))
      return
    }

    setLoading(true)
    
    try {
      if (isWatching) {
        // Unwatch
        const res = await fetch(`/api/watchlist?productId=${productId}`, {
          method: 'DELETE',
        })
        
        if (res.ok) {
          setIsWatching(false)
          toast.success(t(locale, 'messages.watchRemoved'))
        }
      } else {
        // Watch
        const res = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            notifyEmail: true,
            notifyPush: false,
          }),
        })
        
        if (res.ok) {
          setIsWatching(true)
          setNotifyEmail(true)
          toast.success(t(locale, 'messages.watchAdded'))
        }
      }
    } catch (error) {
      toast.error(t(locale, 'messages.watchFailed'))
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  if (compact) {
    return (
      <button
        onClick={toggleWatch}
        disabled={loading}
        className={`p-2 rounded-full transition ${
          isWatching
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted hover:bg-muted/80'
        }`}
        aria-label={isWatching ? t(locale, 'watchlist.unwatch') : t(locale, 'watchlist.watch')}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isWatching ? (
          <Bell className="h-4 w-4" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
      </button>
    )
  }

  return (
    <button
      onClick={toggleWatch}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
        isWatching
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background hover:bg-muted border-border'
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isWatching ? (
        <>
          <Bell className="h-4 w-4" />
          <span>{t(locale, 'watchlist.watching')}</span>
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4" />
          <span>{t(locale, 'watchlist.watch')}</span>
        </>
      )}
    </button>
  )
}
