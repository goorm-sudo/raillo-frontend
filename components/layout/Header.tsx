"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Train, ShoppingCart, User, LogIn, Menu, X, CreditCard, Ticket, CalendarIcon, Search, RotateCcw, ChevronRight, LogOut, Lock, Phone } from "lucide-react"
import { tokenManager } from "@/lib/auth"
import { logout } from "@/lib/api/auth"

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    setIsLoggedIn(tokenManager.isAuthenticated())
  }, [])

  // 로그인 상태를 실시간으로 업데이트하는 함수
  const updateLoginStatus = () => {
    setIsLoggedIn(tokenManager.isAuthenticated())
  }

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      await logout()
      tokenManager.removeToken()
      updateLoginStatus()
      alert("로그아웃되었습니다.")
      router.push("/")
    } catch (error: any) {
      console.error("로그아웃 에러:", error)
      // 로그아웃 API 실패해도 로컬 토큰은 제거
      tokenManager.removeToken()
      updateLoginStatus()
      alert("로그아웃되었습니다.")
      router.push("/")
    }
  }

  // breadcrumb 생성 함수
  const getBreadcrumbs = (): Array<{ name: string; path: string }> => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: Array<{ name: string; path: string }> = []
    
    if (paths.length === 0) return breadcrumbs
    
    // 홈은 항상 첫 번째
    breadcrumbs.push({ name: '홈', path: '/' })
    
    // 경로별 breadcrumb 매핑
    const pathMap: { [key: string]: string } = {
      'ticket': '승차권',
      'booking': '예매',
      'search': '검색',
      'payment': '결제',
      'payment-complete': '결제완료',
      'purchased': '구매완료',
      'reservation': '예약',
      'reservations': '예약승차권 조회',
      'general': '일반',
      'guest-ticket': '비회원',
      'tickets': '승차권 목록',
      'cart': '장바구니',
      'mypage': '마이페이지',
      'withdraw': '회원탈퇴',
      'login': '로그인',
      'signup': '회원가입',
      'complete': '완료',
      'verify': '인증',
      'find-account': '계정찾기',
      'reset-password': '비밀번호 재설정',
      'result': '결과',
      'contact': '연락처',
      'change': '변경',
      'password': '비밀번호',
    }
    
    let currentPath = ''
    for (let i = 0; i < paths.length; i++) {
      currentPath += `/${paths[i]}`
      const name = pathMap[paths[i]] || paths[i]
      breadcrumbs.push({ name, path: currentPath })
    }
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center">
          {/* 왼쪽: 로고와 브레드크럼 */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Train className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-600">RAIL-O</h1>
            </Link>
            {/* 브레드크럼 */}
            {breadcrumbs.length > 1 && (
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {index > 0 && <ChevronRight className="h-4 w-4" />}
                    {index === 0 ? (
                      // 홈만 클릭 가능
                      <Link href={breadcrumb.path} className="hover:text-blue-600">
                        {breadcrumb.name}
                      </Link>
                    ) : index === breadcrumbs.length - 1 ? (
                      // 마지막 경로는 현재 페이지 표시
                      <span className="text-blue-600 font-medium">{breadcrumb.name}</span>
                    ) : (
                      // 중간 경로들은 클릭 불가능
                      <span className="text-gray-500">{breadcrumb.name}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 네비게이션과 카테고리 버튼 */}
          <div className="flex items-center space-x-4 ml-auto">
            <nav className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center space-x-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>로그아웃</span>
                  </Button>
                  <Link href="/cart">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span>장바구니</span>
                    </Button>
                  </Link>
                  <Link href="/mypage">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>마이페이지</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <LogIn className="h-4 w-4" />
                      <span>로그인</span>
                    </Button>
                  </Link>
                  <Link href="/cart">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <ShoppingCart className="h-4 w-4" />
                      <span>장바구니</span>
                    </Button>
                  </Link>
                </>
              )}
            </nav>
            {/* 카테고리 메뉴 버튼 */}
            <Button variant="ghost" size="sm" onClick={() => setShowSidebar(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      {/* 사이드바 오버레이 */}
      {showSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999]" onClick={() => setShowSidebar(false)}>
          <div
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[10000] border-l border-gray-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Sidebar Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between border-b border-blue-700">
              <h2 className="text-lg font-semibold">카테고리</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                className="text-white hover:bg-blue-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {/* Sidebar Content */}
            <div className="p-4 overflow-y-auto h-[calc(100vh-80px)] bg-white">
              <nav className="space-y-2">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">승차권 서비스</h3>
                  <Link 
                    href="/ticket/purchased" 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors bg-white"
                    onClick={() => setShowSidebar(false)}
                  >
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">승차권 확인</span>
                  </Link>
                  <Link 
                    href="/ticket/booking" 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors bg-white"
                    onClick={() => setShowSidebar(false)}
                  >
                    <Ticket className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">승차권 예매</span>
                  </Link>

                  <Link 
                    href="/ticket/reservations" 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors bg-white"
                    onClick={() => setShowSidebar(false)}
                  >
                    <Search className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">예약 승차권 조회</span>
                  </Link>
                  <Link 
                    href="/ticket/reservations" 
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors bg-white"
                    onClick={() => setShowSidebar(false)}
                  >
                    <RotateCcw className="h-5 w-5 text-red-600" />
                    <span className="text-gray-700">승차권 반환</span>
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  )
} 