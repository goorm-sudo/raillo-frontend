"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Train, Home, Printer, FileText, Mail, Phone, ArrowLeft, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export default function FindAccountPage() {
  const [memberName, setMemberName] = useState("")
  const [memberPhone, setMemberPhone] = useState("")
  const [passwordName, setPasswordName] = useState("")
  const [passwordMemberNumber, setPasswordMemberNumber] = useState("")
  const [activeTab, setActiveTab] = useState("member")

  const router = useRouter()

  const handleFindMember = () => {
    if (!memberName || !memberPhone) {
      alert("이름과 휴대폰번호를 모두 입력해주세요.")
      return
    }

    // 회원번호 찾기 결과 페이지로 이동
    router.push("/find-account/result")
  }

  const handleFindPassword = () => {
    if (!passwordName || !passwordMemberNumber) {
      alert("이름과 회원번호를 모두 입력해주세요.")
      return
    }

    // 회원 확인 후 본인인증 페이지로 이동
    router.push("/find-account/verify")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      {/* Page Header */}
      <div className="bg-blue-500 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">회원번호/비밀번호 찾기</h1>
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
              <span className="text-gray-900">회원번호/비밀번호 찾기</span>
            </div>
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <Printer className="h-4 w-4" />
              <span>인쇄</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger
                    value="member"
                    className="text-lg py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    회원번호 찾기
                  </TabsTrigger>
                  <TabsTrigger
                    value="password"
                    className="text-lg py-3 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    비밀번호 찾기
                  </TabsTrigger>
                </TabsList>

                {/* 회원번호 찾기 */}
                <TabsContent value="member" className="space-y-8">
                  <div className="text-center mb-8">
                    <p className="text-lg text-gray-700">
                      본인이름과 회원가입 시 입력(변경) 한 휴대전화 번호로 회원번호를 찾으실 수 있습니다.
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="memberName" className="text-lg font-medium text-gray-700">
                          이름
                        </Label>
                        <Input
                          id="memberName"
                          type="text"
                          placeholder="본인이름을 입력하세요"
                          value={memberName}
                          onChange={(e) => setMemberName(e.target.value)}
                          className="h-12 text-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="memberPhone" className="text-lg font-medium text-gray-700">
                          휴대폰번호
                        </Label>
                        <Input
                          id="memberPhone"
                          type="tel"
                          placeholder="휴대폰번호를 -없이 입력하세요"
                          value={memberPhone}
                          onChange={(e) => setMemberPhone(e.target.value)}
                          className="h-12 text-lg"
                        />
                      </div>
                    </div>

                    <div className="text-center pt-4">
                      <Button
                        onClick={handleFindMember}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-12 py-3 text-lg rounded-full"
                        size="lg"
                      >
                        회원번호 찾기
                      </Button>
                    </div>
                  </div>

                  {/* 안내 사항 */}
                  <div className="bg-gray-100 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">등록한 회원정보로 찾을 수 없는 경우</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          휴대폰번호가 바뀌었거나 이전 휴대폰번호를 알 수 없는 경우 아이핀 인증 또는 휴대전화로 인증 후
                          회원번호를 찾을 수 있습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 비밀번호 찾기 */}
                <TabsContent value="password" className="space-y-8">
                  <div className="text-center mb-8">
                    <p className="text-lg text-gray-700">본인이름과 회원번호를 입력 후 조회하세요.</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="passwordName" className="text-lg font-medium text-gray-700">
                          이름
                        </Label>
                        <Input
                          id="passwordName"
                          type="text"
                          placeholder="본인이름을 입력하세요"
                          value={passwordName}
                          onChange={(e) => setPasswordName(e.target.value)}
                          className="h-12 text-lg"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="passwordMemberNumber" className="text-lg font-medium text-gray-700">
                          회원번호
                        </Label>
                        <Input
                          id="passwordMemberNumber"
                          type="text"
                          placeholder="코레일 회원번호를 입력하세요"
                          value={passwordMemberNumber}
                          onChange={(e) => setPasswordMemberNumber(e.target.value)}
                          className="h-12 text-lg"
                        />
                      </div>
                    </div>

                    <div className="text-center pt-4">
                      <Button
                        onClick={handleFindPassword}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-12 py-3 text-lg rounded-full"
                        size="lg"
                      >
                        조회
                      </Button>
                    </div>
                  </div>

                  {/* 안내 사항 */}
                  <div className="bg-gray-100 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">비밀번호 찾기 안내</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          회원번호를 모르시는 경우 먼저 회원번호 찾기를 이용해 주세요. 본인 확인 후 임시 비밀번호가
                          등록된 휴대폰번호로 발송됩니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* 추가 링크 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-center space-x-6 text-sm">
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                    로그인하기
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                    회원가입하기
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
