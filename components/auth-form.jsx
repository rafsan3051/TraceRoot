'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/auth/auth-context'

export default function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login: authLogin, register: authRegister } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'CONSUMER'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let result
      
      if (isRegister) {
        result = await authRegister(formData)
      } else {
        result = await authLogin(formData.email, formData.password)
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Authentication failed')
      }

      toast.success(isRegister ? 'Registration successful!' : 'Welcome back!')
      
      // Redirect to the original page or home
      const redirect = searchParams.get('redirect') || '/'
      router.push(redirect)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto p-4 sm:p-6 bg-card rounded-lg shadow-lg border"
    >
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center">
        {isRegister ? 'Create Account' : 'Welcome Back'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {isRegister && (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 sm:p-2.5 rounded border bg-background text-sm sm:text-base"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Username (unique)
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username || ''}
                onChange={handleChange}
                required
                className="w-full p-2 sm:p-2.5 rounded border bg-background text-sm sm:text-base"
                disabled={isLoading}
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            {isRegister ? 'Email' : 'Email or Username'}
          </label>
          <input
            type={isRegister ? "email" : "text"}
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder={isRegister ? "your@email.com" : "Email or username"}
            className="w-full p-2 sm:p-2.5 rounded border bg-background text-sm sm:text-base"
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 sm:p-2.5 rounded border bg-background text-sm sm:text-base"
            disabled={isLoading}
          />
        </div>

        {isRegister && (
          <div>
            <label htmlFor="role" className="block text-sm font-medium mb-1">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 sm:p-2.5 rounded border bg-background text-sm sm:text-base"
              disabled={isLoading}
            >
              <option value="CONSUMER">Consumer</option>
              <option value="FARMER">Farmer</option>
              <option value="DISTRIBUTOR">Distributor</option>
              <option value="RETAILER">Retailer</option>
            </select>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full py-2.5 sm:py-3 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm sm:text-base font-medium"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
        </motion.button>
      </form>

      {!isRegister && (
        <div className="mt-3 text-right">
          <button
            onClick={() => router.push('/auth/forgot')}
            className="text-xs sm:text-sm text-primary hover:underline"
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>
      )}

      <p className="mt-4 text-xs sm:text-sm text-center">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-primary hover:underline font-medium"
          disabled={isLoading}
        >
          {isRegister ? 'Login' : 'Register'}
        </button>
      </p>
    </motion.div>
  )
}