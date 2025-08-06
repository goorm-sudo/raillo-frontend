"use client"

import Link from "next/link"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  ChevronDown,
  CreditCard,
  Settings,
  Star,
  Ticket,
  Train,
  User,
} from "lucide-react"

interface MyPageSidebarProps {
  memberInfo?: {
    name: string
    memberGrade: string
    mileage: number
  }
}

export default function MyPageSidebar({ memberInfo }: MyPageSidebarProps) {
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

  const displayName = memberInfo?.name || "회원"
  const displayGrade = memberInfo?.memberGrade || "일반"
  const displayMileage = memberInfo?.mileage || 0

  return (
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
              {displayGrade}
            </Badge>
          </div>
          <h3 className="font-bold text-lg">{displayName} 회원님</h3>
          <p className="text-sm text-gray-600">마일리지: {displayMileage}P</p>
        </CardContent>
      </Card>

      {/* Navigation Menu */}
      <Card>
        <CardContent className="p-0">
          <nav className="space-y-1">
            {/* 마이 RAIL-O */}
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
                <Link
                  href="/ticket/history"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-gray-600 hover:text-blue-600"
                >
                  <span>승차권 구입이력</span>
                </Link>
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
                <Link
                  href="/mypage/password/change"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-gray-600 hover:text-blue-600"
                >
                  <span>비밀번호 변경</span>
                </Link>
                <Link
                  href="/mypage/email/change"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-gray-600 hover:text-blue-600"
                >
                  <span>이메일 변경</span>
                </Link>
                <Link
                  href="/mypage/phone/change"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-gray-600 hover:text-blue-600"
                >
                  <span>휴대폰 번호 변경</span>
                </Link>
                <Link
                  href="/mypage/withdraw"
                  className="flex items-center space-x-3 px-8 py-2 text-sm text-gray-600 hover:text-blue-600"
                >
                  <span>회원탈퇴</span>
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </nav>
        </CardContent>
      </Card>
    </div>
  )
} 