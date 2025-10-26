'use client'

import { useState, useEffect, useCallback } from 'react'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { motion } from 'framer-motion'
import { Package, ShoppingCart, TrendingUp, Store, ShoppingBag } from 'lucide-react'

export default function RetailerDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [events, setEvents] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    } else if (user && user.role !== 'RETAILER') {
      router.push('/')
    } else if (user) {
      fetchDashboardData()
    }
  }, [user, loading, router, fetchDashboardData])

  const fetchDashboardData = useCallback(async () => {

    try {
      const res = await fetch(`/api/users/${user.id}/activities`)
      const data = await res.json()
      if (data.events) {
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Failed to fetch retailer dashboard data:', error)
    } finally {
      setLoadingData(false)
    }
  }, [user])

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== 'RETAILER') {
    return null
  }

  const stats = {
    totalReceived: events.filter(e => e.eventType === 'RECEIVED').length,
    inStock: events.filter(e => e.eventType === 'IN_STOCK').length,
    sold: events.filter(e => e.eventType === 'SOLD').length,
    total: events.length
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
      opacity: 1
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
          <h1 className="text-3xl font-bold">Retailer Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
        </div>
      </motion.div>

      <motion.div
        className="grid gap-6 md:grid-cols-4"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={item}
          whileHover={{ y: -5 }}
          className="rounded-xl border p-6 bg-card hover:shadow-lg hover:shadow-blue-500/10 transition-shadow"
        >
          <div className="p-3 rounded-lg bg-blue-500/10 w-fit mb-4">
            <Package className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold">{stats.totalReceived}</h3>
          <p className="text-sm text-muted-foreground">Products Received</p>
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ y: -5 }}
          className="rounded-xl border p-6 bg-card hover:shadow-lg hover:shadow-emerald-500/10 transition-shadow"
        >
          <div className="p-3 rounded-lg bg-emerald-500/10 w-fit mb-4">
            <ShoppingBag className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-2xl font-bold">{stats.inStock}</h3>
          <p className="text-sm text-muted-foreground">In Stock</p>
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ y: -5 }}
          className="rounded-xl border p-6 bg-card hover:shadow-lg hover:shadow-purple-500/10 transition-shadow"
        >
          <div className="p-3 rounded-lg bg-purple-500/10 w-fit mb-4">
            <TrendingUp className="h-6 w-6 text-purple-500" />
          </div>
          <h3 className="text-2xl font-bold">{stats.sold}</h3>
          <p className="text-sm text-muted-foreground">Items Sold</p>
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ y: -5 }}
          className="rounded-xl border p-6 bg-card hover:shadow-lg hover:shadow-yellow-500/10 transition-shadow"
        >
          <div className="p-3 rounded-lg bg-yellow-500/10 w-fit mb-4">
            <Store className="h-6 w-6 text-yellow-500" />
          </div>
          <h3 className="text-2xl font-bold">{user?.verified ? 'Active' : 'Pending'}</h3>
          <p className="text-sm text-muted-foreground">Store Status</p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border bg-card"
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>
        <div className="p-6">
          {events.length > 0 ? (
            <div className="space-y-3">
              {events.slice(0, 10).map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 p-4 rounded-lg border hover:border-emerald-500 hover:shadow-md transition-all"
                >
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <ShoppingCart className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold">{event.eventType.replace('_', ' ')}</h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.product?.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Location: {event.location}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset
                    ${event.eventType === 'SOLD' 
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                      : event.eventType === 'IN_STOCK'
                      ? 'bg-blue-50 text-blue-700 ring-blue-600/20'
                      : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                    }`}>
                    {event.eventType}
                  </span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No transactions yet</h3>
              <p className="text-muted-foreground">
                Your store activity will appear here
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}