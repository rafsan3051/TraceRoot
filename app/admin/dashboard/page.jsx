 'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, Package, AlertCircle, CheckCircle2, List, Search } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState({ users: [], products: [], events: [], stats: {} })
  const [error, setError] = useState(null)

  const fetchAllData = async () => {
    try {
      setError(null)
      const res = await fetch('/api/admin/all-data')
      if (!res.ok) {
        const problem = await res.json().catch(() => ({}))
        setError(problem.error || 'Failed to load admin data')
        return
      }
      const jsonData = await res.json()
      setData(jsonData)
    } catch (err) {
      console.error(err)
      setError('Network error while loading admin data')
    }
  }

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      if (mounted) await fetchAllData()
    }
    loadData()
    return () => { mounted = false }
  }, [])

  const verifyUser = async (userId) => {
    try {
      await fetch(`/api/admin/verify-user/${userId}`, { method: 'POST' })
      fetchAllData()
    } catch (err) {
      console.error('Failed to verify user:', err)
    }
  }

  const getFilteredData = () => {
    const term = searchTerm.toLowerCase()
    if (activeTab === 'users') {
      return data.users.filter(u => (u.name || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term) || (u.role || '').toLowerCase().includes(term))
    }
    if (activeTab === 'products') {
      return data.products.filter(p => (p.name || '').toLowerCase().includes(term) || (p.origin || '').toLowerCase().includes(term) || (p.farmer?.name || '').toLowerCase().includes(term))
    }
    if (activeTab === 'events') {
      return data.events.filter(e => (e.eventType || '').toLowerCase().includes(term) || (e.location || '').toLowerCase().includes(term))
    }
    return []
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Welcome back, {user?.name}</p>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {error && (
            <div className="col-span-full rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl border p-4 sm:p-6 bg-card">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold">{data.stats?.totalUsers || 0}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl border p-4 sm:p-6 bg-card">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500 mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold">{data.stats?.totalProducts || 0}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Registered Products</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl border p-4 sm:p-6 bg-card">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold">{data.stats?.pendingVerifications || 0}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Pending Verifications</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl border p-4 sm:p-6 bg-card">
            <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mb-3 sm:mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold">{data.stats?.totalEvents || 0}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Supply Chain Events</p>
          </motion.div>
        </div>

        <div className="border-b overflow-x-auto">
          <nav className="flex space-x-4 min-w-max">
            <button onClick={() => setActiveTab('users')} className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Users</button>
            <button onClick={() => setActiveTab('products')} className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'products' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Products</button>
            <button onClick={() => setActiveTab('events')} className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'events' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Events</button>
          </nav>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-md border bg-background pl-10 pr-4 py-2 text-sm sm:text-base" />
        </div>

        <div className="rounded-xl border bg-card">
          <div className="overflow-x-auto">
            <div className="p-4 min-w-[640px]">
            {activeTab === 'users' && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-3 sm:pb-4 px-2">Name</th>
                    <th className="pb-3 sm:pb-4 px-2">Email</th>
                    <th className="pb-3 sm:pb-4 px-2">Role</th>
                    <th className="pb-3 sm:pb-4 px-2">Status</th>
                    <th className="pb-3 sm:pb-4 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredData().map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="py-3 sm:py-4 px-2"><Link href={`/users/${u.id}`} className="hover:underline">{u.name}</Link></td>
                      <td className="py-3 sm:py-4 px-2 break-all">{u.email}</td>
                      <td className="py-3 sm:py-4 px-2">{u.role}</td>
                      <td className="py-3 sm:py-4 px-2"><span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${u.verified ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'}`}>{u.verified ? 'Verified' : 'Pending'}</span></td>
                      <td className="py-3 sm:py-4 px-2"><div className="flex items-center gap-2 sm:gap-4"><Link href={`/users/${u.id}`} className="text-xs sm:text-sm text-blue-500 hover:text-blue-700 whitespace-nowrap">View</Link>{!u.verified && <button onClick={() => verifyUser(u.id)} className="text-xs sm:text-sm text-emerald-500 hover:text-emerald-700 whitespace-nowrap">Verify</button>}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'products' && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-3 sm:pb-4 px-2">Name</th>
                    <th className="pb-3 sm:pb-4 px-2">Origin</th>
                    <th className="pb-3 sm:pb-4 px-2">Registered By</th>
                    <th className="pb-3 sm:pb-4 px-2">Status</th>
                    <th className="pb-3 sm:pb-4 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredData().map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="py-3 sm:py-4 px-2">{p.name}</td>
                      <td className="py-3 sm:py-4 px-2">{p.origin}</td>
                      <td className="py-3 sm:py-4 px-2">{p.farmer?.name}</td>
                      <td className="py-3 sm:py-4 px-2"><span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${p.events?.[0]?.eventType === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-blue-50 text-blue-700 ring-blue-600/20'}`}>{p.events?.[0]?.eventType || 'Registered'}</span></td>
                      <td className="py-3 sm:py-4 px-2"><Link href={`/products/${p.id}`} className="text-xs sm:text-sm text-blue-500 hover:text-blue-700 whitespace-nowrap">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'events' && (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-4">Product</th>
                    <th className="pb-4">Event Type</th>
                    <th className="pb-4">Location</th>
                    <th className="pb-4">Time</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredData().map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="py-4"><Link href={`/products/${e.product?.id}`} className="hover:underline">{e.product?.name}</Link></td>
                      <td className="py-4">{e.eventType}</td>
                      <td className="py-4">{e.location}</td>
                      <td className="py-4">{formatDateTime(e.timestamp)}</td>
                      <td className="py-4"><Link href={`/products/${e.product?.id}`} className="text-sm text-blue-500 hover:text-blue-700">View Product</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        </div>
      </motion.div>
    </div>
  )
}
