'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Package, AlertCircle, ArrowRight, QrCode, Lock, UserPlus, LogIn, MapPin, Eye } from 'lucide-react'

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
      setError('Please enter a product ID, name, origin, or blockchain reference')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Try direct product ID first
      const directRes = await fetch(`/api/product/${searchTerm}`)
      if (directRes.ok) {
        const directData = await directRes.json()
        const resolvedId = directData?.product?.id || searchTerm
        router.push(`/product/${resolvedId}`)
        return
      }

      // Search by name
      const res = await fetch('/api/product')
      const data = await res.json()
      
      if (data.products) {
        const term = searchTerm.toLowerCase()
        const found = data.products.find(p => 
          p.id === searchTerm ||
          p.blockchainTxId === searchTerm ||
          p.name.toLowerCase().includes(term) ||
          p.origin.toLowerCase().includes(term) ||
          (p.events || []).some(event => event.blockchainTxId === searchTerm)
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
    const SupplyChainLoader = require('@/components/SupplyChainLoader').default
    return (
      <div className="min-h-[60vh] flex items-center justify-center" suppressHydrationWarning>
        <SupplyChainLoader label="Checking authentication" />
      </div>
    )
  }

  // Show beautiful landing page for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" suppressHydrationWarning>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 px-4"
        >
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6 inline-block"
            >
              <Search className="h-20 w-20 text-emerald-600 dark:text-emerald-400 mx-auto" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-600">
              Track & Verify Products
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Search for any product and see its complete journey through the supply chain. Verify authenticity with blockchain technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 transition shadow-lg"
              >
                <LogIn className="h-5 w-5 mr-2" />
                Sign In to Track
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-lg font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Create Account
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Tracking Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-6 rounded-xl border bg-card hover:shadow-lg transition"
            >
              <QrCode className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">QR Code Scanning</h3>
              <p className="text-muted-foreground">
                Scan product QR codes to instantly view complete supply chain information.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center p-6 rounded-xl border bg-card hover:shadow-lg transition"
            >
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-Time Location</h3>
              <p className="text-muted-foreground">
                Track product movement with GPS coordinates and interactive maps.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center p-6 rounded-xl border bg-card hover:shadow-lg transition"
            >
              <Eye className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Complete Transparency</h3>
              <p className="text-muted-foreground">
                View every event, timestamp, and actor in the product&apos;s journey.
              </p>
            </motion.div>
          </div>

          {/* How It Works */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-xl mb-4">
                  1
                </div>
                <h3 className="font-semibold mb-2">Sign In</h3>
                <p className="text-sm text-muted-foreground">Create a free account or sign in to access tracking features</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xl mb-4">
                  2
                </div>
                <h3 className="font-semibold mb-2">Search or Scan</h3>
                <p className="text-sm text-muted-foreground">Enter product ID, name, or scan QR code</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-xl mb-4">
                  3
                </div>
                <h3 className="font-semibold mb-2">View Journey</h3>
                <p className="text-sm text-muted-foreground">See complete supply chain history with blockchain verification</p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white"
          >
            <h3 className="text-2xl font-bold mb-4">Start Tracking Today</h3>
            <p className="mb-6 text-emerald-50">Get instant access to powerful supply chain tracking tools</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-emerald-600 rounded-lg font-medium hover:bg-gray-100 transition shadow-lg"
              >
                Create Free Account
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
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
              onClick={() => router.push('/auth?redirect=/track')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium hover:opacity-90 transition-opacity"
            >
              <LogIn className="h-5 w-5" />
              Login
            </motion.button>
            <motion.button
              onClick={() => router.push('/auth/register?redirect=/track')}
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
                placeholder="Enter Product ID, name, origin, or blockchain reference..."
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