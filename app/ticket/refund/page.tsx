"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Train, 
  ChevronLeft, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Calculator,
  CheckCircle,
  XCircle,
  RefreshCw,
  Info
} from "lucide-react"
import { refundApi, paymentHistoryApi } from "@/lib/api/client"
import { useAuth } from "@/hooks/use-auth"

interface RefundCalculationResult {
  refundCalculationId: number;
  paymentId: number;
  reservationId: number;
  originalAmount: number;
  refundFeeRate: number;
  refundFee: number;
  refundAmount: number;
  mileageRefundAmount: number;
  trainDepartureTime: string;
  refundRequestTime: string;
  refundType: string;
  status: string;
  isRefundableByTime: boolean;
  refundPolicy: {
    timeUntilDeparture: number;
    feePercentage: number;
    description: string;
  };
}

interface PaymentDetail {
  paymentId: number;
  reservationId: number;
  externalOrderId: string;
  amountPaid: number;
  mileagePointsUsed: number;
  mileageAmountDeducted: number;
  paymentStatus: string;
  paymentMethod: string;
  paidAt: string;
  trainInfo?: {
    trainType: string;
    trainNumber: string;
    departureStation: string;
    arrivalStation: string;
    departureTime: string;
    arrivalTime: string;
  };
}

export default function RefundPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('paymentId')
  const { isAuthenticated, isChecking } = useAuth({ redirectPath: '/ticket/refund' })

  // 상태 관리
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(null)
  const [refundCalculation, setRefundCalculation] = useState<RefundCalculationResult | null>(null)
  // 부분환불 제거 - 전체 환불만 가능
  const refundType: 'CANCEL' = 'CANCEL'
  const [refundReason, setRefundReason] = useState('사용자 요청')
  const [isCalculating, setIsCalculating] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'form' | 'calculation' | 'processing' | 'complete'>('form')
  const [alert, setAlert] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null)
  const [showRefundConfirmDialog, setShowRefundConfirmDialog] = useState(false)

  // 페이지 로드 시 인증 확인 및 결제 정보 조회
  useEffect(() => {
    if (isChecking || !isAuthenticated) {
      return
    }

    if (!paymentId) {
      setAlert({ type: 'error', message: '결제 ID가 필요합니다.' })
      return
    }

    fetchPaymentDetail()
  }, [paymentId])

  // 결제 상세 정보 조회
  const fetchPaymentDetail = async () => {
    try {
      if (!paymentId) return

      const response = await paymentHistoryApi.getPaymentDetail(parseInt(paymentId))
      setPaymentDetail(response)
    } catch (error) {
      console.error('결제 정보 조회 에러:', error)
      setAlert({ type: 'error', message: '결제 정보를 조회할 수 없습니다.' })
    }
  }

  // 환불 계산 요청
  const handleCalculateRefund = async () => {
    if (!paymentId || !refundType) return

    setIsCalculating(true)
    setAlert(null)

    try {
      const request = {
        paymentId: parseInt(paymentId),
        refundType,
        refundReason: refundReason,
        // 열차 시간 정보 추가 (기존 결제에 시간 정보가 없을 경우를 위해)
        trainDepartureTime: paymentDetail?.trainInfo?.departureTime ? 
          paymentDetail.trainInfo.departureTime.replace(' ', 'T') : undefined, // ISO 8601 형식으로 변환
        trainArrivalTime: paymentDetail?.trainInfo?.arrivalTime ? 
          paymentDetail.trainInfo.arrivalTime.replace(' ', 'T') : undefined // ISO 8601 형식으로 변환
      }

      const response = await refundApi.calculateRefund(request)
      console.log('환불 계산 응답 전체:', JSON.stringify(response, null, 2))
      console.log('응답 객체 키들:', Object.keys(response))
      console.log('isRefundableByTime 타입:', typeof response.isRefundableByTime)
      setRefundCalculation(response)
      setStep('calculation')
      
      setAlert({ 
        type: 'info', 
        message: '환불 계산이 완료되었습니다. 내용을 확인하고 환불을 진행해주세요.' 
      })
    } catch (error: any) {
      console.error('환불 계산 에러:', error)
      const errorMessage = error.response?.data?.errorMessage || '환불 계산 중 오류가 발생했습니다.'
      setAlert({ type: 'error', message: errorMessage })
    } finally {
      setIsCalculating(false)
    }
  }

  // 환불 처리 실행
  const handleProcessRefund = async () => {
    if (!refundCalculation) return
    
    // 확인 대화상자 닫기
    setShowRefundConfirmDialog(false)

    setIsProcessing(true)
    setAlert(null)

    try {
      await refundApi.processRefund(refundCalculation.refundCalculationId)
      setStep('complete')
      
      setAlert({ 
        type: 'success', 
        message: '환불 처리가 완료되었습니다. 영업일 기준 3-5일 내에 환불됩니다.' 
      })
    } catch (error: any) {
      console.error('환불 처리 에러:', error)
      const errorMessage = error.response?.data?.errorMessage || '환불 처리 중 오류가 발생했습니다.'
      setAlert({ type: 'error', message: errorMessage })
    } finally {
      setIsProcessing(false)
    }
  }
  
  // 환불 버튼 클릭 시 확인 대화상자 표시
  const handleRefundButtonClick = () => {
    setShowRefundConfirmDialog(true)
  }

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount)
  }

  // 환불 수수료율 설명
  const getRefundPolicyDescription = (feeRate: number) => {
    if (feeRate === 0) return "열차 출발 3시간 전까지 - 위약금 없음"
    if (feeRate === 0.3) return "열차 출발 후 20분까지 - 위약금 30%"
    if (feeRate === 0.4) return "열차 출발 후 60분까지 - 위약금 40%"
    if (feeRate === 0.7) return "열차 도착 시간까지 - 위약금 70%"
    return "기타 환불 정책"
  }

  // 로그인 상태 확인 중이거나 인증되지 않은 경우 로딩 표시
  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">인증을 확인하고 있습니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">환불 신청</h1>
              <p className="text-sm text-gray-600">KTX 예약 환불 처리</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 알림 메시지 */}
        {alert && (
          <Alert className={`mb-6 ${
            alert.type === 'error' ? 'border-red-200 bg-red-50' :
            alert.type === 'success' ? 'border-green-200 bg-green-50' :
            'border-blue-200 bg-blue-50'
          }`}>
            <AlertTriangle className={`h-4 w-4 ${
              alert.type === 'error' ? 'text-red-600' :
              alert.type === 'success' ? 'text-green-600' :
              'text-blue-600'
            }`} />
            <AlertDescription className={
              alert.type === 'error' ? 'text-red-800' :
              alert.type === 'success' ? 'text-green-800' :
              'text-blue-800'
            }>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Step 1: 환불 신청 폼 */}
        {step === 'form' && (
          <div className="space-y-6">
            {/* 결제 정보 */}
            {paymentDetail && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Train className="h-5 w-5" />
                    결제 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">예약번호</Label>
                      <p className="font-medium">{paymentDetail.externalOrderId}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">결제 금액</Label>
                      <p className="font-medium">{formatAmount(paymentDetail.amountPaid)}원</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">결제 방법</Label>
                      <p className="font-medium">{paymentDetail.paymentMethod}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">결제 일시</Label>
                      <p className="font-medium">
                        {new Date(paymentDetail.paidAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {paymentDetail.mileagePointsUsed > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>사용된 마일리지:</strong> {formatAmount(paymentDetail.mileagePointsUsed)}P 
                        ({formatAmount(paymentDetail.mileageAmountDeducted)}원 상당)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 환불 신청 폼 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  환불 신청 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 환불 안내 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    환불 안내
                  </h4>
                  <p className="text-sm text-blue-700">
                    예약된 열차 티켓 전체가 환불됩니다. 환불 수수료는 열차 출발 시간을 기준으로 자동 계산됩니다.
                  </p>
                </div>

                {/* 환불 사유 - 일반 사용자에게는 숨김 */}
                {/* TODO: 관리자 권한 체크 후 표시
                {isAdmin && (
                  <div>
                    <Label htmlFor="reason" className="text-base font-medium">환불 사유</Label>
                    <Textarea
                      id="reason"
                      placeholder="환불 사유를 입력해주세요..."
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                )}
                */}

                {/* 환불 정책 안내 */}
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    환불 수수료 정책
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• 열차 출발 3시간 전까지: 위약금 없음 (무료)</li>
                    <li>• 열차 출발 후 20분까지: 위약금 30%</li>
                    <li>• 열차 출발 후 60분까지: 위약금 40%</li>
                    <li>• 열차 도착 시간까지: 위약금 70%</li>
                    <li>• 열차 도착 시간 이후: 환불 불가</li>
                  </ul>
                </div>

                {/* 환불 계산 버튼 */}
                <Button 
                  onClick={handleCalculateRefund}
                  disabled={isCalculating}
                  className="w-full"
                  size="lg"
                >
                  {isCalculating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      환불 금액 계산 중...
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4 mr-2" />
                      환불 금액 계산하기
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: 환불 계산 결과 */}
        {step === 'calculation' && refundCalculation && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  환불 계산 결과
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 환불 가능 여부 */}
                <div className={`p-4 rounded-lg ${
                  refundCalculation.isRefundableByTime 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {refundCalculation.isRefundableByTime ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${
                      refundCalculation.isRefundableByTime ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {refundCalculation.isRefundableByTime ? '환불 가능' : '환불 불가'}
                    </span>
                  </div>
                </div>

                {refundCalculation.isRefundableByTime && (
                  <>
                    {/* 환불 정책 정보 */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>적용 정책:</strong> {getRefundPolicyDescription(refundCalculation.refundFeeRate)}
                      </p>
                    </div>

                    {/* 환불 금액 상세 */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <Label className="text-sm text-gray-600">원본 결제 금액</Label>
                          <p className="text-lg font-bold">{formatAmount(refundCalculation.originalAmount)}원</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <Label className="text-sm text-gray-600">환불 수수료 ({(refundCalculation.refundFeeRate * 100).toFixed(1)}%)</Label>
                          <p className="text-lg font-bold text-red-600">-{formatAmount(refundCalculation.refundFee)}원</p>
                        </div>
                      </div>

                      {refundCalculation.mileageRefundAmount > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <Label className="text-sm text-blue-800">마일리지 환불 금액</Label>
                          <p className="text-lg font-bold text-blue-600">{formatAmount(refundCalculation.mileageRefundAmount)}원</p>
                        </div>
                      )}

                      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                        <Label className="text-sm text-green-800">최종 환불 금액</Label>
                        <p className="text-2xl font-bold text-green-600">{formatAmount(refundCalculation.refundAmount)}원</p>
                      </div>
                    </div>

                    {/* 환불 처리 버튼 */}
                    <div className="flex gap-4">
                      <Button 
                        variant="outline"
                        onClick={() => setStep('form')}
                        className="flex-1"
                      >
                        다시 계산하기
                      </Button>
                      <Button 
                        onClick={handleRefundButtonClick}
                        disabled={isProcessing}
                        className="flex-1"
                        size="lg"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            환불 처리 중...
                          </>
                        ) : (
                          '환불 처리하기'
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: 환불 완료 */}
        {step === 'complete' && (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">환불 처리 완료</h2>
              <p className="text-gray-600 mb-8">
                환불 처리가 완료되었습니다.<br />
                영업일 기준 3-5일 내에 환불금이 입금됩니다.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => router.push('/mypage/payment-history')}>
                  결제 내역 보기
                </Button>
                <Button onClick={() => router.push('/')}>
                  홈으로 이동
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* 환불 확인 대화상자 */}
        <Dialog open={showRefundConfirmDialog} onOpenChange={setShowRefundConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                환불 확인
              </DialogTitle>
            </DialogHeader>
            {refundCalculation && (
              <div className="space-y-4 pt-4">
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-amber-800">
                    <strong>위약금 {(refundCalculation.refundFeeRate * 100).toFixed(0)}%</strong>가 차감된 
                    <strong className="text-lg mx-1">{formatAmount(refundCalculation.refundAmount)}원</strong>이 환불됩니다.
                  </p>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• 원본 결제 금액: {formatAmount(refundCalculation.originalAmount)}원</p>
                  <p>• 환불 수수료: {formatAmount(refundCalculation.refundFee)}원</p>
                  {refundCalculation.mileageRefundAmount > 0 && (
                    <p>• 마일리지 환불: {formatAmount(refundCalculation.mileageRefundAmount)}P</p>
                  )}
                </div>
                
                <p className="text-sm text-gray-500">
                  환불 완료까지 영업일 기준 3-5일이 소요됩니다.
                </p>
                
                <div className="flex gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowRefundConfirmDialog(false)}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button 
                    onClick={handleProcessRefund}
                    className="flex-1"
                  >
                    확인
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 