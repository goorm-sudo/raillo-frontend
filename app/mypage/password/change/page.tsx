"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { updatePassword } from "@/lib/api/user"
import MyPageSidebar from "@/components/layout/MyPageSidebar"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getMemberInfo, MemberInfo } from "@/lib/api/user"
import { useAuth } from "@/hooks/use-auth"

export default function PasswordChangePage() {
  const router = useRouter()
  const { isChecking, isAuthenticated } = useAuth()
  
  // 이메일 인증 체크
  useEffect(() => {
    if (!isChecking && isAuthenticated) {
      const emailVerified = sessionStorage.getItem('emailVerified')
      const emailVerifiedFor = sessionStorage.getItem('emailVerifiedFor')
      
      // 비밀번호 변경용 인증이 완료되지 않았거나, 다른 용도로 인증된 경우
      if (!emailVerified || emailVerifiedFor !== 'password_change') {
        router.push('/mypage/verify?purpose=password_change')
        return
      }
    }
  }, [isChecking, isAuthenticated, router])
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  })
  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)



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

  const togglePasswordVisibility = (field: "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const handlePasswordChange = (field: "new" | "confirm", value: string) => {
    setPasswords((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    // 유효성 검사
    if (!passwords.new || !passwords.confirm) {
      alert("모든 필드를 입력해주세요.")
      return
    }

    if (passwords.new !== passwords.confirm) {
      alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.")
      return
    }

    if (passwords.new.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.")
      return
    }

    setIsSubmitting(true)
    try {
      await updatePassword(passwords.new)
      alert("비밀번호가 성공적으로 변경되었습니다.")
      // 변경 완료 후 인증 상태 삭제
      sessionStorage.removeItem('emailVerified')
      sessionStorage.removeItem('emailVerifiedFor')
      router.push("/mypage")
    } catch (error: any) {
      console.error('비밀번호 변경 실패:', error)
      
      // API 에러 메시지 추출
      let errorMessage = "비밀번호 변경에 실패했습니다. 다시 시도해주세요."
      
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
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">비밀번호 변경</h1>

                  <div className="space-y-3 mb-8">
                    <p className="text-gray-700">• 새로운 비밀번호를 설정해 주세요.</p>
                    <p className="text-gray-700">• 비밀번호는 8자 이상 입력해 주세요.</p>
                    <p className="text-gray-700">
                      • 개인정보와 관련된 숫자, 연속된 숫자, 동일 반복된 숫자 등은 사용하지 마십시오.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* 신규 비밀번호 */}
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                      새 비밀번호 <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPasswords.new ? "text" : "password"}
                        placeholder="새 비밀번호를 입력하세요 (8자 이상)"
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
                    <p className="text-xs text-gray-500">8자 이상 입력해주세요.</p>
                  </div>

                  {/* 비밀번호 확인 */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                      새 비밀번호 확인 <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showPasswords.confirm ? "text" : "password"}
                        placeholder="새 비밀번호를 다시 입력하세요"
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
                    {passwords.confirm && (
                      <p className={`text-xs ${passwords.new === passwords.confirm ? "text-green-600" : "text-red-500"}`}>
                        {passwords.new === passwords.confirm ? "비밀번호가 일치합니다." : "비밀번호가 일치하지 않습니다."}
                      </p>
                    )}
                  </div>

                  {/* 수정완료 버튼 */}
                  <div className="pt-6">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full disabled:opacity-50"
                    >
                      {isSubmitting ? "처리 중..." : "비밀번호 변경"}
                    </Button>
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
