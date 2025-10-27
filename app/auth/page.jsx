import AuthForm from '../../components/auth-form'
import { Suspense } from 'react'

export const metadata = {
  title: 'Authentication - TraceRoot',
  description: 'Login or register to TraceRoot platform',
}

export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Suspense fallback={<div className="flex justify-center items-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
        <AuthForm />
      </Suspense>
    </div>
  )
}