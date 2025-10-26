'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CONSUMER',
    phoneNumber: '',
    address: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const result = await register(formData)
      if (result.success) {
        router.push('/dashboard')
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (error) {
      setError('Something went wrong')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-xl border bg-card p-8"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold">Create an Account</h2>
          <p className="text-muted-foreground">Register to track your products</p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/15 p-4 text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border bg-background px-3 py-2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border bg-background px-3 py-2"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Username (unique)</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border bg-background px-3 py-2"
              value={formData.username || ''}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-md border bg-background px-3 py-2"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Role</label>
            <select
              className="mt-1 block w-full rounded-md border bg-background px-3 py-2"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="CONSUMER">Consumer</option>
              <option value="RETAILER">Retailer</option>
              <option value="FARMER">Farmer</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <input
              type="tel"
              className="mt-1 block w-full rounded-md border bg-background px-3 py-2"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Address</label>
            <textarea
              className="mt-1 block w-full rounded-md border bg-background px-3 py-2"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Register
          </button>
        </form>

        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/auth" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}