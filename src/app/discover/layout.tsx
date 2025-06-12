import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Navbar } from '@/components/layout/Navbar'

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        {children}
      </div>
    </ProtectedRoute>
  )
}