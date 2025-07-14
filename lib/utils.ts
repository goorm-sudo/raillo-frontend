import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { tokenManager } from './auth'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 로그인 정보 조회
export function getLoginInfo() {
  if (typeof window === 'undefined') return null;
  
  const loginInfoStr = localStorage.getItem('loginInfo');
  if (!loginInfoStr) return null;
  
  try {
    return JSON.parse(loginInfoStr);
  } catch (error) {
    console.error('Failed to parse login info:', error);
    return null;
  }
}

// 토큰 만료 확인
export function isTokenExpired(): boolean {
  return !tokenManager.isAuthenticated();
}
