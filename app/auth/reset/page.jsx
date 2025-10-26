'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetPasswordForm() {
  const router = useRouter()
  const search = useSearchParams()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const token = search.get('token') || ''

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      router.push('/auth')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">New Password</label>
          <input className="w-full border rounded p-2" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </div>
        <button className="w-full bg-primary text-primary-foreground rounded p-2" disabled={loading}>{loading ? 'Resetting...' : 'Reset password'}</button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto p-6">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
