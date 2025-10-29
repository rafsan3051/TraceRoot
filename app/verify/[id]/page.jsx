'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { CheckCircle2, Package, MapPin, Calendar, User, AlertCircle, Loader2 } from 'lucide-react'
import { SupplyChainTimeline } from '@/components/supply-chain-timeline'

export default function VerifyPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [product, setProduct] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const token = searchParams.get('t')
        const version = searchParams.get('v')
        
        const url = token 
          ? `/api/verify/${params.id}?t=${token}&v=${version}`
          : `/api/verify/${params.id}?v=${version}`
        
        const res = await fetch(url)
        
        if (!res.ok) {
          throw new Error('Product not found or verification failed')
        }
        
        const data = await res.json()
        
        if (data.success) {
          setProduct(data.data.product)
          setEvents(data.data.events || [])
        } else {
          throw new Error(data.error || 'Failed to verify product')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-300">Verifying product...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">TraceRoot Verification</h1>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Verification Badge */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-xl p-8 mb-8 text-center">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Product Verified</h2>
          <p className="text-green-100 text-lg">This product is authentic and traceable</p>
        </div>

        {/* Product Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Package className="h-6 w-6" />
            {product.name}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Category</p>
                <p className="font-semibold">{product.category}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Origin</p>
                <p className="font-semibold">{product.origin}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <User className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Producer</p>
                <p className="font-semibold">{product.creator?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500">{product.creator?.role}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Registered</p>
                <p className="font-semibold">
                  {format(new Date(product.createdAt), 'PPP')}
                </p>
              </div>
            </div>
          </div>

          {product.description && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
              <p className="text-gray-800 dark:text-gray-200">{product.description}</p>
            </div>
          )}

          {product.status && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Status</p>
              <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                {product.status}
              </span>
            </div>
          )}
        </div>

        {/* Supply Chain Events */}
        {events.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
            <h3 className="text-xl font-bold mb-6">Supply Chain History</h3>
            <SupplyChainTimeline events={events} />
            <p className="text-xs text-gray-500 mt-4 text-center">
              Showing last {events.length} event{events.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Want to see more details?</h3>
          <p className="text-blue-100 mb-6">Create an account to access full product history, maps, and more</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href={`/auth?redirect=/product/${product.id}`}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Login
            </a>
            <a 
              href={`/auth/register?redirect=/product/${product.id}`}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition border-2 border-white"
            >
              Register
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
          <p>Powered by <span className="font-semibold">TraceRoot</span> - Blockchain Supply Chain Tracking</p>
        </div>
      </div>
    </div>
  )
}
