import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { tokenManager } from '@/lib/auth'

interface UseAuthOptions {
  redirectTo?: string
  requireAuth?: boolean
  redirectPath?: string
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectTo = '/login', requireAuth = true, redirectPath } = options
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAuth = useCallback(() => {
    const authenticated = tokenManager.isAuthenticated()
    setIsLoggedIn(authenticated)
    
    if (requireAuth && !authenticated) {
      // 리다이렉트 경로가 있으면 해당 경로로, 없으면 기본 로그인 페이지로
      const redirectUrl = redirectPath 
        ? `${redirectTo}?redirectTo=${encodeURIComponent(redirectPath)}`
        : redirectTo
      router.push(redirectUrl)
    }
    
    setIsLoading(false)
  }, [requireAuth, redirectTo, redirectPath, router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return {
    isLoggedIn,
    isLoading,
    isAuthenticated: isLoggedIn === true,
    isUnauthenticated: isLoggedIn === false,
    isChecking: isLoggedIn === null || isLoading
  }
} 