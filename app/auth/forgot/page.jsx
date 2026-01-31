'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: email, 2: send code, 3: verify pin, 4: reset password
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [emailValid, setEmailValid] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Step 1: Verify email exists
  const handleVerifyEmail = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Check if email exists by attempting to send a verification code
      const res = await fetch('/api/auth/forgot-password-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify email')
      }

      setEmailValid(true)
      setMessage('Email verified. Click "Send Code" to receive a verification PIN.')
      setStep(2)
    } catch (err) {
      setError(err.message || 'Failed to verify email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Send PIN code
  const handleSendCode = async (e) => {
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
        throw new Error(data.error || 'Failed to send code')
      }

      // In development, show the PIN for testing
      const devNote = data.pin ? ` (Dev PIN: ${data.pin})` : ''
      setMessage(`Verification PIN sent to ${email}${devNote}`)
      setStep(3)
    } catch (err) {
      setError(err.message || 'Failed to send code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Verify PIN and get reset token
  const handleVerifyPin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/verify-password-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Invalid PIN')
      }

      setResetToken(data.resetToken)
      setMessage('PIN verified successfully. You can now set a new password.')
      setStep(4)
    } catch (err) {
      setError(err.message || 'Failed to verify PIN. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 4: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setMessage('Password reset successfully!')
      setTimeout(() => {
        router.push('/auth?message=password-reset')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
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
              {step === 1 && 'Enter your email address'}
              {step === 2 && 'Click Send Code to receive a verification PIN'}
              {step === 3 && 'Enter the verification code sent to your email'}
              {step === 4 && 'Create a new password'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 flex justify-between text-xs font-medium">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                1
              </div>
            </div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                2
              </div>
            </div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
              <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                3
              </div>
            </div>
            <div className={`flex items-center ${step >= 4 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
              <div className={`flex-1 h-1 mx-2 ${step >= 4 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                4
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {message && !error && (
            <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-600 dark:text-green-400">{message}</p>
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleVerifyEmail} className="space-y-6">
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
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
          )}

          {/* Step 2: Send Code */}
          {step === 2 && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Email: <strong>{email}</strong>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setError('')
                  setMessage('')
                }}
                className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Change Email
              </button>
            </form>
          )}

          {/* Step 3: Verify PIN */}
          {step === 3 && (
            <form onSubmit={handleVerifyPin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.toUpperCase())}
                  maxLength="6"
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center text-2xl tracking-widest"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Check your email for the code</p>
              </div>

              <button
                type="submit"
                disabled={loading || pin.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(2)
                  setPin('')
                  setError('')
                  setMessage('')
                }}
                className="w-full text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Didn&apos;t receive code? Send again
              </button>
            </form>
          )}

          {/* Step 4: Reset Password */}
          {step === 4 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Create a strong password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">At least 8 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Re-enter password"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
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
      </div>
    </div>
  )
}
