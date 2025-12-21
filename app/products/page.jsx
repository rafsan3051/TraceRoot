'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Package, Search, Eye, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from '@/lib/i18n/locale-context'
import { t } from '@/lib/i18n/translations'
import { formatDate } from '@/lib/utils'


export default function ProductsPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchProducts()
    checkAuthentication()
    
    // Recheck auth when window regains focus (after login redirect)
    const handleFocus = () => {
      checkAuthentication()
    }
    
    window.addEventListener('focus', handleFocus)
    
    // Periodic check for auth changes every 2 seconds
    const interval = setInterval(checkAuthentication, 2000)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
  }, [])

  const fetchProducts = async () => {
    try {
      const includeHidden = searchParams?.get('hidden') === '1'
      const url = includeHidden ? '/api/product?includeHidden=1' : '/api/product'
      const res = await fetch(url)
      const data = await res.json()
      if (data.products) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading || checkingAuth) {
    const SupplyChainLoader = require('@/components/SupplyChainLoader').default
    return (
      <div className="min-h-[400px] flex items-center justify-center" suppressHydrationWarning>
        <SupplyChainLoader label="Loading products" />
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
          className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-emerald-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 px-4"
        >
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6 inline-block"
            >
              <Package className="h-20 w-20 text-blue-600 dark:text-blue-400 mx-auto" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600">
              Explore Verified Products
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Access our complete catalog of blockchain-verified products. Track their journey from farm to table with complete transparency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg font-medium hover:opacity-90 transition shadow-lg"
              >
                Sign In to View Products
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">What You&apos;ll Get Access To</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center p-6 rounded-xl border bg-card hover:shadow-lg transition"
            >
              <Package className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Complete Product Catalog</h3>
              <p className="text-muted-foreground">
                Browse all registered products with detailed information, origin, and current status.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center p-6 rounded-xl border bg-card hover:shadow-lg transition"
            >
              <MapPin className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Supply Chain Tracking</h3>
              <p className="text-muted-foreground">
                View complete journey of each product from production to distribution.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center p-6 rounded-xl border bg-card hover:shadow-lg transition"
            >
              <Eye className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Blockchain Verification</h3>
              <p className="text-muted-foreground">
                Every product is verified on the blockchain, ensuring authenticity and transparency.
              </p>
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white"
          >
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="mb-6 text-blue-50">Join thousands of users tracking products with blockchain technology</p>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition shadow-lg"
            >
              Create Your Free Account
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

    if (checkingAuth) {
      const SupplyChainLoader = require('@/components/SupplyChainLoader').default
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <SupplyChainLoader label="Checking access" />
        </div>
      )
    }

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">{t(locale, 'product.allProducts')}</h1>
          <p className="text-muted-foreground mt-1">
            {products.length} {products.length === 1 ? t(locale, 'product.name').toLowerCase() : t(locale, 'product.allProducts').toLowerCase()}
          </p>
        </div>
        
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t(locale, 'product.searchProducts')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </motion.div>

      {filteredProducts.length > 0 ? (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              variants={item}
              whileHover={{ y: -5 }}
              className="group relative rounded-xl border p-6 bg-card hover:shadow-lg hover:shadow-blue-500/10 transition-all"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-lg bg-blue-500/10">
                    <Package className="h-6 w-6 text-blue-500" />
                  </div>
                  {product.hidden ? (
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
                      Hidden
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                      Active
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-1 group-hover:text-blue-500 transition-colors">
                    {product.name}
                  </h3>
                    {isAuthenticated ? (
                      product.category && (
                        <span className="text-xs text-muted-foreground">
                          {product.category}
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground blur-sm select-none">Category hidden</span>
                    )}
                </div>

                <div className="space-y-2 text-sm">
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{product.origin}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Registered</span>
                          <span className="font-medium">{formatDate(product.createdAt)}</span>
                        </div>
                        {product.price > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              {new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 2 }).format(Number(product.price))}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-muted-foreground blur-sm select-none">
                          <MapPin className="h-4 w-4" />
                          <span>Origin hidden</span>
                        </div>
                        <div className="flex items-center justify-between blur-sm select-none">
                          <span className="text-muted-foreground">Registered</span>
                          <span className="font-medium">Date hidden</span>
                        </div>
                        <div className="flex items-center justify-between blur-sm select-none">
                          <span className="text-muted-foreground">Price</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">Hidden</span>
                        </div>
                      </>
                    )}
                </div>

                <div>
                  {isAuthenticated ? (
                    <Link
                      href={`/product/${product.id}`}
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => router.push(`/auth?redirect=/product/${product.id}`)}
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">
            {t(locale, 'product.noProducts')}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? t(locale, 'common.noData')
              : t(locale, 'product.noProducts')
            }
          </p>
        </motion.div>
      )}
    </div>
  )
}