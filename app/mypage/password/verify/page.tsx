"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Train,
  ChevronLeft,
  ChevronDown,
  User,
  CreditCard,
  Ticket,
  ShoppingCart,
  Settings,
  Star,
  Smartphone,
  Monitor,
  ChevronUp,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"

export default function PasswordVerifyPage() {
  const router = useRouter()
  const { isChecking, isAuthenticated } = useAuth()
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    ticketInfo: false,
    membershipPerformance: false,
    paymentManagement: false,
    memberInfoManagement: false,
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleVerification = (method: string) => {
    // 실제로는 인증 프로세스를 거치지만, 여기서는 바로 비밀번호 변경 페이지로 이동
    router.push("/mypage/password/change")
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Train className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-600">RAIL-O</h1>
              </Link>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Link href="/" className="hover:text-blue-600">
                  홈
                </Link>
                <span>{">"}</span>
                <Link href="/mypage" className="hover:text-blue-600">
                  마이페이지
                </Link>
                <span>{">"}</span>
                <span className="text-blue-600">본인 인증하여 찾기</span>
              </div>
            </div>
            <Link href="/mypage">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ChevronLeft className="h-4 w-4" />
                <span>마이페이지</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

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
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">본인 인증하여 찾기</h1>
                  <div className="text-gray-600">
                    <p className="mb-2">
                      • 본인확인서비스 <span className="text-red-500 font-medium">(I-PIN, 휴대전화)</span>를 통하여
                      본인을 확인하는 방법입니다.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {/* 아이핀 인증 */}
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="w-32 h-32 mx-auto mb-4 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Monitor className="h-16 w-16 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-4">아이핀(I-PIN) 으로 인증</h3>
                      <Button
                        onClick={() => handleVerification("ipin")}
                        variant="outline"
                        className="px-8 py-2 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        아이핀으로 확인하기
                      </Button>
                    </div>
                  </div>

                  {/* 휴대전화 인증 */}
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="w-32 h-32 mx-auto mb-4 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Smartphone className="h-16 w-16 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-4">휴대전화로 인증</h3>
                      <Button
                        onClick={() => handleVerification("phone")}
                        variant="outline"
                        className="px-8 py-2 rounded-full border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        휴대전화로 확인하기
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 안내 섹션 */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">안내</h3>
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-blue-600">• 아이핀(i-PIN)이란?</span> 인터넷상에서 고객님의
                      주민번호를 대신하여 본인임을 확인 받을 수 있는 사이버 신원 확인 수단입니다. 아이핀 발급기관에서
                      아이핀을 발급 후 아이핀 아이디와 패스워드를 이용하시면 주민번호를 이용하지 않아도 회원가입 및 기타
                      서비스의 이용이 가능합니다.
                      <br />
                      <span className="text-gray-500">(관련법령 : 개인정보보호법 제24조)</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-600">• 휴대전화 인증</span> 주민번호 대체수단으로
                      주민등록번호 대신 본인명의로 등록 된 휴대전화 정보를 통해 본인확인을 하게 됩니다.
                    </div>
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
