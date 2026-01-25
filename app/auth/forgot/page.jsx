'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: email, 2: PIN, 3: success
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(5)

  // Step 1: Request PIN
  const handleRequestPIN = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/forgot-password-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send PIN')
      }

      setMessage(data.message)
      setStep(2)

      // Show PIN in development
      if (data.pin) {
        console.log('Development PIN:', data.pin)
        setMessage(`${data.message} (Development PIN: ${data.pin})`)
      }
    } catch (err) {
      setError(err.message || 'Failed to send PIN. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify PIN
  const handleVerifyPIN = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/verify-password-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.attemptsLeft !== undefined) {
          setAttemptsLeft(data.attemptsLeft)
        }
        throw new Error(data.error || 'Invalid PIN')
      }

      setResetToken(data.resetToken)
      setStep(3)
      setMessage('PIN verified successfully!')

      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        router.push(`/auth/reset?token=${data.resetToken}`)
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
    await handleRequestPIN({ preventDefault: () => {} })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-blue-600 dark:text-blue-300" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {step === 1 && "Enter your email to receive a verification PIN"}
              {step === 2 && "Enter the 6-digit PIN sent to your email"}
              {step === 3 && "Redirecting to password reset..."}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <div className={`w-12 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                ✓
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              {attemptsLeft < 5 && attemptsLeft > 0 && (
                <p className="text-xs text-red-500 mt-1">
                  {attemptsLeft} {attemptsLeft === 1 ? 'attempt' : 'attempts'} remaining
                </p>
              )}
            </div>
          )}

          {message && !error && (
            <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
            </div>
          )}

          {/* Step 1: Email Form */}
          {step === 1 && (
            <form onSubmit={handleRequestPIN} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending PIN...' : 'Send Verification PIN'}
              </button>
            </form>
          )}

          {/* Step 2: PIN Verification Form */}
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
                  className="w-full text-center text-2xl font-bold tracking-widest py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="000000"
                  maxLength={6}
                  autoFocus
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  Enter the 6-digit PIN sent to {email}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || pin.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify PIN'}
              </button>

              <button
                type="button"
                onClick={handleResendPIN}
                className="w-full text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Didn&apos;t receive the PIN? Resend
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to email
              </button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                PIN Verified!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Redirecting to reset your password...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link 
              href="/auth" 
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
