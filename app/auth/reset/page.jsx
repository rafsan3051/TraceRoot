'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getPasswordStrength, getStrengthLabel, validatePassword } from '@/lib/auth/password-validator'

function ResetPasswordForm() {
  const router = useRouter()
  const search = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const token = search.get('token') || ''

  const handlePasswordChange = (e) => {
    const pwd = e.target.value
    setPassword(pwd)
    
    if (pwd) {
      const validation = validatePassword(pwd)
      setValidationErrors(validation.errors)
    } else {
      setValidationErrors([])
    }
  }

  const strength = getPasswordStrength(password)
  const strengthLabel = getStrengthLabel(strength)
  const passwordsMatch = password && confirmPassword && password === confirmPassword
  const isValid = password && validationErrors.length === 0 && passwordsMatch

  const onSubmit = async (e) => {
    e.preventDefault()
    
    if (!isValid) {
      setError('Please fix validation errors before submitting')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }
      
      router.push('/auth?message=password-reset')
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="text-red-600 font-semibold">Invalid or missing reset token</div>
        <a href="/auth/forgot" className="text-blue-600 text-sm mt-4 block">Request a new reset link</a>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium mb-2">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              className="w-full border rounded p-2 pr-10"
              placeholder="Enter strong password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Strength:</span>
                <span className="text-xs font-medium" style={{ color: strengthLabel.color }}>
                  {strengthLabel.label}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded h-2">
                <div
                  className="h-2 rounded transition-all"
                  style={{
                    width: `${strength}%`,
                    backgroundColor: strengthLabel.color
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <ul className="mt-2 text-xs text-red-600 space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-medium mb-2">Confirm Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="Re-enter password"
            required
          />
          {password && confirmPassword && !passwordsMatch && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
          )}
          {passwordsMatch && (
            <p className="mt-1 text-xs text-green-600">✓ Passwords match</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isValid}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded transition-colors"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600">
        <a href="/auth/forgot" className="text-blue-600 hover:underline">
          Request another reset link
        </a>
      </div>
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
