"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Train, ChevronDown, User, CreditCard, Ticket, ShoppingCart, Settings, Star, Printer, Home } from "lucide-react"
import { sendEmailVerificationCode, updatePhoneNumber } from "@/lib/api/user"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

export default function ContactChangePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isChecking, isAuthenticated } = useAuth()
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    ticketInfo: false,
    membershipPerformance: false,
    paymentManagement: false,
    memberInfoManagement: false,
  })

  const [emailAddress, setEmailAddress] = useState("")
  const [phoneNumber1, setPhoneNumber1] = useState("")
  const [phoneNumber2, setPhoneNumber2] = useState("")
  const [phoneNumber3, setPhoneNumber3] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 로딩 중이거나 인증 확인 중일 때
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 로그인되지 않은 경우
  if (!isAuthenticated) {
    return null
  }

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleEmailVerification = async () => {
    if (!emailAddress) {
      toast({
        title: "입력 오류",
        description: "이메일 주소를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailAddress)) {
      toast({
        title: "입력 오류",
        description: "올바른 이메일 형식을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await sendEmailVerificationCode(emailAddress)
      toast({
        title: "성공",
        description: "이메일 인증코드가 발송되었습니다.",
      })
      // 인증코드 입력 페이지로 이동하거나 상태를 변경할 수 있습니다
      router.push("/mypage/email/change")
    } catch (error) {
      console.error('이메일 인증코드 발송 실패:', error)
      toast({
        title: "오류",
        description: "이메일 인증코드 발송에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhoneVerification = async () => {
    if (!phoneNumber1 || !phoneNumber2 || !phoneNumber3) {
      toast({
        title: "입력 오류",
        description: "휴대폰 번호를 모두 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    const fullPhoneNumber = `${phoneNumber1}${phoneNumber2}${phoneNumber3}`
    const phoneRegex = /^01[0-9]{8}$/
    if (!phoneRegex.test(fullPhoneNumber)) {
      toast({
        title: "입력 오류",
        description: "올바른 휴대폰 번호 형식을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await updatePhoneNumber(fullPhoneNumber)
      toast({
        title: "성공",
        description: "휴대폰 번호 변경이 성공적으로 처리되었습니다.",
      })
      router.push("/mypage")
    } catch (error) {
      console.error('휴대폰 번호 변경 실패:', error)
      toast({
        title: "오류",
        description: "휴대폰 번호 변경에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-500 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">이메일/휴대폰인증</h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Home className="h-4 w-4" />
              <Link href="/" className="hover:text-blue-600">
                홈
              </Link>
              <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
              <span>회원정보관리</span>
              <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
              <span className="text-blue-600">이메일/휴대폰인증</span>
            </div>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="lg:w-80">
            {/* Profile Header */}
            <Card className="mb-6 bg-blue-600 text-white">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <Train className="h-16 w-16 mx-auto mb-2 text-white" />
                  <h2 className="text-xl font-bold">RAIL-O</h2>
                  <p className="text-blue-100">마이페이지</p>
                </div>
              </CardContent>
            </Card>

            {/* User Info Card */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    비즈니스
                  </Badge>
                </div>
                <h3 className="font-bold text-lg">김구름 회원님</h3>
                <p className="text-sm text-gray-600">마일리지: 0P</p>
              </CardContent>
            </Card>

            {/* Navigation Menu */}
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {/* 마이 코레일 */}
                  <Link
                    href="/mypage"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <User className="h-5 w-5 text-gray-600" />
                    <span>마이 RAIL-O</span>
                  </Link>

                  {/* 승차권 정보 */}
                  <Collapsible open={openSections.ticketInfo} onOpenChange={() => toggleSection("ticketInfo")}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Ticket className="h-5 w-5 text-gray-600" />
                        <span>승차권 정보</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          openSections.ticketInfo ? "rotate-180" : ""
                        }`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="bg-gray-50">
                      <Link
                        href="/ticket/purchased"
                        className="flex items-center space-x-3 px-8 py-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <span>승차권 확인</span>
                      </Link>
                      <Link
                        href="/ticket/reservations"
                        className="flex items-center space-x-3 px-8 py-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <span>예약승차권 조회/취소</span>
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 기차여행정보 */}
                  <Collapsible
                    open={openSections.membershipPerformance}
                    onOpenChange={() => toggleSection("membershipPerformance")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-gray-600" />
                        <span>기차여행정보</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          openSections.membershipPerformance ? "rotate-180" : ""
                        }`}
                      />
                    </CollapsibleTrigger>
                  </Collapsible>

                  {/* 멤버십 실적 조회 */}
                  <Collapsible
                    open={openSections.paymentManagement}
                    onOpenChange={() => toggleSection("paymentManagement")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <span>멤버십 실적 조회</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          openSections.paymentManagement ? "rotate-180" : ""
                        }`}
                      />
                    </CollapsibleTrigger>
                  </Collapsible>

                  {/* 결제관리 */}
                  <Collapsible
                    open={openSections.memberInfoManagement}
                    onOpenChange={() => toggleSection("memberInfoManagement")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Settings className="h-5 w-5 text-gray-600" />
                        <span>결제관리</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          openSections.memberInfoManagement ? "rotate-180" : ""
                        }`}
                      />
                    </CollapsibleTrigger>
                  </Collapsible>

                  {/* 회원정보관리 */}
                  <div className="px-4 py-3 text-blue-600 bg-blue-50 border-r-2 border-blue-600">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5" />
                      <span className="font-medium">회원정보관리</span>
                    </div>
                  </div>

                  {/* 장바구니 */}
                  <Link
                    href="/cart"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5 text-gray-600" />
                    <span>장바구니</span>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card>
              <CardContent className="p-8">
                {/* 서비스 안내 */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">이메일/휴대폰 인증 이용 가능한 서비스</h2>
                  <div className="space-y-2 text-gray-700">
                    <p>• 휴대폰으로 로그인하기 위해 사용되는 휴대폰번호 인증처리</p>
                    <p>• 이메일로 로그인하기 위해 사용되는 이메일 인증처리</p>
                    <p>• 이메일 또는 휴대폰으로 로그인하기 위해서는 반드시 인증절차를 거쳐야 합니다.</p>
                    <p className="text-red-500 font-medium">• 이메일/휴대폰 인증/변경은 1일 1회만 가능합니다.</p>
                  </div>
                </div>

                {/* 이메일 인증/변경 */}
                <div className="mb-12">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">이메일 인증/변경</h3>
                  <div className="space-y-3 text-sm text-gray-700 mb-6">
                    <p>• 로그인에 사용할 이메일 계정을 인증합니다.</p>
                    <p>• 인증 받은 이메일 주소로 회원정보의 이메일주소가 자동 변경 됩니다.</p>
                    <p>
                      • 인증요청을 클릭하면 나타나는 팝업창에{" "}
                      <span className="text-red-500 font-medium">입력하신 이메일 계정으로 발송된 인증코드를 입력</span>
                      하여 주십시오.
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">이메일 주소</label>
                      <Input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="이메일 주소를 입력하세요"
                        className="w-full"
                      />
                    </div>
                    <Button
                      onClick={handleEmailVerification}
                      disabled={isSubmitting}
                      variant="outline"
                      className="mt-7 px-6 py-2 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                    >
                      {isSubmitting ? "처리 중..." : "이메일 인증"}
                    </Button>
                  </div>
                </div>

                {/* 휴대폰 인증/변경 */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">휴대폰 인증/변경</h3>
                  <div className="space-y-3 text-sm text-gray-700 mb-6">
                    <p>• 로그인에 사용할 휴대폰 번호를 인증합니다.</p>
                    <p>• 인증 받은 이메일 주소로 회원정보의 이메일주소가 자동 변경 됩니다.</p>
                    <p>• 멤버십 비밀번호와 휴대폰번호를 동일하게 설정할 수 없습니다.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">휴대폰번호</label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="text"
                          value={phoneNumber1}
                          onChange={(e) => setPhoneNumber1(e.target.value)}
                          placeholder="010"
                          className="w-20 text-center"
                          maxLength={3}
                        />
                        <span className="text-gray-500">-</span>
                        <Input
                          type="text"
                          value={phoneNumber2}
                          onChange={(e) => setPhoneNumber2(e.target.value)}
                          placeholder="0000"
                          className="w-24 text-center"
                          maxLength={4}
                        />
                        <span className="text-gray-500">-</span>
                        <Input
                          type="text"
                          value={phoneNumber3}
                          onChange={(e) => setPhoneNumber3(e.target.value)}
                          placeholder="0000"
                          className="w-24 text-center"
                          maxLength={4}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handlePhoneVerification}
                      disabled={isSubmitting}
                      variant="outline"
                      className="px-6 py-2 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                    >
                      {isSubmitting ? "처리 중..." : "휴대폰 인증/변경"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
              <h3 className="font-semibold mb-4">RAIL-O 소개</h3>
              <p className="text-sm text-gray-300">
                RAIL-O는 국민의 안전하고 편리한 철도여행을 위해 최선을 다하고 있습니다.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 RAIL-O. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
