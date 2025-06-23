"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Train, Home, Printer, Smartphone, Monitor, ChevronUp } from "lucide-react"

export default function SignupVerifyPage() {
  const router = useRouter()

  const handleVerification = (method: string) => {
    // 실제로는 인증 프로세스를 거치지만, 여기서는 바로 회원가입 페이지로 이동
    router.push("/signup")
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
          <h1 className="text-2xl font-bold text-center">본인 인증하여 가입</h1>
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
              <span className="text-gray-900">회원가입</span>
              <span>/</span>
              <span className="text-gray-900">본인 인증</span>
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
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">본인 인증하여 가입</h1>
                <div className="text-gray-600">
                  <p className="mb-2">
                    • 본인확인서비스 <span className="text-red-500 font-medium">(I-PIN, 휴대전화)</span>를 통하여 본인을
                    확인하는 방법입니다.
                  </p>
                  <p className="mb-2">• 기존 회원 여부를 확인한 후 회원가입을 진행합니다.</p>
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
                  <div>
                    <span className="font-medium text-blue-600">• 회원가입 절차</span> 본인인증 완료 후 기존 회원 여부를
                    확인하고, 신규 회원인 경우 회원가입 페이지로 이동합니다.
                  </div>
                </div>
              </div>

              {/* 추가 링크 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-center space-x-6 text-sm">
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                    로그인하기
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
                    홈으로
                  </Link>
                </div>
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
              <h3 className="font-semibold mb-4">RAIL-O 소개</h3>
              <p className="text-sm text-gray-300">
                한국철도공사는 국민의 안전하고 편리한 철도여행을 위해 최선을 다하고 있습니다.
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
