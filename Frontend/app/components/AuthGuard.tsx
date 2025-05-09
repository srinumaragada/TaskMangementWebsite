// components/AuthGuard.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/app/components/AuthProvider'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    if (isLoading) return // Wait until auth state is loaded

    // Since cookie is httpOnly, we can't check it directly
    // Rely on the auth state instead
    if (!user) {
      // Add return URL for better UX
      const returnUrl = encodeURIComponent(window.location.pathname)
      router.push(`/login?returnUrl=${returnUrl}`)
      return
    }

    setIsCheckingAuth(false)
  }, [user, isLoading, router])

  // Show loading state while checking auth
  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading ....
      </div>
    )
  }

  return <>{children}</>
}