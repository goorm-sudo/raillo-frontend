"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, Train, Calendar, Clock, User, CreditCard, Download, Home, List, AlertCircle } from "lucide-react"
import { getLoginInfo } from "@/lib/utils"
import { paymentHistoryApi } from "@/lib/api/client"

interface PaymentInfo {
  paymentId: number;
  reservationId: number;
  externalOrderId: string;
  paymentStatus: string;
  amountPaid: number;
  amountOriginalTotal: number;
  totalDiscountAmountApplied: number;
  mileagePointsUsed: number;
  mileageAmountDeducted: number;
  mileageToEarn: number;
  paymentMethod: string;
  pgProvider?: string;
  pgApprovalNo?: string;
  paidAt: string;
  createdAt: string;
  receiptUrl?: string;
  // 예약 정보 (별도 API에서 가져와야 함)
  trainType?: string;
  trainNumber?: string;
  departureStation?: string;
  arrivalStation?: string;
  departureTime?: string;
  arrivalTime?: string;
  seatClass?: string;
  carNumber?: number;
  seatNumber?: string;
  date?: string;
}

interface ReservationDetail {
  reservationId: number;
  reservationCode: string;
  trainNumber: string;
  trainName: string;
  departureStationName: string;
  arrivalStationName: string;
  departureTime: string;
  arrivalTime: string;
  operationDate: string;
  expiresAt: string;
  seats: {
    seatReservationId: number;
    passengerType: string;
    carNumber: number;
    carType: string;
    seatNumber: string;
    baseFare: number;
    fare: number;
  }[];
}

