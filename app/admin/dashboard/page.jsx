 'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Users, Package, AlertCircle, CheckCircle2, List, Search } from 'lucide-react'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('users')
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState({ users: [], products: [], events: [], stats: {} })

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const res = await fetch('/api/admin/all-data')
      if (!res.ok) throw new Error('Failed to load admin data')
      const jsonData = await res.json()
      setData(jsonData)
    } catch (err) {
      console.error(err)
    }
  }

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
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl border p-6 bg-card">
            <Users className="h-6 w-6 text-blue-500 mb-4" />
            <h3 className="text-2xl font-bold">{data.stats?.totalUsers || 0}</h3>
            <p className="text-muted-foreground">Total Users</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl border p-6 bg-card">
            <Package className="h-6 w-6 text-emerald-500 mb-4" />
            <h3 className="text-2xl font-bold">{data.stats?.totalProducts || 0}</h3>
            <p className="text-muted-foreground">Registered Products</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl border p-6 bg-card">
            <AlertCircle className="h-6 w-6 text-yellow-500 mb-4" />
            <h3 className="text-2xl font-bold">{data.stats?.pendingVerifications || 0}</h3>
            <p className="text-muted-foreground">Pending Verifications</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl border p-6 bg-card">
            <CheckCircle2 className="h-6 w-6 text-blue-500 mb-4" />
            <h3 className="text-2xl font-bold">{data.stats?.totalEvents || 0}</h3>
            <p className="text-muted-foreground">Supply Chain Events</p>
          </motion.div>
        </div>

        <div className="border-b">
          <nav className="flex space-x-4">
            <button onClick={() => setActiveTab('users')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Users</button>
            <button onClick={() => setActiveTab('products')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'products' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Products</button>
            <button onClick={() => setActiveTab('events')} className={`px-3 py-2 text-sm font-medium ${activeTab === 'events' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Events</button>
          </nav>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-md border bg-background pl-10 pr-4 py-2" />
        </div>

        <div className="rounded-xl border bg-card">
          <div className="p-4 overflow-x-auto">
            {activeTab === 'users' && (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-4">Name</th>
                    <th className="pb-4">Email</th>
                    <th className="pb-4">Role</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredData().map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="py-4"><Link href={`/users/${u.id}`} className="hover:underline">{u.name}</Link></td>
                      <td className="py-4">{u.email}</td>
                      <td className="py-4">{u.role}</td>
                      <td className="py-4"><span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${u.verified ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'}`}>{u.verified ? 'Verified' : 'Pending'}</span></td>
                      <td className="py-4"><div className="flex items-center space-x-4"><Link href={`/users/${u.id}`} className="text-sm text-blue-500 hover:text-blue-700">View Profile</Link>{!u.verified && <button onClick={() => verifyUser(u.id)} className="text-sm text-emerald-500 hover:text-emerald-700">Verify</button>}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'products' && (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="pb-4">Name</th>
                    <th className="pb-4">Origin</th>
                    <th className="pb-4">Registered By</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredData().map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="py-4">{p.name}</td>
                      <td className="py-4">{p.origin}</td>
                      <td className="py-4">{p.farmer?.name}</td>
                      <td className="py-4"><span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${p.events?.[0]?.eventType === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-blue-50 text-blue-700 ring-blue-600/20'}`}>{p.events?.[0]?.eventType || 'Registered'}</span></td>
                      <td className="py-4"><Link href={`/products/${p.id}`} className="text-sm text-blue-500 hover:text-blue-700">View Details</Link></td>
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
                      <td className="py-4">{new Date(e.timestamp).toLocaleString()}</td>
                      <td className="py-4"><Link href={`/products/${e.product?.id}`} className="text-sm text-blue-500 hover:text-blue-700">View Product</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
