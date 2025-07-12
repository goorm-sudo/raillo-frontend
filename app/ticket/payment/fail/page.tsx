"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, RefreshCw, Home } from "lucide-react"

export default function PaymentFailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const errorCode = searchParams.get("error_code")
  const errorMsg = searchParams.get("error_msg")
  const error = searchParams.get("error")
  const paymentMethod = searchParams.get("paymentMethod") || "unknown"

  // 결제 수단별 표시명 매핑
  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "kakao":
        return "카카오페이"
      case "naver":
        return "네이버페이"
      case "card":
        return "신용카드"
      default:
        return "결제"
    }
  }

  const paymentMethodName = getPaymentMethodName(paymentMethod)
  const displayError = error || errorMsg || "알 수 없는 오류가 발생했습니다."

  useEffect(() => {
    // 결제 실패 로그
  }, [paymentMethodName, paymentMethod, errorCode, errorMsg, error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            결제가 취소되었습니다
          </h1>

          <div className="space-y-4 mb-8">
            <p className="text-gray-600">
              {paymentMethodName} 결제 과정에서 문제가 발생했습니다.
            </p>
            
            {displayError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  오류 메시지: {decodeURIComponent(displayError)}
                </p>
                {errorCode && (
                  <p className="text-xs text-red-600 mt-1">
                    오류 코드: {errorCode}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => router.push("/ticket/payment")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 결제하기
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>문제가 지속되면 고객센터(1544-7788)로 문의해주세요.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 