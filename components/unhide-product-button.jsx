'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

export default function UnhideProductButton({ productId }) {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!user) {
    return null
  }

  const handleUnhide = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/product/${productId}/unhide`, {
        method: 'POST'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to unhide product')
      }

      // Refresh current page to reflect changes
      router.refresh()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleUnhide}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 transition text-sm font-medium border border-emerald-500/30 disabled:opacity-50"
        title="Restore this product to public view"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            Restoring...
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" />
            Unhide Product
          </>
        )}
      </button>

      {error && (
        <div className="text-xs text-red-600">{error}</div>
      )}
    </div>
  )
}
