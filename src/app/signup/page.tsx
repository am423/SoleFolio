import { SignupForm } from '@/components/auth/SignupForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up - SoleFolio',
  description: 'Join SoleFolio to start building and showcasing your sneaker collection.',
}

export default function SignupPage() {
  return <SignupForm />
}