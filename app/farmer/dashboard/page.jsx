'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { motion } from 'framer-motion'
import { Package, TrendingUp, AlertCircle, Plus, Eye, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default function FarmerDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch('/api/product')
      const data = await res.json()
      if (data.products) {
        const myProducts = data.products.filter(p => p.farmerId === user.id)
        setProducts(myProducts)
        setStats({
          totalProducts: myProducts.length,
          totalValue: myProducts.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0),
          recentProducts: myProducts.filter(p => {
            const days = Math.floor((new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24))
            return days <= 7
          }).length
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoadingData(false)
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    } else if (user && user.role !== 'FARMER') {
      router.push('/')
    } else if (user) {
      fetchDashboardData()
    }
  }, [user, loading, router, fetchDashboardData])

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== 'FARMER') {
    return null
  }

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold">Farmer Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user.name}</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/products/register"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Register Product
          </Link>
        </motion.div>
      </motion.div>

      {!user.verified && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400 flex items-center gap-2"
        >
          <AlertCircle className="h-5 w-5" />
          <span>Your account is pending verification. You&apos;ll be able to register products once approved.</span>

        </motion.div>
      )}

      <motion.div
        className="grid gap-6 md:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={item}
          whileHover={{ y: -5 }}
          className="rounded-xl border p-6 bg-card hover:shadow-lg hover:shadow-blue-500/10 transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Package className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">{stats?.totalProducts || 0}</h3>
          <p className="text-sm text-muted-foreground">Total Products</p>
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ y: -5 }}
          className="rounded-xl border p-6 bg-card hover:shadow-lg hover:shadow-emerald-500/10 transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-emerald-500/10">
              <TrendingUp className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">৳{stats?.totalValue.toFixed(2) || '0.00'}</h3>
          <p className="text-sm text-muted-foreground">Total Value</p>
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ y: -5 }}
          className="rounded-xl border p-6 bg-card hover:shadow-lg hover:shadow-purple-500/10 transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <BarChart3 className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">{stats?.recentProducts || 0}</h3>
          <p className="text-sm text-muted-foreground">Added This Week</p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border bg-card"
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Your Products</h2>
        </div>
        <div className="p-6">
          {products.length > 0 ? (
            <div className="space-y-3">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg border hover:border-blue-500 hover:shadow-md transition-all group"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-blue-500 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{product.origin}</span>
                      <span>•</span>
                      <span>৳{parseFloat(product.price || 0).toFixed(2)}</span>
                      <span>•</span>
                      <span>{formatDate(product.createdAt)}</span>
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Link
                      href={`/product/${product.id}`}
                      className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by registering your first product
              </p>
              <Link
                href="/products/register"
                className="inline-flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Register Product
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
