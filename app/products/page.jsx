'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Package, Search, Eye, MapPin } from 'lucide-react'
import Link from 'next/link'


export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

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
      const res = await fetch('/api/product')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

    if (checkingAuth) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
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
          <h1 className="text-3xl font-bold">All Products</h1>
          <p className="text-muted-foreground mt-1">
            Browse {products.length} registered product{products.length !== 1 ? 's' : ''} in the supply chain
          </p>
        </div>
        
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
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
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                    Active
                  </span>
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
                          <span className="font-medium">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {product.price > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Price</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                              ${parseFloat(product.price).toFixed(2)}
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
            {searchTerm ? 'No products found' : 'No products yet'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm 
              ? 'Try adjusting your search terms'
              : 'Products will appear here once farmers start registering them'
            }
          </p>
        </motion.div>
      )}
    </div>
  )
}