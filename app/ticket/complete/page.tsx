"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Home, Printer, Download } from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

interface PaymentResult {
  paymentId: string
  status: string
  amount: number
  paidAt: string
  receiptUrl?: string
  pgResponse?: {
    transactionId: string
    approvalNumber?: string
    cardInfo?: {
      cardNumber: string
      cardType: string
      issuerName: string
    }
  }
}

export default function CompletePage() {
  const router = useRouter()
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null)

  useEffect(() => {
    // 세션 스토리지에서 결제 결과 가져오기
    const storedResult = sessionStorage.getItem('paymentResult')
    if (storedResult) {
      setPaymentResult(JSON.parse(storedResult))
      // 결제 결과 확인 후 세션 스토리지 정리
      sessionStorage.removeItem('paymentResult')
    } else {
      // 결제 결과가 없으면 홈으로 리다이렉트
      router.push('/')
    }
  }, [router])

  const formatPrice = (price: number) => {
    return price.toLocaleString() + "원"
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleViewReservations = () => {
    router.push('/mypage/reservations')
  }

  if (!paymentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결제 정보를 확인하고 있습니다...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-20 w-20 text-green-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">결제가 완료되었습니다!</h1>
              <p className="text-gray-600">승차권 예매가 성공적으로 완료되었습니다.</p>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>결제 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">결제 번호</p>
                  <p className="font-semibold">{paymentResult.paymentId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">결제 금액</p>
                  <p className="font-semibold text-blue-600">{formatPrice(paymentResult.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">결제 일시</p>
                  <p className="font-semibold">{formatDateTime(paymentResult.paidAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">결제 상태</p>
                  <p className="font-semibold text-green-600">완료</p>
                </div>
              </div>

              {paymentResult.pgResponse && (
                <>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">결제 상세</h4>
                    <div className="space-y-2 text-sm">
                      {paymentResult.pgResponse.approvalNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">승인번호</span>
                          <span>{paymentResult.pgResponse.approvalNumber}</span>
                        </div>
                      )}
                      {paymentResult.pgResponse.cardInfo && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">카드번호</span>
                            <span>{paymentResult.pgResponse.cardInfo.cardNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">카드사</span>
                            <span>{paymentResult.pgResponse.cardInfo.issuerName}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGoHome}
              size="lg"
              variant="outline"
              className="flex items-center justify-center"
            >
              <Home className="h-5 w-5 mr-2" />
              홈으로 가기
            </Button>
            <Button
              onClick={handleViewReservations}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
            >
              예약 내역 확인
            </Button>
          </div>

          {/* Notice */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-2">안내사항</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• 예매하신 승차권은 마이페이지에서 확인하실 수 있습니다.</li>
                <li>• 출발 20분 전까지 취소가 가능합니다.</li>
                <li>• 승차권은 모바일로 확인 가능하며, 별도 발권이 필요하지 않습니다.</li>
                <li>• 결제 영수증은 마이페이지에서 출력하실 수 있습니다.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}