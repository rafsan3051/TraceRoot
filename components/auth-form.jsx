'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/lib/auth/auth-context'

export default function AuthForm() {
  const router = useRouter()
  const { login: authLogin, register: authRegister } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'USER'
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
      router.push('/')
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
      className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg border"
    >
      <h1 className="text-2xl font-bold mb-6 text-center">
        {isRegister ? 'Create Account' : 'Welcome Back'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 rounded border bg-background"
              disabled={isLoading}
            />
          </div>
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
            className="w-full p-2 rounded border bg-background"
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
            className="w-full p-2 rounded border bg-background"
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
              className="w-full p-2 rounded border bg-background"
              disabled={isLoading}
            >
              <option value="USER">User</option>
              <option value="FARMER">Farmer</option>
            </select>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
        </motion.button>
      </form>

      <p className="mt-4 text-sm text-center">
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-primary hover:underline"
          disabled={isLoading}
        >
          {isRegister ? 'Login' : 'Register'}
        </button>
      </p>
    </motion.div>
  )
}