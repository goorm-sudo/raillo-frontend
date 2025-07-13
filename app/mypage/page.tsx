"use client"

import Link from "next/link"
import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {
  Award,
  Lock,
  Mail,
  Shield,
  Smartphone,
} from "lucide-react"
import {tokenManager} from "@/lib/auth"
import {useRouter} from "next/navigation"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import {getMemberInfo, MemberInfo} from "@/lib/api/user"
import { useAuth } from "@/hooks/use-auth"
import MyPageSidebar from "@/components/layout/MyPageSidebar"

export default function MyPage() {
  const { isChecking, isAuthenticated } = useAuth()
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  useEffect(() => {
    const fetchMemberInfo = async () => {
      if (isAuthenticated) {
        try {
          const info = await getMemberInfo()
          setMemberInfo(info)
        } catch (error) {
          console.error('회원 정보 조회 실패:', error)
          // 에러 발생 시에도 페이지는 표시하되, 기본값 사용
        } finally {
          setLoading(false)
        }
      }
    }

    fetchMemberInfo()
  }, [isAuthenticated])

  // 로딩 중이거나 인증 확인 중일 때
  if (isChecking || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">페이지를 불러오는 중...</p>
        </div>
        <Footer />
      </div>
    )
  }

  // 로그인되지 않은 경우 (리다이렉트 중)
  if (!isAuthenticated) {
    return null
  }

  // 회원 정보가 없을 때 기본값 사용
  const displayName = memberInfo?.name || "회원"
  const displayMemberId = memberInfo?.memberId || "로딩 중..."
  const displayEmail = memberInfo?.email || "인증 필요"
  const displayPhone = memberInfo?.phoneNumber || "인증 필요"
  const displayGrade = memberInfo?.memberGrade || "일반"
  const displayMileage = memberInfo?.mileage || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <MyPageSidebar memberInfo={memberInfo || undefined} />

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">나의 기본정보</h1>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {/* 회원명 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5 border-b border-gray-100">
                    <div className="font-medium text-gray-700">회원명</div>
                    <div className="md:col-span-2">
                      <span className="text-lg">{displayName}</span>
                    </div>
                  </div>

                  {/* 멤버십 번호 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5 border-b border-gray-100">
                    <div className="font-medium text-gray-700">멤버십 번호</div>
                    <div className="md:col-span-2">
                      <span className="text-lg">{displayMemberId}</span>
                    </div>
                  </div>

                  {/* 비밀번호 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5 border-b border-gray-100">
                    <div className="font-medium text-gray-700">비밀번호</div>
                    <div className="md:col-span-2">
                      <Link href="/mypage/password/change">
                        <Button variant="outline" size="sm" className="h-8 px-4 text-sm rounded-full">
                          <Lock className="h-4 w-4 mr-2" />
                          비밀번호 변경
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* 이메일 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5 border-b border-gray-100">
                    <div className="font-medium text-gray-700">이메일</div>
                    <div className="md:col-span-2">
                      <Link href="/mypage/email/change">
                        <Button variant="outline" size="sm" className="h-8 px-4 text-sm rounded-full">
                          <Mail className="h-4 w-4 mr-2" />
                          이메일 변경
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* 휴대폰 번호 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5 border-b border-gray-100">
                    <div className="font-medium text-gray-700">휴대폰 번호</div>
                    <div className="md:col-span-2">
                      <Link href="/mypage/phone/change">
                        <Button variant="outline" size="sm" className="h-8 px-4 text-sm rounded-full">
                          <Smartphone className="h-4 w-4 mr-2" />
                          휴대폰 번호 변경
                        </Button>
                      </Link>
                    </div>
                  </div>



                  {/* 회원등급 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5 border-b border-gray-100">
                    <div className="font-medium text-gray-700">회원등급</div>
                    <div className="md:col-span-2 flex items-center space-x-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-sm px-3 py-1">
                        {displayGrade}
                      </Badge>
                    </div>
                  </div>

                  {/* KTX 마일리지/포인트 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-5">
                    <div className="font-medium text-gray-700">KTX 마일리지/포인트</div>
                    <div className="md:col-span-2 flex items-center space-x-2">
                      <span className="text-lg font-semibold text-blue-600">{displayMileage}</span>
                      <Button variant="outline" size="sm" className="h-8 px-4 text-sm rounded-full">
                        <Award className="h-3 w-3 mr-1" />
                        내역보기
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
      <Footer />
    </div>
  )
}
