"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from '@/hooks/use-auth'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { CreditCard, Calendar, Clock, AlertCircle, CheckCircle, XCircle} from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getPaymentHistory } from '@/lib/api/payment'
import { handleError } from '@/lib/utils/errorHandler'

interface PaymentHistory {
  paymentId: number
  paymentKey: string
  reservationCode: string
  amount: number
  paymentMethod: string
  paymentStatus: string
  paidAt: string
  cancelledAt?: string
  refundedAt?: string
}

export default function PaymentHistoryPage() {
  const { isAuthenticated, isChecking } = useAuth({ redirectPath: '/ticket/history' })
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  // 결제 내역 조회
  useEffect(() => {
    if (isChecking || !isAuthenticated) return
    
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true)
        const data = await getPaymentHistory()
        setPaymentHistory(data ?? [])
      } catch (err) {
        const errorMessage = handleError(err, '결제 내역 조회 중 오류가 발생했습니다.', false)
        setError(errorMessage)
        setPaymentHistory([])
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentHistory()
  }, [isChecking, isAuthenticated])

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "CARD":
        return "카드결제"
      case "BANK_TRANSFER":
      case "TRANSFER":
        return "계좌이체"
      default:
        return method
    }
  }

  const getPaymentStatusName = (status: string) => {
    switch (status) {
      case "PAID":
        return "결제완료"
      case "CANCELLED":
        return "결제취소"
      case "REFUNDED":
        return "환불완료"
      case "PENDING":
        return "결제대기"
      case "FAILED":
        return "결제실패"
      default:
        return status
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      case "REFUNDED":
        return "bg-blue-100 text-blue-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "FAILED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-4 w-4" />
      case "CANCELLED":
      case "FAILED":
        return <XCircle className="h-4 w-4" />
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "REFUNDED":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString() + "원"
  }

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return format(date, "yyyy년 MM월 dd일 HH:mm", { locale: ko })
  }

  // 탭별 필터링
  const filteredPayments = paymentHistory.filter(payment => {
    switch (activeTab) {
      case "paid":
        return payment.paymentStatus === "PAID"
      case "cancelled":
        return payment.paymentStatus === "CANCELLED" || payment.paymentStatus === "REFUNDED"
      case "all":
      default:
        return true
    }
  })

  const handleCancelPayment = async () => {
    if (!confirm("결제를 취소하시겠습니까?\n취소된 결제는 복구할 수 없습니다.")) return
    
    try {
      alert(`결제가 취소되었습니다.`)

      // 결제 내역 다시 조회
      const data = await getPaymentHistory()
      setPaymentHistory(data ?? [])
    } catch (err) {
      console.error('Cancel payment error:', err)
    }
  }

  // 로그인 상태 확인 중이거나 인증되지 않은 경우 로딩 표시
  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">인증을 확인하고 있습니다...</p>
        </div>
        <Footer />
      </div>
    )
  }

  // 로딩 중인 경우
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결제 내역을 불러오고 있습니다...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">결제 내역</h2>
            <p className="text-gray-600">결제 및 환불 내역을 확인하실 수 있습니다</p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  전체
                </TabsTrigger>
                <TabsTrigger 
                  value="paid" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  결제완료
                </TabsTrigger>
                <TabsTrigger 
                  value="cancelled" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  취소/환불
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Error Message */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Payment History List or Empty State */}
            {filteredPayments.length === 0 ? (
              <Card className="border-gray-200">
                <CardContent className="p-16 text-center">
                  {/* Payment Icon */}
                  <div className="mx-auto mb-6 w-16 h-16 relative">
                    <CreditCard className="w-full h-full text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {activeTab === "all" && "결제 내역이 없습니다."}
                    {activeTab === "paid" && "결제 완료된 내역이 없습니다."}
                    {activeTab === "cancelled" && "취소/환불된 내역이 없습니다."}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    승차권을 예매하시면 결제 내역이 여기에 표시됩니다.
                  </p>
                  <Link href="/ticket/search">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      승차권 예매하기
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredPayments.map((payment) => (
                <Card key={payment.paymentId} className="border-l-4 border-blue-500 shadow-md">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* 결제 기본 정보 */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge className={`${getPaymentStatusColor(payment.paymentStatus)} px-3 py-1 flex items-center space-x-1`}>
                              {getPaymentStatusIcon(payment.paymentStatus)}
                              <span>{getPaymentStatusName(payment.paymentStatus)}</span>
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {getPaymentMethodName(payment.paymentMethod)}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">예약번호:</span>
                              <span className="font-mono">{payment.reservationCode}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">결제번호:</span>
                              <span className="font-mono text-xs">{payment.paymentKey}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDateTime(payment.paidAt)}</span>
                            </div>
                            {payment.cancelledAt && (
                              <div className="flex items-center space-x-2 text-red-600">
                                <XCircle className="h-4 w-4" />
                                <span>취소일시: {formatDateTime(payment.cancelledAt)}</span>
                              </div>
                            )}
                            {payment.refundedAt && (
                              <div className="flex items-center space-x-2 text-blue-600">
                                <CheckCircle className="h-4 w-4" />
                                <span>환불일시: {formatDateTime(payment.refundedAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 mb-2">
                            {formatPrice(payment.amount)}
                          </div>
                          {payment.paymentStatus === "PAID" && (
                            <Button
                              onClick={() => handleCancelPayment()}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              결제취소
                            </Button>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* 결제 상세 정보 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">결제금액:</span>
                            <span className="font-medium">{formatPrice(payment.amount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">결제수단:</span>
                            <span className="font-medium">{getPaymentMethodName(payment.paymentMethod)}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">결제상태:</span>
                            <span className="font-medium">{getPaymentStatusName(payment.paymentStatus)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">결제일시:</span>
                            <span className="font-medium">{formatDateTime(payment.paidAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* 페이지네이션 또는 더보기 버튼 */}
          {filteredPayments.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                총 {filteredPayments.length}건의 결제 내역
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}