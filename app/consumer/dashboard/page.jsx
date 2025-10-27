'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Package, ShoppingBag, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function ConsumerDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [recentProducts, setRecentProducts] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchRecentProducts()
    }
  }, [user])

  const fetchRecentProducts = async () => {
    try {
      const res = await fetch('/api/product')
      const data = await res.json()
      if (data.products) {
        setRecentProducts(data.products.slice(0, 6))
      }
    } catch (err) {
      console.error('Failed to fetch products:', err)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || !user) {
    const SupplyChainLoader = require('@/components/SupplyChainLoader').default
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <SupplyChainLoader label="Preparing your dashboard" />
      </div>
    )
  }

  const quickActions = [
    {
      icon: Search,
      title: 'Track Product',
      description: 'Verify product authenticity',
      href: '/track',
      color: 'blue'
    },
    {
      icon: ShoppingBag,
      title: 'Browse Products',
      description: 'View all available products',
      href: '/products',
      color: 'emerald'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome back, {user.name}!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Track products and verify their supply chain journey
        </p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={action.href}>
              <div className={`p-6 rounded-xl border bg-card hover:shadow-lg hover:shadow-${action.color}-500/10 transition-all cursor-pointer group`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-${action.color}-500/10 group-hover:bg-${action.color}-500/20 transition-colors`}>
                    <action.icon className={`h-6 w-6 text-${action.color}-500`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-3"
      >
        <div className="p-4 sm:p-6 rounded-xl border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <Package className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-muted-foreground">Available Products</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{recentProducts.length}</p>
        </div>

        <div className="p-4 sm:p-6 rounded-xl border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <p className="text-sm text-muted-foreground">Verified</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{recentProducts.filter(p => p.verified).length}</p>
        </div>

        <div className="p-4 sm:p-6 rounded-xl border bg-card col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <p className="text-sm text-muted-foreground">Recently Added</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{recentProducts.filter(p => {
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
            return new Date(p.createdAt) > dayAgo
          }).length}</p>
        </div>
      </motion.div>

      {/* Recent Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold">Recent Products</h2>
          <Link href="/products" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {loadingData ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 rounded-xl border bg-card animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recentProducts.length > 0 ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {recentProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <div className="p-6 rounded-xl border bg-card hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold group-hover:text-primary transition-colors">{product.name}</h3>
                    {product.verified && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Origin: {product.origin}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 rounded-xl border border-dashed">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No products available yet</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
