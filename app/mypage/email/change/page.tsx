"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Train, Mail } from "lucide-react"
import { sendEmailVerificationCode, updateEmail } from "@/lib/api/user"
import { useRouter } from "next/navigation"
import MyPageSidebar from "@/components/layout/MyPageSidebar"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getMemberInfo, MemberInfo } from "@/lib/api/user"
import { useAuth } from "@/hooks/use-auth"


export default function EmailChangePage() {
  const router = useRouter()
  const { isChecking, isAuthenticated } = useAuth()
  
  // 이메일 인증 체크
  useEffect(() => {
    if (!isChecking && isAuthenticated) {
      const emailVerified = sessionStorage.getItem('emailVerified')
      const emailVerifiedFor = sessionStorage.getItem('emailVerifiedFor')
      
      // 이메일 변경용 인증이 완료되지 않았거나, 다른 용도로 인증된 경우
      if (!emailVerified || emailVerifiedFor !== 'email_change') {
        router.push('/mypage/verify?purpose=email_change')
        return
      }
    }
  }, [isChecking, isAuthenticated, router])
  
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailAddress, setEmailAddress] = useState("")
  const [authCode, setAuthCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showVerification, setShowVerification] = useState(false)

  useEffect(() => {
    const fetchMemberInfo = async () => {
      if (isAuthenticated) {
        try {
          const info = await getMemberInfo()
          setMemberInfo(info)
        } catch (error) {
          console.error('회원 정보 조회 실패:', error)
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

  // 로그인되지 않은 경우
  if (!isAuthenticated) {
    return null
  }

  const handleSendVerificationCode = async () => {
    if (!emailAddress) {
      alert("이메일 주소를 입력해주세요.")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailAddress)) {
      alert("올바른 이메일 형식을 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    try {
      await sendEmailVerificationCode(emailAddress)
      alert("인증코드가 이메일로 발송되었습니다.")
      setShowVerification(true)
    } catch (error: any) {
      console.error('인증코드 발송 실패:', error)
      
      let errorMessage = "인증코드 발송에 실패했습니다. 다시 시도해주세요."
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAuthCodeChange = (value: string) => {
    // 숫자만 허용, 6자리 제한
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 6)
    setAuthCode(numericValue)
  }

  const handleEmailChange = async () => {
    if (!authCode) {
      alert("인증코드를 입력해주세요.")
      return
    }

    if (authCode.length !== 6) {
      alert("인증코드는 6자리 숫자로 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    try {
      await updateEmail(emailAddress, authCode)
      alert("이메일 변경이 성공적으로 처리되었습니다.")
      // 변경 완료 후 인증 상태 삭제
      sessionStorage.removeItem('emailVerified')
      sessionStorage.removeItem('emailVerifiedFor')
      router.push("/mypage")
    } catch (error: any) {
      console.error('이메일 변경 실패:', error)
      
      let errorMessage = "이메일 변경에 실패했습니다. 다시 시도해주세요."
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <Card>
              <CardContent className="p-8">
                {/* 서비스 안내 */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">이메일 변경</h2>
                  <div className="space-y-2 text-gray-700">
                    <p>• 로그인에 사용할 이메일 계정을 변경합니다.</p>
                    <p>• 변경된 이메일 주소로 회원정보의 이메일주소가 자동 변경됩니다.</p>
                  </div>
                </div>

                {/* 이메일 변경 폼 */}
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">새 이메일 주소 입력</h3>
                  <div className="space-y-3 text-sm text-gray-700 mb-6">
                    <p>• 변경할 이메일 주소를 입력해주세요.</p>
                    <p>• 입력하신 이메일로 인증 메일이 발송됩니다.</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">새 이메일 주소</label>
                      <Input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="새 이메일 주소를 입력하세요"
                        className="w-full"
                        disabled={showVerification}
                      />
                    </div>
                    <Button
                      onClick={handleSendVerificationCode}
                      disabled={isSubmitting || showVerification}
                      className="mt-7 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50"
                    >
                      {isSubmitting ? "처리 중..." : "인증코드 발송"}
                    </Button>
                  </div>
                </div>

                {/* 인증코드 입력 */}
                {showVerification && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">인증코드 확인</h3>
                    <div className="space-y-3 text-sm text-gray-700 mb-6">
                      <p>• 입력하신 이메일로 발송된 인증코드를 입력해주세요.</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">인증코드</label>
                        <Input
                          type="text"
                          value={authCode}
                          onChange={(e) => handleAuthCodeChange(e.target.value)}
                          placeholder="인증코드 6자리 입력"
                          maxLength={6}
                          className="w-full"
                        />
                      </div>
                      <Button
                        onClick={handleEmailChange}
                        disabled={isSubmitting}
                        className="mt-7 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50"
                      >
                        {isSubmitting ? "처리 중..." : "이메일 변경"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* 주의사항 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">주의사항</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• 이메일 변경 후 기존 이메일로는 로그인할 수 없습니다.</li>
                    <li>• 변경된 이메일로 인증 메일이 발송되므로 정확히 입력해주세요.</li>
                    <li>• 인증 메일을 확인하여 변경을 완료해주세요.</li>
                  </ul>
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