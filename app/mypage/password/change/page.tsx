"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Train, ChevronDown, User, CreditCard, Ticket, ShoppingCart, Settings, Star, Eye, EyeOff } from "lucide-react"

export default function PasswordChangePage() {
  const router = useRouter()
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  })
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

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handlePasswordChange = (field: "current" | "new" | "confirm", value: string) => {
    setPasswords((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = () => {
    // 비밀번호 변경 로직
    alert("비밀번호가 성공적으로 변경되었습니다.")
    router.push("/mypage")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">비밀번호 변경</h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              홈
            </Link>
            <span>{">"}</span>
            <Link href="/mypage" className="hover:text-blue-600">
              회원정보관리
            </Link>
            <span>{">"}</span>
            <span className="text-blue-600">비밀번호 변경</span>
            <div className="ml-auto">
              <Button variant="ghost" size="sm">
                🖨️
              </Button>
            </div>
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
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">비밀번호 변경 이용 가능한 서비스</h1>

                  <div className="space-y-3 mb-8">
                    <p className="text-gray-700">• 홈페이지 비밀번호 (영문자, 숫자, 특수문자 2가지 이상) 변경</p>
                    <p className="text-gray-700">• 현장발권 비밀번호 (4자리)변경</p>
                    <p className="text-gray-700">
                      • 개인정보와 관련된 숫자, 연속된 숫자, 동일 반복된 숫자 등은 사용하지 마십시오.
                    </p>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">홈페이지 비밀번호 변경</h2>
                    <p className="text-gray-600 mb-6">
                      코레일 홈페이지, 코레일 톡에서 사용하는 비밀번호 입니다.{" "}
                      <span className="text-red-500">(영문자, 숫자, 특수문자 2가지의 비밀번호 입니다.)</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* 기존 비밀번호 */}
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-base font-medium">
                      기존 비밀번호 <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPasswords.current ? "text" : "password"}
                        placeholder="기존 비밀번호를 입력하세요"
                        value={passwords.current}
                        onChange={(e) => handlePasswordChange("current", e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility("current")}
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* 신규 비밀번호 */}
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-base font-medium">
                      신규 비밀번호 <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPasswords.new ? "text" : "password"}
                        placeholder="신규 비밀번호를 입력하세요"
                        value={passwords.new}
                        onChange={(e) => handlePasswordChange("new", e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility("new")}
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* 비밀번호 확인 */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-base font-medium">
                      비밀번호 확인 <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPasswords.confirm ? "text" : "password"}
                        placeholder="확인 비밀번호를 입력하세요"
                        value={passwords.confirm}
                        onChange={(e) => handlePasswordChange("confirm", e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => togglePasswordVisibility("confirm")}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* 수정완료 버튼 */}
                  <div className="pt-6">
                    <Button
                      onClick={handleSubmit}
                      className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                    >
                      수정완료
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
