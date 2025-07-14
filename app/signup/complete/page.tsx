"use client"

import Link from "next/link"
import {useEffect, useState} from "react"
import {useRouter, useSearchParams} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {AlertCircle, CheckCircle, CreditCard, Train, User} from "lucide-react"
import PageLayout from "@/components/layout/PageLayout"

export default function SignupCompletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [memberNo, setMemberNo] = useState<string>('')
  const [isValidAccess, setIsValidAccess] = useState<boolean | null>(null)

  useEffect(() => {
    // localStorage에서 회원번호 가져오기
    const storedMemberNo = localStorage.getItem('signupMemberNo')

    if (!storedMemberNo) {
      setIsValidAccess(false)
      return
    }

    setMemberNo(storedMemberNo)
    setIsValidAccess(true)
  }, [])

  // 로딩 중이거나 유효성 검사 중일 때
  if (isValidAccess === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 유효하지 않은 접근일 때
  if (!isValidAccess) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 제한</h1>
            <p className="text-gray-600 mb-8">
              유효하지 않은 접근입니다.
              <br />
              회원가입 완료 후 이 페이지에 접근할 수 있습니다.
            </p>
            <div className="space-y-4">
              <Link href="/signup">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  회원가입하기
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  홈으로 돌아가기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
                    {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">회원가입 완료</h1>
            <p className="text-gray-600">RAIL-O 멤버십에 가입해주셔서 감사합니다</p>
          </div>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-12 text-center">
              {/* Success Icon */}
              <div className="mb-8">
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>

              {/* Success Message */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">🎉 RAIL-O 회원가입이 완료되었습니다!</h2>
                <p className="text-gray-600 text-lg">회원님의 RAIL-O 멤버십 회원번호가 발급되었습니다.</p>
              </div>

              {/* Divider */}
              <div className="w-16 h-1 bg-blue-500 mx-auto mb-8"></div>

              {/* Member Number */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">RAIL-O 멤버십 회원번호</h3>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <p className="text-3xl font-bold text-red-600">{memberNo}</p>
                </div>
                <p className="text-sm text-gray-500 mt-2">회원번호를 기억해 주세요. 로그인 시 필요합니다.</p>
              </div>

              {/* Welcome Benefits */}
              <div className="bg-blue-50 rounded-lg p-6 mb-8">
                <h4 className="text-lg font-semibold text-blue-900 mb-4">🎁 회원 혜택</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-4 w-4" />
                    <span>온라인 할인 혜택</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>마일리지 적립</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Train className="h-4 w-4" />
                    <span>빠른 예매 서비스</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>회원 전용 이벤트</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  size="lg"
                >
                  <Link href="/login">로그인하기</Link>
                </Button>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild variant="outline" className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50">
                    <Link href="/">홈으로 이동</Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <Link href="/ticket/booking">기차표 예매</Link>
                  </Button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>안내:</strong> 회원번호는 로그인 시 아이디로 사용됩니다. 분실하지 않도록 주의해 주세요.
                  회원번호를 분실한 경우
                  <Link href="/find-account" className="text-blue-600 hover:text-blue-700 font-semibold">
                    {" "}
                    회원번호 찾기
                  </Link>
                  를 이용해 주세요.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
