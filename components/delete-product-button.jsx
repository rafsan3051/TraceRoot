'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

export default function DeleteProductButton({ productId, farmerId }) {
  const router = useRouter()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Show the button for any authenticated user; API will enforce permissions
  if (!user) {
    return null
  }

  const handleDelete = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/product/${productId}/delete`, {
        method: 'POST'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to hide product')
      }

      // Redirect to products page after successful deletion
      setTimeout(() => {
        router.push('/products?hidden=1')
      }, 1000)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 transition text-sm font-medium border border-red-500/30"
        title="Hide this product from public view"
      >
        <Trash2 className="h-4 w-4" />
        Hide Product
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Hide Product?</h2>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                ⚠️ Important Information
              </p>
              <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1 list-disc list-inside">
                <li>Product data remains on the blockchain permanently</li>
                <li>Hiding only removes it from the public product list</li>
                <li>Authorized users can still access via direct link</li>
                <li>You can unhide the product later if needed</li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">Authorization Error</p>
                <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Hiding...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Yes, Hide Product
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
