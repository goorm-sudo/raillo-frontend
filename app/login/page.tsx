"use client"

import Link from "next/link"
import {useEffect, useState, useCallback} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Eye, EyeOff, Lock, User} from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import {useRouter, useSearchParams} from "next/navigation"
import {login} from "@/lib/api/auth"
import {tokenManager} from "@/lib/auth"
import { handleError } from '@/lib/utils/errorHandler'

export default function LoginPage() {
  const [memberNumber, setMemberNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 리다이렉트 메시지 생성
  const redirectTo = searchParams.get('redirectTo')
  const redirectMessage = redirectTo ? '로그인이 필요한 서비스입니다.' : null

  // 페이지 로드 시 localStorage에서 회원번호 가져오기
  useEffect(() => {
    const storedMemberNo = localStorage.getItem('signupMemberNo')
    if (storedMemberNo) {
      setMemberNumber(storedMemberNo)
      // 회원번호를 가져온 후 localStorage에서 삭제
      localStorage.removeItem('signupMemberNo')
    }
  }, [])

  // 로그인 상태 체크 - useCallback으로 최적화
  const checkAuth = useCallback(() => {
    const authenticated = tokenManager.isAuthenticated()
    setIsLoggedIn(authenticated)
    
    if (authenticated) {
      // 이미 로그인된 경우 메인 페이지로 리다이렉트
      router.push('/')
    }
  }, [router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // 로딩 중이거나 인증 확인 중일 때
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
        <Footer />
      </div>
    )
  }

  // 이미 로그인된 경우 (리다이렉트 중)
  if (isLoggedIn) {
    return null
  }

  const handleMemberLogin = async () => {
    if (!memberNumber || !password) {
      alert("회원번호와 비밀번호를 모두 입력해주세요.")
      return
    }

    if (isLoading) return // 중복 클릭 방지

    setIsLoading(true)

    try {
      const response = await login({ memberNo: memberNumber, password })
      
      if (response.result) {
        // 토큰들을 localStorage에 저장
        tokenManager.setLoginTokens(
          response.result.accessToken,
          response.result.refreshToken,
          response.result.accessTokenExpiresIn
        )
        
        // redirectTo 쿼리 파라미터가 있으면 해당 경로로 이동, 없으면 /로 이동
        const redirectTo = searchParams.get('redirectTo')
        const targetPath = redirectTo ? redirectTo : "/"
        
        // router.push 사용으로 변경 (더 빠른 클라이언트 사이드 네비게이션)
        router.push(targetPath)
      }
    } catch (error: any) {
      handleError(error, "로그인에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-md mx-auto">
          {/* Login Card */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">로그인</CardTitle>
              <CardDescription className="text-gray-600">회원번호로 로그인하세요</CardDescription>
              {redirectMessage && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">{redirectMessage}</p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {/* 회원번호 로그인 */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="memberNumber" className="text-sm font-medium text-gray-700">
                    회원번호
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="memberNumber"
                      type="text"
                      placeholder="회원번호를 입력하세요"
                      value={memberNumber}
                      onChange={(e) => setMemberNumber(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    비밀번호
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleMemberLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      로그인 중...
                    </div>
                  ) : (
                    "로그인"
                  )}
                </Button>
              </div>

              {/* 찾기 및 회원가입 링크 */}
              <div className="mt-6">
                <div className="flex justify-center space-x-4 text-sm">
                  <Link href="/find-account?tab=member" className="text-gray-600 hover:text-blue-600">
                    회원번호 찾기
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link href="/find-account?tab=password" className="text-gray-600 hover:text-blue-600">
                    비밀번호 찾기
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link href="/signup" className="text-gray-600 hover:text-blue-600">
                    회원가입
                  </Link>
                </div>
              </div>

              {/* 추가 안내 */}
              <div className="text-center text-xs text-gray-500 mt-6">
                <p>로그인 시 RAIL-O의 이용약관 및 개인정보처리방침에 동의하게 됩니다.</p>
              </div>
            </CardContent>
          </Card>

          {/* 회원가입 안내 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              아직 RAIL-O 회원이 아니신가요?{" "}
              <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                회원가입하기
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
