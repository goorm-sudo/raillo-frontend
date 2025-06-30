import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 개발용 토큰 자동 설정 함수
export function setDevelopmentToken() {
  if (typeof window === 'undefined') return false
  
  // 이미 토큰이 있으면 설정하지 않음
  const existingToken = localStorage.getItem('accessToken')
  if (existingToken) return false
  
  // 개발용 TEST001 계정 토큰 설정
  const devToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJURVNUMDAxIiwiaWF0IjoxNzM1MzAzNzMzLCJleHAiOjk5OTk5OTk5OTksInVzZXJJZCI6IjEiLCJ1c2VybmFtZSI6IlRFU1QwMDEifQ.test'
  localStorage.setItem('accessToken', devToken)
  
  console.log('🔧 개발용 토큰 자동 설정됨 - TEST001 계정')
  return true
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
  
  // 개발용 토큰 자동 설정 시도
  setDevelopmentToken()
  
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
