"use client"

import Link from "next/link"
import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {Apple, Eye, EyeOff, Lock, Mail, Phone, User, UserX} from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import {useRouter, useSearchParams} from "next/navigation"
import {login} from "@/lib/api/auth"
import {tokenManager} from "@/lib/auth"
import { handleError } from '@/lib/utils/errorHandler'

export default function LoginPage() {
  const [memberNumber, setMemberNumber] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showGuestDialog, setShowGuestDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("member")
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // 페이지 로드 시 localStorage에서 회원번호 가져오기
  useEffect(() => {
    const storedMemberNo = localStorage.getItem('signupMemberNo')
    if (storedMemberNo) {
      setMemberNumber(storedMemberNo)
      // 회원번호를 가져온 후 localStorage에서 삭제
      localStorage.removeItem('signupMemberNo')
    }
  }, [])

  // 로그인 상태 체크
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = tokenManager.isAuthenticated()
      setIsLoggedIn(authenticated)
      
      if (authenticated) {
        // 이미 로그인된 경우 메인 페이지로 리다이렉트
        router.push('/')
      }
    }

    checkAuth()
  }, [router])

  // 로딩 중이거나 인증 확인 중일 때
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
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
        window.location.href = redirectTo ? redirectTo : "/"
      }
    } catch (error: any) {
      handleError(error, "로그인에 실패했습니다.")
    }
  }

  const handleEmailLogin = () => {
    if (!email || !password) {
      alert("이메일과 비밀번호를 모두 입력해주세요.")
      return
    }

    console.log("이메일 로그인 시도:", {
      email,
      password,
    })

    alert(`이메일 ${email}로 로그인을 시도합니다.`)
  }

  const handlePhoneLogin = () => {
    if (!phoneNumber || !password) {
      alert("휴대폰 번호와 비밀번호를 모두 입력해주세요.")
      return
    }

    console.log("휴대폰 로그인 시도:", {
      phoneNumber,
      password,
    })

    alert(`휴대폰 번호 ${phoneNumber}로 로그인을 시도합니다.`)
  }

  const handleGuestBookingClick = () => {
    setShowGuestDialog(true)
  }

  const handleGuestBookingConfirm = () => {
    console.log("비회원 예매 이동")
    setShowGuestDialog(false)
    // 비회원 예매 페이지로 이동하는 대신 승차권 예매 페이지로 이동하되 guest 파라미터 추가
    window.location.href = "/ticket/booking?guest=true"
  }

  const handleKakaoLogin = () => {
    console.log("카카오 로그인 시도")
    alert("카카오 로그인을 시도합니다.")
  }

  const handleAppleLogin = () => {
    console.log("애플 로그인 시도")
    alert("애플 로그인을 시도합니다.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Login Card */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">로그인</CardTitle>
              <CardDescription className="text-gray-600">다양한 방법으로 로그인하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="member" className="text-xs">
                    <User className="h-4 w-4 mr-1" />
                    회원번호
                  </TabsTrigger>
                  <TabsTrigger value="email" className="text-xs">
                    <Mail className="h-4 w-4 mr-1" />
                    이메일
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="text-xs">
                    <Phone className="h-4 w-4 mr-1" />
                    휴대폰
                  </TabsTrigger>
                  <TabsTrigger value="guest" className="text-xs">
                    <UserX className="h-4 w-4 mr-1" />
                    비회원예매
                  </TabsTrigger>
                </TabsList>

                {/* 회원번호 로그인 */}
                <TabsContent value="member" className="space-y-4 mt-6">
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
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleMemberLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                    size="lg"
                  >
                    로그인
                  </Button>
                </TabsContent>

                {/* 이메일 로그인 */}
                <TabsContent value="email" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      이메일 주소
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="이메일을 입력하세요"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailPassword" className="text-sm font-medium text-gray-700">
                      비밀번호
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="emailPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleEmailLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                    size="lg"
                  >
                    로그인
                  </Button>
                </TabsContent>

                {/* 휴대폰 로그인 */}
                <TabsContent value="phone" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                      휴대폰 번호
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="휴대폰 번호를 입력하세요"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phonePassword" className="text-sm font-medium text-gray-700">
                      비밀번호
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phonePassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handlePhoneLogin}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                    size="lg"
                  >
                    로그인
                  </Button>
                </TabsContent>

                {/* 비회원 예매 */}
                <TabsContent value="guest" className="space-y-4 mt-6">
                  <div className="text-center py-8">
                    <UserX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">비회원 예매</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      회원가입 없이도 승차권을 예매할 수 있습니다.
                      <br />
                      단, 일부 서비스는 제한될 수 있습니다.
                    </p>
                    <Button
                      onClick={handleGuestBookingClick}
                      variant="outline"
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3"
                      size="lg"
                    >
                      비회원 예매하기
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {/* 찾기 및 회원가입 링크 */}
              {activeTab !== "guest" && (
                <div className="mt-6">
                  <div className="flex justify-center space-x-4 text-sm">
                    {activeTab === "member" && (
                      <>
                        <Link href="/find-account" className="text-gray-600 hover:text-blue-600">
                          회원번호 찾기
                        </Link>
                        <span className="text-gray-300">|</span>
                      </>
                    )}
                    {activeTab === "email" && (
                      <>
                        <Link href="/find-account" className="text-gray-600 hover:text-blue-600">
                          이메일 찾기
                        </Link>
                        <span className="text-gray-300">|</span>
                      </>
                    )}
                    {activeTab === "phone" && (
                      <>
                        <Link href="/find-account" className="text-gray-600 hover:text-blue-600">
                          휴대폰 찾기
                        </Link>
                        <span className="text-gray-300">|</span>
                      </>
                    )}
                    <Link href="/find-account" className="text-gray-600 hover:text-blue-600">
                      비밀번호 찾기
                    </Link>
                    <span className="text-gray-300">|</span>
                    <Link href="/signup" className="text-gray-600 hover:text-blue-600">
                      회원가입
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === "guest" && (
                <div className="mt-6 text-center text-sm">
                  <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                    회원가입하고 더 많은 혜택 받기
                  </Link>
                </div>
              )}

              {/* 구분선 */}
              {activeTab !== "guest" && (
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">또는</span>
                  </div>
                </div>
              )}

              {/* 간편 로그인 */}
              {activeTab !== "guest" && (
                <div className="space-y-3 mt-6">
                  {/* 카카오 로그인 */}
                  <Button
                    onClick={handleKakaoLogin}
                    variant="outline"
                    className="w-full bg-yellow-300 hover:bg-yellow-400 text-gray-900 border-yellow-300 font-semibold py-3"
                    size="lg"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 bg-gray-900 rounded-sm flex items-center justify-center">
                        <span className="text-yellow-300 text-xs font-bold">K</span>
                      </div>
                      <span>카카오 간편로그인</span>
                    </div>
                  </Button>

                  {/* 애플 로그인 */}
                  <Button
                    onClick={handleAppleLogin}
                    variant="outline"
                    className="w-full bg-black hover:bg-gray-800 text-white border-black font-semibold py-3"
                    size="lg"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Apple className="h-5 w-5" />
                      <span>Apple로 로그인</span>
                    </div>
                  </Button>
                </div>
              )}

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

      {/* 비회원 예매 확인 다이얼로그 */}
      <AlertDialog open={showGuestDialog} onOpenChange={setShowGuestDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>비회원 예매</AlertDialogTitle>
            <AlertDialogDescription>
              비회원으로 예매하시겠습니까?
              <br />
              승차권 예매 페이지로 이동합니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleGuestBookingConfirm}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer */}
      <Footer />
    </div>
  )
}
