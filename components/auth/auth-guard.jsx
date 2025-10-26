'use client'

import { useAuth } from '@/lib/auth/auth-context'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '../loading'

export function AuthGuard({ children, requiredRole = null }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    } else if (!loading && requiredRole && user?.role !== requiredRole) {
      router.push('/')
    }
  }, [user, loading, router, requiredRole])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] space-y-4"
      >
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">Please login to access this page.</p>
        <Link
          href="/auth"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Login
        </Link>
      </motion.div>
    )
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] space-y-4"
      >
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You don&apos;t have permission to access this page.</p>
        <Link
          href="/"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Go Home
        </Link>
      </motion.div>
    )
  }

  return <>{children}</>
}