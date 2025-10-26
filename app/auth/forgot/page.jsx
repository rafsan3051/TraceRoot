'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMessage('If an account exists, a reset link has been sent. For dev, use the token below if provided.')
      if (data.token) {
        setMessage((m) => m + ` Token: ${data.token}`)
      }
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input className="w-full border rounded p-2" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <button className="w-full bg-primary text-primary-foreground rounded p-2" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
      </form>
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  )
}
