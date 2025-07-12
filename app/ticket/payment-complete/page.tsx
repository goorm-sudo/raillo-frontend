"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, Train, Calendar, Clock, User, CreditCard, Download, Home, List, AlertCircle } from "lucide-react"
import { paymentHistoryApi } from "@/lib/api/client"
import { getLoginInfo } from "@/lib/utils"

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

export default function PaymentCompletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reservationId = searchParams.get("reservationId")
  const isGuestParam = searchParams.get("isGuest") === "true"
  
  const [isLoading, setIsLoading] = useState(true)
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null)
  const [error, setError] = useState<React.ReactNode | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 결제 정보 (실제로는 이전 페이지나 서버에서 받아올 데이터)
  const [paymentData] = useState({
    departure: searchParams.get("departure") || "서울",
    arrival: searchParams.get("arrival") || "부산",
    date: searchParams.get("date") || "2024-01-15",
    time: searchParams.get("time") || "06:00",
    trainType: "KTX",
    trainNumber: "KTX-101",
    passengers: [
      { name: "홍길동", type: "어른", seat: "1호차 3A" },
    ],
    totalAmount: 118600,
    paymentMethod: "신용카드",
    cardNumber: "**** **** **** 1234",
    paymentStatus: "SUCCESS",
    paymentId: "sample-payment-id",
  })

  const formatPrice = (price: number) => {
    return price.toLocaleString("ko-KR")
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const days = ["일", "월", "화", "수", "목", "금", "토"]
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${days[date.getDay()]})`
  }

  useEffect(() => {
    const loginInfo = getLoginInfo()
    setIsLoggedIn(!!loginInfo)
    
    if (reservationId) {
      // 결제 완료 직후이므로 충분한 지연 후 조회 시작 (비동기 처리 고려)
      // 결제 정보 조회를 위해 2초 대기 중
      setTimeout(() => {
        fetchPaymentInfo()
      }, 2000) // 500ms -> 2000ms로 증가
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
      // 결제 시점의 회원/비회원 상태를 정확히 반영
      const isGuestPayment = isGuestParam
      
      // 결제 정보 조회 시작
      
      if (isGuestPayment) {
        // 비회원 결제인 경우 - sessionStorage에서 비회원 정보 가져오기
        const nonMemberInfo = sessionStorage.getItem('nonMemberInfo')
        
        if (nonMemberInfo) {
          const info = JSON.parse(nonMemberInfo)
          const numericId = reservationId.startsWith('R') 
            ? parseInt(reservationId.replace('R', ''))
            : parseInt(reservationId);
          
          // 비회원 결제 정보 조회
          
          const response = await paymentHistoryApi.getGuestPaymentHistory(
            numericId,
            info.name,
            info.phone.replace(/-/g, ''),
            info.password
          )
          
          // 비회원 결제 조회 응답
          setPaymentInfo(response.result || response)
        } else {
          setError("비회원 정보를 찾을 수 없습니다. 다시 로그인해주세요.")
        }
      } else if (loginInfo) {
        // 회원 결제인 경우
        // reservationId 처리 - 이미 숫자일 수도 있고 R로 시작할 수도 있음
        const numericReservationId = reservationId.startsWith('R') 
          ? parseInt(reservationId.replace('R', ''))
          : parseInt(reservationId)
        
        // 찾는 reservationId
        
        try {
          // 공용 API를 사용하여 예약번호로 결제 정보 조회
          const response = await paymentHistoryApi.getPaymentByReservationIdPublic(numericReservationId)
          // 예약번호로 결제 정보 조회 응답 (공용 API)
          
          // API가 PaymentInfoResponse를 직접 반환하므로 response가 이미 payment 객체임
          if (response) {
            // 찾은 결제 정보
            setPaymentInfo(response)
          } else {
            throw new Error('결제 정보가 없습니다')
          }
        } catch (apiError: any) {
          // 예약번호로 결제 조회 실패
          
          // 404 에러이거나 찾을 수 없는 경우에만 재시도
          if (apiError.response?.status === 404 || apiError.response?.data?.errorMessage?.includes('찾을 수 없습니다')) {
            // 결제 정보를 찾을 수 없음
            
            // 재시도 로직: 비동기 처리로 인한 지연을 고려
            if (retryCount < 3) {
              // 재시도 중
              setError(
                <div className="text-center">
                  <p className="mb-2">결제 정보를 확인하는 중입니다...</p>
                  <p className="text-sm text-gray-600">잠시만 기다려주세요 ({retryCount + 1}/3)</p>
                </div>
              )
              
              // 3초 후 재시도 (비동기 처리 완료 대기)
              setTimeout(() => {
                fetchPaymentInfo(retryCount + 1)
              }, 3000) // 1500ms -> 3000ms로 증가
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
                    onClick={() => router.push('/guest-ticket/search')}
                  >
                    비회원 조회
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => router.push('/ticket/my-tickets')}
                  >
                    내 예매 내역
                  </Button>
                </div>
              </div>
            )
          } else if (apiError.response?.status === 403) {
            // 권한 오류
            setError(
              <div>
                <p className="font-semibold mb-2">이 결제 정보에 접근할 권한이 없습니다.</p>
                <p className="text-sm mt-2">본인의 결제 내역만 조회할 수 있습니다.</p>
              </div>
            )
          } else {
            // 기타 API 오류
            throw apiError
          }
        }
      } else {
        // 로그인하지 않은 상태
        setError("결제 정보를 조회하려면 로그인이 필요합니다.")
      }
    } catch (error) {
      // 결제 정보 조회 실패
      
      // API 오류 시에도 재시도
      if (retryCount < 3) {
        // API 오류로 재시도 중
        setError(
          <div className="text-center">
            <p className="mb-2">결제 정보를 확인하는 중입니다...</p>
            <p className="text-sm text-gray-600">잠시만 기다려주세요 ({retryCount + 1}/3)</p>
          </div>
        )
        setTimeout(() => {
          fetchPaymentInfo(retryCount + 1)
        }, 3000) // 1500ms -> 3000ms로 증가
        return
      }
      
      setError(
        <div>
          <p className="font-semibold mb-2">결제 정보를 불러올 수 없습니다.</p>
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
              variant="secondary"
              onClick={() => router.push('/')}
            >
              홈으로
            </Button>
          </div>
        </div>
      )
    } finally {
      setIsLoading(false)
    }
  }

  const getPaymentMethodDisplay = (method: string) => {
    // 백엔드에서 이미 한글로 변환된 값이 오는 경우 그대로 반환
    const methodMap: {[key: string]: string} = {
      'KAKAO_PAY': '카카오페이',
      'NAVER_PAY': '네이버페이', 
      'PAYCO': 'PAYCO',
      'CREDIT_CARD': '신용카드',
      'BANK_ACCOUNT': '내 통장 결제',
      'BANK_TRANSFER': '계좌이체',
      'MILEAGE': '마일리지',
      // 백엔드에서 이미 변환된 값들
      '카카오페이': '카카오페이',
      '네이버페이': '네이버페이',
      '신용카드': '신용카드',
      '내 통장 결제': '내 통장 결제',
      '계좌이체': '계좌이체',
      '마일리지': '마일리지'
    }
    return methodMap[method] || method
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">조회 실패</h1>
            <div className="text-gray-600 mb-4">{error}</div>
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
              <p className="text-2xl font-bold text-blue-600">{paymentInfo?.externalOrderId || reservationId}</p>
              <p className="text-xs text-gray-500 mt-2">※ 예약번호는 승차권 발권 및 변경/취소 시 필요합니다.</p>
            </div>
          </CardContent>
        </Card>

        {/* 승차권 정보 */}
        {paymentInfo && (
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
                    <p className="text-lg font-semibold">{paymentInfo.departureStation || paymentData.departure}</p>
                    <p className="text-sm text-gray-600">출발</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                    <Train className="w-6 h-6 text-blue-600 mx-2" />
                    <div className="w-8 h-0.5 bg-gray-300"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold">{paymentInfo.arrivalStation || paymentData.arrival}</p>
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
                    <p className="font-medium">{formatDate(paymentInfo.date || paymentData.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">출발시간</p>
                    <p className="font-medium">{paymentInfo.departureTime || paymentData.time}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">열차정보</p>
                  <p className="font-medium">
                    {paymentInfo.trainType || paymentData.trainType} {paymentInfo.trainNumber || paymentData.trainNumber}
                  </p>
                </div>
                <Badge variant="secondary">{paymentInfo.trainType || paymentData.trainType}</Badge>
              </div>

              {paymentInfo.seatClass && paymentInfo.carNumber && paymentInfo.seatNumber && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">좌석정보</span>
                    <span className="font-medium">
                      {paymentInfo.seatClass} {paymentInfo.carNumber}호차 {paymentInfo.seatNumber}번
                    </span>
                  </div>
                </div>
              )}
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
                  <p className="font-medium">
                    {paymentInfo?.seatClass && paymentInfo?.carNumber && paymentInfo?.seatNumber
                      ? `${paymentInfo.seatClass} ${paymentInfo.carNumber}호차 ${paymentInfo.seatNumber}번`
                      : '좌석 정보 확인 중'}
                  </p>
                  <p className="text-sm text-gray-600">좌석</p>
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
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">총 결제금액</span>
                <span className="text-xl font-bold">{formatPrice(Math.round(paymentInfo.amountPaid))}원</span>
              </div>
              
              {/* 마일리지 사용 정보 */}
              {paymentInfo.mileagePointsUsed > 0 && (
                <>
                  <div className="bg-blue-50 p-3 rounded-lg mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">사용 마일리지</span>
                        <span className="text-sm text-blue-600 font-medium">-{Math.round(paymentInfo.mileagePointsUsed).toLocaleString()}P</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">마일리지 할인</span>
                        <span className="text-sm text-blue-600 font-medium">-{formatPrice(Math.round(paymentInfo.mileageAmountDeducted))}원</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">결제수단</span>
                  <span className="text-sm">{getPaymentMethodDisplay(paymentInfo.paymentMethod)}</span>
                </div>
                {paymentInfo.pgApprovalNo && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">승인번호</span>
                    <span className="text-sm">{paymentInfo.pgApprovalNo}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">결제일시</span>
                  <span className="text-sm">
                    {new Date(paymentInfo.paidAt).toLocaleString('ko-KR')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">결제상태</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    결제완료
                  </Badge>
                </div>
              </div>
              
              {/* 마일리지 적립 예정 */}
              {paymentInfo.mileageToEarn > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700 font-medium">마일리지 적립 예정</span>
                      <span className="text-sm text-green-700 font-bold">+{Math.round(paymentInfo.mileageToEarn).toLocaleString()}P</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">※ 열차 도착 후 자동 적립됩니다</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* 안내사항 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>안내사항</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 탑승일 출발 20분 전까지 모바일 티켓을 발권받으시기 바랍니다.</li>
              <li>• 예약변경 및 취소는 열차 출발 전까지 가능합니다.</li>
              <li>• 취소 시 수수료가 발생할 수 있습니다.</li>
              <li>• 비회원 예약 조회는 예약번호와 휴대폰 번호로 가능합니다.</li>
            </ul>
          </CardContent>
        </Card>

        {/* 버튼 그룹 */}
        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" className="w-full" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            영수증 출력
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push('/ticket/reservations')}>
            <List className="w-4 h-4 mr-2" />
            예약 내역
          </Button>
          <Button className="w-full" onClick={() => router.push('/')}>
            <Home className="w-4 h-4 mr-2" />
            홈으로
          </Button>
        </div>
      </div>
    </div>
  )
}