'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Package, AlertCircle, ArrowRight, QrCode, Lock, UserPlus, LogIn } from 'lucide-react'

export default function TrackPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    checkAuthentication()
  }, [])

  const checkAuthentication = async () => {
    try {
      const res = await fetch('/api/auth/check')
      const data = await res.json()
      setIsAuthenticated(data.authenticated)
    } catch (err) {
      setIsAuthenticated(false)
    } finally {
      setCheckingAuth(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    
    // Check authentication before allowing search
    if (!isAuthenticated) {
      setError('Please login or register to track products')
      return
    }

    if (!searchTerm.trim()) {
      setError('Please enter a product ID or name')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Try direct product ID first
      const directRes = await fetch(`/api/product/${searchTerm}`)
      if (directRes.ok) {
        router.push(`/product/${searchTerm}`)
        return
      }

      // Search by name
      const res = await fetch('/api/product')
      const data = await res.json()
      
      if (data.products) {
        const found = data.products.find(p => 
          p.id === searchTerm ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.origin.toLowerCase().includes(searchTerm.toLowerCase())
        )

        if (found) {
          router.push(`/product/${found.id}`)
        } else {
          setError('Product not found. Please check the ID or try a different search term.')
        }
      }
    } catch (err) {
      setError('Failed to search. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-emerald-500/10 mb-4">
          <Search className="h-12 w-12 text-blue-500" />
        </div>
        
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500">
          Track & Verify Products
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Enter a product ID or name to view its complete supply chain journey and verify authenticity
        </p>
      </div>

      {!isAuthenticated && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto p-8 rounded-2xl border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/5"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-xl bg-orange-500/10">
              <Lock className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground">
                Please login or create an account to access product tracking and supply chain verification features.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <motion.button
              onClick={() => window.location.href = '/auth?redirect=/track'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
            >
              <LogIn className="h-5 w-5" />
              Login
            </motion.button>
            <motion.button
              onClick={() => window.location.href = '/auth/register?redirect=/track'}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium hover:opacity-90 transition-opacity"
            >
              <UserPlus className="h-5 w-5" />
              Register
            </motion.button>
          </div>
        </motion.div>
      )}

      {isAuthenticated && (
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter Product ID or search by name..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setError('')
                }}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
              />
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                <>
                  Track Product
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
        <div className="p-6 rounded-xl border bg-card hover:shadow-lg hover:shadow-blue-500/10 transition-all">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <QrCode className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-2">Scan QR Code</h3>
              <p className="text-sm text-muted-foreground">
                Use your device camera to scan product QR codes for instant verification
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-card hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10">
              <Package className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-2">Search by ID</h3>
              <p className="text-sm text-muted-foreground">
                Enter the unique product identifier to access complete supply chain history
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6 rounded-xl border bg-card/50 backdrop-blur">
        <h3 className="font-semibold mb-3">What you&apos;ll see:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">✓</span>
            <span>Product origin and manufacturer details</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">✓</span>
            <span>Complete supply chain journey with timestamps</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">✓</span>
            <span>Blockchain verification and transaction history</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">✓</span>
            <span>Current location and status updates</span>
          </li>
        </ul>
      </div>
    </div>
  )
}