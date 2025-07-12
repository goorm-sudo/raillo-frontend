import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// JWT 토큰 디코딩 함수
export function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        })
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('JWT 디코딩 실패:', error)
    return null
  }
}

// 로그인 상태 확인 함수
export function getLoginInfo() {
  if (typeof window === 'undefined') return null
  
  const token = localStorage.getItem('accessToken')
  if (!token) return null
  
  const decoded = decodeJWT(token)
  if (!decoded) return null
  
  return {
    isLoggedIn: true,
    userId: decoded.userId || decoded.sub, // userId 또는 sub 필드 사용
    username: decoded.username || decoded.sub,
    memberNo: decoded.memberNo || decoded.member_no,
    email: decoded.email,
    exp: decoded.exp
  }
}

// 토큰 만료 확인 함수
export function isTokenExpired(token: string) {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true
  
  return Date.now() >= decoded.exp * 1000
}
