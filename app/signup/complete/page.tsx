"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Train, Home, Printer, CheckCircle, User, CreditCard, AlertCircle } from "lucide-react"

export default function SignupCompletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [memberNo, setMemberNo] = useState<string>('')
  const [isValidAccess, setIsValidAccess] = useState<boolean | null>(null)

  useEffect(() => {
    // localStorage에서 회원번호 가져오기
    const storedMemberNo = localStorage.getItem('signupMemberNo')
    
    if (!storedMemberNo) {
      setIsValidAccess(false)
      return
    }

    setMemberNo(storedMemberNo)
    setIsValidAccess(true)
    
    // 페이지를 떠날 때만 localStorage에서 회원번호 제거
    const handleBeforeUnload = () => {
      localStorage.removeItem('signupMemberNo')
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // 컴포넌트 언마운트 시에만 이벤트 리스너 제거 (회원번호는 삭제하지 않음)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // 로딩 중이거나 유효성 검사 중일 때
  if (isValidAccess === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 유효하지 않은 접근일 때
  if (!isValidAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <Train className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-600">RAIL-O</h1>
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/login" className="text-gray-600 hover:text-blue-600">
                  로그인
                </Link>
                <Link href="/" className="text-gray-600 hover:text-blue-600">
                  홈으로
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-8 text-center">
                {/* Alert Icon */}
                <div className="mb-6">
                  <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>

                {/* Message */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">접근 제한</h2>
                  <p className="text-gray-600">
                    회원가입 완료 페이지는 회원가입 과정을 완료한 후에만 접근할 수 있습니다.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    asChild
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    <Link href="/signup">회원가입하기</Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Link href="/">홈으로 이동</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Train className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-600">RAIL-O</h1>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/login" className="text-gray-600 hover:text-blue-600">
                로그인
              </Link>
              <Link href="/" className="text-gray-600 hover:text-blue-600">
                홈으로
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-blue-500 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">회원가입 완료</h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Home className="h-4 w-4" />
              <Link href="/" className="hover:text-blue-600">
                홈
              </Link>
              <span>/</span>
              <span className="text-gray-900">회원가입 완료</span>
            </div>
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <Printer className="h-4 w-4" />
              <span>인쇄</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-12 text-center">
              {/* Success Icon */}
              <div className="mb-8">
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>

              {/* Success Message */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🎉 RAIL-O 회원가입이 완료되었습니다!</h2>
                <p className="text-gray-600 text-lg">회원님의 RAIL-O 멤버십 회원번호가 발급되었습니다.</p>
              </div>

              {/* Divider */}
              <div className="w-16 h-1 bg-blue-500 mx-auto mb-8"></div>

              {/* Member Number */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">RAIL-O 멤버십 회원번호</h3>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <p className="text-3xl font-bold text-red-600">{memberNo}</p>
                </div>
                <p className="text-sm text-gray-500 mt-2">회원번호를 기억해 주세요. 로그인 시 필요합니다.</p>
              </div>

              {/* Welcome Benefits */}
              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">🎁 회원 혜택</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>온라인 할인 혜택</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>마일리지 적립</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Train className="h-4 w-4" />
                    <span>빠른 예매 서비스</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>회원 전용 이벤트</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  size="lg"
                >
                  <Link href="/login">로그인하기</Link>
                </Button>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild variant="outline" className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50">
                    <Link href="/">홈으로 이동</Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <Link href="/ticket/search">기차표 예매</Link>
                  </Button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>안내:</strong> 회원번호는 로그인 시 아이디로 사용됩니다. 분실하지 않도록 주의해 주세요.
                  회원번호를 분실한 경우
                  <Link href="/find-account" className="text-blue-600 hover:text-blue-700 font-semibold">
                    {" "}
                    회원번호 찾기
                  </Link>
                  를 이용해 주세요.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">고객센터</h3>
              <p className="text-sm text-gray-300">1544-7788</p>
              <p className="text-sm text-gray-300">평일 05:30~23:30</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">빠른 링크</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="#" className="hover:text-white">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    개인정보처리방침
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    사이트맵
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">RAIL-O</h3>
              <p className="text-sm text-gray-300">대한민국 철도 여행의 새로운 경험</p>
              <p className="text-sm text-gray-300">© 2024 RAIL-O. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
