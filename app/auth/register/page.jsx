import RegisterFormWrapper from '@/components/register-form-wrapper'
import { Suspense } from 'react'

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
      <RegisterFormWrapper />
    </Suspense>
  )
}