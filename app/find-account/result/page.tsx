"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Train, Home, Printer, User } from "lucide-react"

export default function FindAccountResultPage() {
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
          <h1 className="text-2xl font-bold text-center">회원번호 찾기 결과</h1>
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
              <Link href="/find-account" className="hover:text-blue-600">
                회원번호/비밀번호 찾기
              </Link>
              <span>/</span>
              <span className="text-gray-900">회원번호 찾기 결과</span>
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
          <Card className="bg-white shadow-lg">
            <CardContent className="p-12 text-center">
              {/* Illustration */}
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-16 w-16 text-blue-600" />
                </div>
              </div>

              {/* Success Message */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">회원님의 RAIL-O</h2>
                <p className="text-xl font-bold text-gray-900">회원번호 찾기 결과입니다.</p>
              </div>

              {/* Divider */}
              <div className="w-16 h-1 bg-gray-300 mx-auto mb-8"></div>

              {/* Member Number */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">RAIL-O 회원번호</h3>
                <div className="text-3xl font-bold text-red-500">1234567</div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Link href="/login">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg rounded-full">
                    로그인하기
                  </Button>
                </Link>
                <Link href="/find-account">
                  <Button
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 text-lg rounded-full"
                  >
                    비밀번호 찾기
                  </Button>
                </Link>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  회원번호를 기억해 두시고, 로그인 시 사용해 주세요.
                  <br />
                  비밀번호를 잊으셨다면 비밀번호 찾기를 이용해 주세요.
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
