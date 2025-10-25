import AuthForm from '../../components/auth-form'

export const metadata = {
  title: 'Authentication - TraceRoot',
  description: 'Login or register to TraceRoot platform',
}

export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AuthForm />
    </div>
  )
}