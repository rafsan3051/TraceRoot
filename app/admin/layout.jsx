'use client'

import { AuthGuard } from '@/components/auth/auth-guard'

export default function AdminLayout({ children }) {
  return (
    <AuthGuard requiredRole="ADMIN">
      {children}
    </AuthGuard>
  )
}