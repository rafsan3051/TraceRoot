'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserPlus, Mail, CheckCircle, ArrowLeft } from 'lucide-react'

export default function RegisterFormWrapper() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1) // 1: registration, 2: PIN verification, 3: success
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [pin, setPin] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(5)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CONSUMER',
    phoneNumber: '',
    username: '',
    address: ''
  })

  // Step 1: Register and send PIN
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register-send-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setMessage(data.message)
      setStep(2)

      // Show PIN in development
      if (data.pin) {
        console.log('Development PIN:', data.pin)
        setMessage(`${data.message} (Development PIN: ${data.pin})`)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify PIN and create account
  const handleVerifyPIN = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify-email-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, pin }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.attemptsLeft !== undefined) {
          setAttemptsLeft(data.attemptsLeft)
        }
        throw new Error(data.error || 'Invalid PIN')
      }

      setStep(3)
      setMessage('Account created successfully!')

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        const redirect = searchParams.get('redirect') || '/dashboard'
        router.push(redirect)
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to verify PIN.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendPIN = async () => {
    setPin('')
    setAttemptsLeft(5)
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register-send-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend PIN')
      }

      setMessage('PIN resent! Check your email.')
      
      if (data.pin) {
        console.log('Development PIN:', data.pin)
        setMessage(`${data.message} (Development PIN: ${data.pin})`)
      }
    } catch (err) {
      setError(err.message || 'Failed to resend PIN')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="rounded-xl border bg-card p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-green-600 dark:text-green-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {step === 1 && "Create an Account"}
              {step === 2 && "Verify Your Email"}
              {step === 3 && "Welcome to TraceRoot!"}
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {step === 1 && "Register to track your products"}
              {step === 2 && "Enter the 6-digit PIN sent to your email"}
              {step === 3 && "Your account has been created"}
            </p>
          </div>

          {/* Progress Indicator */}
          {step < 3 && (
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1 ${step >= 2 ? 'bg-green-600' : 'bg-gray-300'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="rounded-lg bg-destructive/15 p-4 text-destructive mb-4">
              {error}
              {attemptsLeft < 5 && attemptsLeft > 0 && (
                <p className="text-xs mt-1">
                  {attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining
                </p>
              )}
            </div>
          )}

          {message && !error && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 text-green-600 dark:text-green-400 mb-4 text-sm">
              {message}
            </div>
          )}

          {/* Step 1: Registration Form */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border bg-background px-3 py-2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email *</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border bg-background px-3 py-2"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Username</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border bg-background px-3 py-2"
                  value={formData.username || ''}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
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
                disabled={loading}
                className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Continue to Verification'}
              </button>
            </form>
          )}

          {/* Step 2: PIN Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyPIN} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  6-Digit PIN
                </label>
                <input
                  type="text"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full text-center text-2xl font-bold tracking-widest py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Enter the 6-digit PIN sent to {formData.email}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || pin.length !== 6}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <button
                type="button"
                onClick={handleResendPIN}
                disabled={loading}
                className="w-full text-green-600 dark:text-green-400 hover:underline text-sm"
              >
                Didn&apos;t receive the PIN? Resend
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to registration
              </button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Account Created!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Welcome to TraceRoot. Redirecting to your dashboard...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto" />
            </div>
          )}

          {/* Footer */}
          {step === 1 && (
            <p className="text-center text-sm mt-6">
              Already have an account?{' '}
              <Link href="/auth" className="text-primary hover:underline">
                Login
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
