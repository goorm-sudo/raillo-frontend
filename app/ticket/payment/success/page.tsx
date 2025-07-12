"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Train } from "lucide-react"
import apiClient from "@/lib/api/client"

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [paymentResult, setPaymentResult] = useState<any>(null)

  const pgToken = searchParams.get("pg_token")
  const reservationId = searchParams.get("reservation_id")

  useEffect(() => {
    const approvePayment = async () => {
      try {
        // 카카오페이 결제 승인 요청

        const response = await apiClient.post("/api/v1/payments/pg/approve", {
          paymentMethod: "KAKAO_PAY",
          pgTransactionId: pgToken,
          merchantOrderId: reservationId
        })

        // 카카오페이 결제 승인 완료
        setPaymentResult(response.data)
        
        // 3초 후 결제 완료 페이지로 이동
        setTimeout(() => {
          router.push(`/ticket/payment-complete?reservationId=${reservationId}`)
        }, 3000)

      } catch (error: any) {
        // 카카오페이 결제 승인 실패
        
        if (error.response?.status === 404) {
          // 백엔드가 없을 때 개발 모드
          // 백엔드 연결 실패 - 개발 모드로 진행
          setTimeout(() => {
            router.push(`/ticket/payment-complete?reservationId=${reservationId}`)
          }, 2000)
        } else {
          alert(`결제 승인 실패: ${error.message}`)
          router.push("/ticket/payment")
        }
      } finally {
        setIsProcessing(false)
      }
    }

    if (pgToken && reservationId) {
      approvePayment()
    } else {
      alert("잘못된 결제 요청입니다.")
      router.push("/ticket/payment")
    }
  }, [pgToken, reservationId, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            카카오페이 결제 처리중
          </h1>

          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">결제 승인 중...</span>
            </div>

            <p className="text-sm text-gray-500">
              결제 승인이 완료되면 자동으로 이동됩니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 