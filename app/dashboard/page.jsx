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
        // Not logged in, redirect to auth page
        router.push('/auth')
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
          case 'CONSUMER':
            router.push('/consumer/dashboard')
            break
          default:
            // Fallback to profile for any unknown roles
            router.push('/profile')
        }
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
        {(() => { const SupplyChainLoader = require('@/components/SupplyChainLoader').default; return <SupplyChainLoader label="Redirecting to your dashboard" /> })()}
      </motion.div>
    </div>
  )
}
