import { LoginForm } from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - SoleFolio',
  description: 'Sign in to your SoleFolio account to access your sneaker collection.',
}

export default function LoginPage() {
  return <LoginForm />
}