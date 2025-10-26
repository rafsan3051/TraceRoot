'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Package, AlertCircle, ArrowRight, QrCode } from 'lucide-react'

export default function TrackPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e) => {
    e.preventDefault()
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-emerald-500/10 mb-4"
        >
          <Search className="h-12 w-12 text-blue-500" />
        </motion.div>
        
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-emerald-500">
          Track & Verify Products
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Enter a product ID or name to view its complete supply chain journey and verify authenticity
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-2xl mx-auto"
      >
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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2"
            >
              <AlertCircle className="h-5 w-5" />
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
          </motion.button>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto"
      >
        <motion.div
          whileHover={{ y: -5 }}
          className="p-6 rounded-xl border bg-card hover:shadow-lg hover:shadow-blue-500/10 transition-all"
        >
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
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="p-6 rounded-xl border bg-card hover:shadow-lg hover:shadow-emerald-500/10 transition-all"
        >
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
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="max-w-3xl mx-auto p-6 rounded-xl border bg-card/50 backdrop-blur"
      >
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
      </motion.div>
    </div>
  )
}