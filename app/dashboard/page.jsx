'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        router.push('/auth/login')
      } else {
        // Redirect based on role
        switch (user.role) {
          case 'ADMIN':
            router.push('/admin/dashboard')
            break
          case 'FARMER':
            router.push('/farmer/dashboard')
            break
          case 'DISTRIBUTOR':
            router.push('/distributor/dashboard')
            break
          case 'RETAILER':
            router.push('/retailer/dashboard')
            break
          default:
            // Default users go to profile
            router.push('/profile')
        }
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg text-muted-foreground">Redirecting to your dashboard...</p>
      </motion.div>
    </div>
  )
}
