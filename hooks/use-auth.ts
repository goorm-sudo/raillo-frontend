import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { tokenManager } from '@/lib/auth'

interface UseAuthOptions {
  redirectTo?: string
  requireAuth?: boolean
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectTo = '/login', requireAuth = true } = options
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = tokenManager.isAuthenticated()
      setIsLoggedIn(authenticated)
      
      if (requireAuth && !authenticated) {
        // 로그인이 필요한데 로그인되지 않은 경우 리다이렉트
        router.push(redirectTo)
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [router, redirectTo, requireAuth])

  return {
    isLoggedIn,
    isLoading,
    isAuthenticated: isLoggedIn === true,
    isUnauthenticated: isLoggedIn === false,
    isChecking: isLoggedIn === null || isLoading
  }
} 