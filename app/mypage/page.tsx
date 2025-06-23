"use client"

import Link from "next/link"
import { useState } from "react"
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
  Shield,
  Smartphone,
  Mail,
  Lock,
  Award,
} from "lucide-react"

export default function MyPage() {
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
                <span className="text-blue-600">마이페이지</span>
              </div>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ChevronLeft className="h-4 w-4" />
                <span>홈으로</span>
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
                    className="flex items-center space-x-3 px-4 py-3 text-blue-600 bg-blue-50 border-r-2 border-blue-600"
                  >
                    <User className="h-5 w-5" />
                    <span className="font-medium">마이 RAIL-O</span>
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
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>승차권 구입이력</span>
                      </div>
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>이용내역/영수증조회</span>
                      </div>
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>취소/반환 수수료</span>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 멤버십 실적 조회 */}
                  <Collapsible
                    open={openSections.membershipPerformance}
                    onOpenChange={() => toggleSection("membershipPerformance")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-gray-600" />
                        <span>멤버십 실적 조회</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          openSections.membershipPerformance ? "rotate-180" : ""
                        }`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="bg-gray-50">
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>마일리지 내역</span>
                      </div>
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>등급 혜택</span>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 결제관리 */}
                  <Collapsible
                    open={openSections.paymentManagement}
                    onOpenChange={() => toggleSection("paymentManagement")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <span>결제관리</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          openSections.paymentManagement ? "rotate-180" : ""
                        }`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="bg-gray-50">
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>간편구매정보등록</span>
                      </div>
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>간편현금결제 설정</span>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 회원정보관리 */}
                  <Collapsible
                    open={openSections.memberInfoManagement}
                    onOpenChange={() => toggleSection("memberInfoManagement")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Settings className="h-5 w-5 text-gray-600" />
                        <span>회원정보관리</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          openSections.memberInfoManagement ? "rotate-180" : ""
                        }`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="bg-gray-50">
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>나의 정보 수정</span>
                      </div>
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>비밀번호 변경</span>
                      </div>
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>이메일/휴대폰 인증</span>
                      </div>
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>회원탈퇴</span>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

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
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">나의 기본정보</h1>
              <span className="text-sm text-gray-500">더보기 +</span>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* 회원명 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-b">
                    <div className="font-medium text-gray-700">회원명</div>
                    <div className="md:col-span-2">
                      <span className="text-lg">김구름</span>
                    </div>
                  </div>

                  {/* 멤버십 번호 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-b">
                    <div className="font-medium text-gray-700">멤버십 번호</div>
                    <div className="md:col-span-2">
                      <span className="text-lg">2024051789</span>
                    </div>
                  </div>

                  {/* 비밀번호 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-b">
                    <div className="font-medium text-gray-700">비밀번호</div>
                    <div className="md:col-span-2">
                      <Link href="/mypage/password/verify">
                        <Button variant="outline" size="sm" className="rounded-full">
                          <Lock className="h-4 w-4 mr-2" />
                          비밀번호 변경
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* 이메일 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-b">
                    <div className="font-medium text-gray-700">이메일</div>
                    <div className="md:col-span-2">
                      <Link href="/mypage/contact/verify">
                        <Button variant="outline" size="sm" className="rounded-full">
                          <Mail className="h-4 w-4 mr-2" />
                          이메일 인증/변경
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* 휴대폰 번호 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-b">
                    <div className="font-medium text-gray-700">휴대폰 번호</div>
                    <div className="md:col-span-2">
                      <Link href="/mypage/contact/verify">
                        <Button variant="outline" size="sm" className="rounded-full">
                          <Smartphone className="h-4 w-4 mr-2" />
                          휴대폰 인증/변경
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* 카카오톡 간편로그인 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-b">
                    <div className="font-medium text-gray-700">카카오톡 간편로그인</div>
                    <div className="md:col-span-2 flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          연동해제
                        </Button>
                        <span className="text-red-500 text-sm">연동</span>
                      </div>
                    </div>
                  </div>

                  {/* APPLE ID 간편로그인 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-b">
                    <div className="font-medium text-gray-700">APPLE ID 간편로그인</div>
                    <div className="md:col-span-2 flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          로그인
                        </Button>
                        <span className="text-red-500 text-sm">미연동</span>
                      </div>
                    </div>
                  </div>

                  {/* 회원등급 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-b">
                    <div className="font-medium text-gray-700">회원등급</div>
                    <div className="md:col-span-2 flex items-center space-x-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        비즈니스
                      </Badge>
                      <Button variant="outline" size="sm" className="text-xs rounded-full">
                        혜택
                      </Button>
                    </div>
                  </div>

                  {/* KTX 마일리지/포인트 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4 border-b">
                    <div className="font-medium text-gray-700">KTX 마일리지/포인트</div>
                    <div className="md:col-span-2 flex items-center space-x-2">
                      <span className="text-lg font-semibold text-blue-600">0</span>
                      <Button variant="outline" size="sm" className="text-xs rounded-full">
                        <Award className="h-3 w-3 mr-1" />
                        내역보기
                      </Button>
                    </div>
                  </div>

                  {/* 간편현금결제 설정 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-4">
                    <div className="font-medium text-gray-700">간편현금결제 설정</div>
                    <div className="md:col-span-2">
                      <Button variant="outline" size="sm" className="rounded-full">
                        <Shield className="h-4 w-4 mr-2" />
                        설정
                      </Button>
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