export default function PaymentCompletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reservationId = searchParams.get("reservationId")
  const isGuestParam = searchParams.get("isGuest") === "true"
  
  const [isLoading, setIsLoading] = useState(true)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [reservationDetail, setReservationDetail] = useState<ReservationDetail | null>(null)
  const [error, setError] = useState<React.ReactNode | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR")
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const days = ["일", "월", "화", "수", "목", "금", "토"]
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`
  }

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5)
  }

  const getPaymentMethodDisplay = (method: string) => {
    const methodMap: {[key: string]: string} = {
      'KAKAO_PAY': '카카오페이',
      'NAVER_PAY': '네이버페이', 
      'PAYCO': 'PAYCO',
      'CREDIT_CARD': '신용카드',
      'BANK_ACCOUNT': '내 통장 결제',
      'BANK_TRANSFER': '계좌이체',
      'MILEAGE': '마일리지',
      '카카오페이': '카카오페이',
      '네이버페이': '네이버페이',
      '신용카드': '신용카드',
      '내 통장 결제': '내 통장 결제',
      '계좌이체': '계좌이체',
      '마일리지': '마일리지'
    }
    return methodMap[method] || method
  }

  const getPassengerTypeDisplay = (type: string) => {
    const typeMap: {[key: string]: string} = {
      'ADULT': '어른',
      'CHILD': '어린이',
      'SENIOR': '경로',
      'DISABLED_HEAVY': '중증장애인',
      'DISABLED_LIGHT': '경증장애인',
      'VETERAN': '국가유공자',
      'INFANT': '유아'
    }
    return typeMap[type] || type
  }

  useEffect(() => {
    const loginInfo = getLoginInfo()
    setIsLoggedIn(!!loginInfo)
    
    if (reservationId) {
      // 결제 완료 직후이므로 충분한 지연 후 조회 시작 (비동기 처리 고려)
      console.log('결제 정보 조회를 위해 2초 대기 중');
      setTimeout(() => {
        fetchPaymentInfo()
      }, 2000) // 2초 대기
    } else {
      setError("예약번호가 없습니다.")
      setIsLoading(false)
    }
  }, [reservationId])
  
  const fetchPaymentInfo = async (retryCount = 0) => {
    try {
      setIsLoading(true)
      const loginInfo = getLoginInfo()
      
      // URL 파라미터의 isGuest 값을 우선적으로 확인
      const isGuestPayment = isGuestParam
      
      console.log('결제 정보 조회 시작', { reservationId, isGuestPayment });
      
      if (isGuestPayment) {
        // 비회원 결제인 경우 - sessionStorage에서 비회원 정보 가져오기
        const nonMemberInfo = sessionStorage.getItem('nonMemberInfo')
        
        if (nonMemberInfo) {
          const info = JSON.parse(nonMemberInfo)
          const numericId = reservationId!.startsWith('R') 
            ? parseInt(reservationId!.replace('R', ''))
            : parseInt(reservationId!);
          
          console.log('비회원 결제 정보 조회', { numericId, name: info.name });
          
          const response = await paymentHistoryApi.getGuestPaymentHistory(
            numericId,
            info.name,
            info.phone.replace(/-/g, ''),
            info.password
          )
          
          console.log('비회원 결제 조회 응답:', response);
          setPaymentInfo(response.result || response as any)
          
          // sessionStorage에서 예약 정보 가져와서 표시
          const paymentReservations = sessionStorage.getItem('paymentReservations')
          if (paymentReservations) {
            const reservations = JSON.parse(paymentReservations)
            if (reservations && reservations.length > 0) {
              setReservationDetail(reservations[0])
            }
          }
        } else {
          setError("비회원 정보를 찾을 수 없습니다. 다시 로그인해주세요.")
        }
      } else if (loginInfo) {
        // 회원 결제인 경우
        const numericReservationId = reservationId!.startsWith('R') 
          ? parseInt(reservationId!.replace('R', ''))
          : parseInt(reservationId!)
        
        console.log('예약 ID로 결제 정보 조회:', numericReservationId);
        console.log('API 호출 정보:', {
          endpoint: `/payment-history/reservation/${numericReservationId}`,
          method: 'GET',
          headers: {
            'Authorization': localStorage.getItem('accessToken') ? `Bearer ${localStorage.getItem('accessToken')}` : 'No token'
          }
        });
        
        try {
          // 공용 API를 사용하여 예약번호로 결제 정보 조회
          const response = await paymentHistoryApi.getPaymentByReservationIdPublic(numericReservationId)
          console.log('예약번호로 결제 정보 조회 응답:', response);
          
          // API 응답이 result로 감싸져 있는 경우와 직접 반환하는 경우 모두 처리
          const paymentData = response.result || response;
          
          if (paymentData && paymentData.paymentId) {
            console.log('찾은 결제 정보:', paymentData);
            setPaymentInfo(paymentData)
            
            // sessionStorage에서 예약 정보 가져와서 표시
            const paymentReservations = sessionStorage.getItem('paymentReservations')
            if (paymentReservations) {
              const reservations = JSON.parse(paymentReservations)
              if (reservations && reservations.length > 0) {
                setReservationDetail(reservations[0])
              }
            }
          } else {
            throw new Error('결제 정보가 없습니다')
          }
        } catch (apiError: any) {
          console.error('예약번호로 결제 조회 실패:', apiError);
          
          // 404 에러, 500 에러, 또는 찾을 수 없는 경우에만 재시도
          if (apiError.response?.status === 404 || 
              apiError.response?.status === 500 ||
              apiError.response?.data?.errorMessage?.includes('찾을 수 없습니다')) {
            console.log('결제 정보 조회 실패, 상태:', apiError.response?.status, ', 재시도 카운트:', retryCount);
            
            // 재시도 로직: 비동기 처리로 인한 지연을 고려
            if (retryCount < 3) {
              console.log('재시도 중...');
              setError(
                <div className="text-center">
                  <p className="mb-2">결제 정보를 확인하는 중입니다...</p>
                  <p className="text-sm text-gray-600">잠시만 기다려주세요 ({retryCount + 1}/3)</p>
                </div>
              )
              
              // 3초 후 재시도
              setTimeout(() => {
                fetchPaymentInfo(retryCount + 1)
              }, 3000)
              return
            }
            
            // 재시도 후에도 찾지 못한 경우
            setError(
              <div>
                <p className="font-semibold mb-2">예약번호 {numericReservationId}에 해당하는 결제 정보를 찾을 수 없습니다.</p>
                <p className="text-sm mt-2">가능한 원인:</p>
                <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                  <li>결제가 아직 처리 중입니다</li>
                  <li>비회원으로 결제하신 경우 비회원 조회를 이용해주세요</li>
                  <li>다른 계정으로 결제하신 경우 해당 계정으로 로그인해주세요</li>
                  <li>시스템 오류가 발생했을 수 있습니다</li>
                </ul>
                <div className="mt-4 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => fetchPaymentInfo(0)}
                  >
                    다시 시도
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push("/ticket/purchased")}
                  >
                    예약 내역으로 이동
                  </Button>
                </div>
              </div>
            )
          } else {
            // 다른 종류의 에러
            setError(`결제 정보 조회 중 오류가 발생했습니다: ${apiError.message || '알 수 없는 오류'}`)
          }
        }
      } else {
        setError("로그인 정보를 확인할 수 없습니다.")
      }
      
      // 결제 완료 후 sessionStorage 정리
      sessionStorage.removeItem('currentReservationId')
      sessionStorage.removeItem('currentReservationNumber')
      sessionStorage.removeItem('paymentInfo')
      
      setIsLoading(false)
    } catch (error) {
      console.error('결제 정보 로드 실패:', error)
      setError("결제 정보를 불러올 수 없습니다.")
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <Card className="mb-6">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">오류 발생</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')}>홈으로 가기</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 결제 완료 헤더 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">결제가 완료되었습니다</h1>
          <p className="text-gray-600">승차권 예약이 성공적으로 완료되었습니다.</p>
        </div>

        {/* 예약 번호 */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">예약번호</p>
              <p className="text-2xl font-bold text-blue-600">
                {reservationDetail?.reservationCode || reservationId}
              </p>
              <p className="text-xs text-gray-500 mt-2">※ 예약번호는 승차권 발권 및 변경/취소 시 필요합니다.</p>
            </div>
          </CardContent>
        </Card>

        {/* 승차권 정보 */}
        {reservationDetail && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Train className="w-5 h-5" />
                승차권 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold">{reservationDetail.departureStationName}</p>
                    <p className="text-sm text-gray-600">출발</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <Train className="w-6 h-6 text-blue-600 mx-2" />
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{reservationDetail.arrivalStationName}</p>
                    <p className="text-sm text-gray-600">도착</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">출발일</p>
                    <p className="font-medium">{formatDate(reservationDetail.operationDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">출발시간</p>
                    <p className="font-medium">{formatTime(reservationDetail.departureTime)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">열차정보</p>
                  <p className="font-medium">
                    {reservationDetail.trainName} {reservationDetail.trainNumber}
                  </p>
                </div>
                <Badge variant="secondary">{reservationDetail.trainName}</Badge>
              </div>

              {/* 좌석 정보 */}
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                {reservationDetail.seats.map((seat, index) => (
                  <div key={seat.seatReservationId} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {getPassengerTypeDisplay(seat.passengerType)}
                    </span>
                    <span className="font-medium">
                      {seat.carType === "FIRST_CLASS" ? "특실" : "일반실"} {seat.carNumber}호차 {seat.seatNumber}번
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 예약자 정보 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              예약자 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">
                    {isLoggedIn ? getLoginInfo()?.username : 
                      (typeof window !== 'undefined' && sessionStorage.getItem('nonMemberInfo') ? 
                        JSON.parse(sessionStorage.getItem('nonMemberInfo')!).name : '예약자')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isLoggedIn ? '회원' : '비회원'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">총 {reservationDetail?.seats.length || 0}매</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 결제 정보 */}
        {paymentInfo && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                결제 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">결제수단</span>
                <span className="font-medium">{getPaymentMethodDisplay(paymentInfo.paymentMethod)}</span>
              </div>
              
              {paymentInfo.mileagePointsUsed > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">사용 마일리지</span>
                    <span className="font-medium text-red-600">-{formatPrice(paymentInfo.mileagePointsUsed)}M</span>
                  </div>
                  <Separator />
                </>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">원래 금액</span>
                <span className="font-medium">{formatPrice(paymentInfo.amountOriginalTotal)}원</span>
              </div>
              
              {paymentInfo.totalDiscountAmountApplied > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">할인 금액</span>
                  <span className="font-medium text-red-600">-{formatPrice(paymentInfo.totalDiscountAmountApplied)}원</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>총 결제금액</span>
                <span className="text-blue-600">{formatPrice(paymentInfo.amountPaid)}원</span>
              </div>
              
              {paymentInfo.mileageToEarn > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">예상 적립 마일리지</span>
                  <span className="text-green-600">+{formatPrice(paymentInfo.mileageToEarn)}M</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/ticket/purchased")}>
            <List className="w-4 h-4 mr-2" />
            승차권 내역 보기
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              승차권 출력
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              <Home className="w-4 h-4 mr-2" />
              홈으로
            </Button>
          </div>
        </div>

        {/* 안내사항 */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-2">이용 안내</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 승차권은 출발시간 20분 전까지 발권하셔야 합니다.</li>
              <li>• 예매 취소는 출발시간 20분 전까지 가능합니다.</li>
              <li>• 승차권은 모바일 앱이나 홈페이지에서 확인할 수 있습니다.</li>
              <li>• 문의사항은 고객센터(1544-1234)로 연락주세요.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}