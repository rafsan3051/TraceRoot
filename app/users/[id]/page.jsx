 'use client'

import { use, useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { motion } from 'framer-motion'

export default function UserProfilePage({ params }) {
  const resolvedParams = use(params)
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState(null)
  const [activities, setActivities] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUserData = async () => {
    try {
      const res = await fetch(`/api/users/${resolvedParams.id}`)
      const data = await res.json()
      if (data.error) setError(data.error)
      else setUser(data.user)
    } catch (e) {
      setError('Failed to load user data')
    }
  }

  const fetchUserActivities = async () => {
    try {
      const res = await fetch(`/api/users/${resolvedParams.id}/activities`)
      const data = await res.json()
      if (!data.error) setActivities(data)
    } catch (e) {
      // non-fatal
    }
  }

  const verifyUser = async () => {
    try {
      const res = await fetch(`/api/admin/verify-user/${resolvedParams.id}`, { method: 'POST' })
      if (res.ok) await fetchUserData()
    } catch (e) {
      // log only
      console.error(e)
    }
  }

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchUserData(), fetchUserActivities()])
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">{error}</h1>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
          <p className="text-muted-foreground mt-2">The requested user profile does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">User Profile</h1>
          {currentUser?.role === 'ADMIN' && (
            <div className="flex items-center space-x-4">
              <button
                onClick={verifyUser}
                className={`px-4 py-2 rounded-md ${user.verified ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                disabled={user.verified}
              >
                {user.verified ? 'Already Verified' : 'Verify User'}
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Name</dt>
                <dd className="text-lg">{user.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd className="text-lg">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Role</dt>
                <dd className="text-lg">{user.role}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Status</dt>
                <dd className="text-lg">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${user.verified ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'}`}>
                    {user.verified ? 'Verified' : 'Pending Verification'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border p-6 bg-card">
            <h2 className="text-xl font-semibold mb-4">Contact Details</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Phone Number</dt>
                <dd className="text-lg">{user.phoneNumber || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Address</dt>
                <dd className="text-lg">{user.address || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Member Since</dt>
                <dd className="text-lg">{new Date(user.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="rounded-xl border p-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {user.role === 'FARMER' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Registered Products</h3>
              {activities?.products?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="pb-4">Name</th>
                        <th className="pb-4">Origin</th>
                        <th className="pb-4">Date</th>
                        <th className="pb-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.products.map((product) => (
                        <tr key={product.id} className="border-t">
                          <td className="py-4">{product.name}</td>
                          <td className="py-4">{product.origin}</td>
                          <td className="py-4">{new Date(product.createdAt).toLocaleDateString()}</td>
                          <td className="py-4">
                            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No products registered yet.</p>
              )}
            </div>
          )}

          {activities?.events?.length ? (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium">Supply Chain Events</h3>
              {activities.events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 border-t pt-4">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center" />
                  <div className="flex-1">
                    <p className="font-medium">{event.eventType}</p>
                    <p className="text-sm text-muted-foreground">{event.product?.name} - {event.location}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  )
}