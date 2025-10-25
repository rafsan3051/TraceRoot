'use client'

import { AuthGuard } from '@/components/auth/auth-guard'

export default function RetailerLayout({ children }) {
  return (
    <AuthGuard requiredRole="RETAILER">
      {children}
    </AuthGuard>
  )
}