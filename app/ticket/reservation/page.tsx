"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format, addMinutes } from "date-fns"
import { ko } from "date-fns/locale"
import {
  Train,
  ChevronLeft,
  Clock,
  MapPin,
  ArrowRight,
  CreditCard,
  ShoppingCart,
  ChevronUp,
  ChevronDown,
  CheckCircle,
} from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { deleteReservation, getReservationDetail, addToCart } from '@/lib/api/booking'
import { handleError } from '@/lib/utils/errorHandler'

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

export default function ReservationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [reservation, setReservation] = useState<ReservationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState("")
  const [isNoticeOpen, setIsNoticeOpen] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showCartDialog, setShowCartDialog] = useState(false)
  const [showCartSuccessDialog, setShowCartSuccessDialog] = useState(false)

  useEffect(() => {
    const fetchReservationDetail = async () => {
      try {
        // 세션 스토리지에서 임시 예약 ID 가져오기
        const tempReservationId = sessionStorage.getItem('tempReservationId')
        
        if (!tempReservationId) {
          setError('예약 정보를 찾을 수 없습니다. 다시 예약해주세요.')
          setLoading(false)
          return
        }

        // 먼저 예약 ID로 상세 정보 조회
        const response = await getReservationDetail(Number(tempReservationId))
        if (response.result) {
          setReservation(response.result)
          // 성공적으로 로드된 후 임시 데이터 제거
          sessionStorage.removeItem('tempReservationId')
          
          // 예약 코드를 세션 스토리지에 저장 (향후 접근용)
          sessionStorage.setItem('reservationCode', response.result.reservationCode)
        } else {
          setError('예약 정보를 찾을 수 없습니다.')
        }
      } catch (err) {
        const errorMessage = handleError(err, '예약 정보 조회 중 오류가 발생했습니다.', false)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchReservationDetail()
  }, [])

  useEffect(() => {
    if (!reservation) return

    const updateTimer = () => {
      const now = new Date()
      const deadline = new Date(reservation.expiresAt)
      const diff = deadline.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining("결제 기한이 만료되었습니다")
        return
      }

      const minutes = Math.floor(diff / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeRemaining(`${minutes}분 ${seconds}초`)
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)

    return () => clearInterval(timer)
  }, [reservation])

  const handleCancelReservation = () => {
    setShowCancelDialog(true)
  }

  const confirmCancelReservation = async () => {
    setShowCancelDialog(false)
    try {
      if (reservation) {
        await deleteReservation(reservation.reservationId)
        alert('예약이 취소되었습니다.')
        router.push('/')
      } else {
        alert('예약 정보를 찾을 수 없습니다.')
      }
    } catch (e: any) {
      handleError(e, '예약 취소 중 오류가 발생했습니다.')
    }
  }

  const handleAddToCart = () => {
    setShowCartDialog(true)
  }

  const confirmAddToCart = async () => {
    setShowCartDialog(false)
    try {
      if (reservation) {
        const response = await addToCart({ reservationId: reservation.reservationId })
        if (response.message) {
          setShowCartSuccessDialog(true)
        } else {
          alert('장바구니 추가에 실패했습니다.')
        }
      } else {
        alert('예약 정보를 찾을 수 없습니다.')
      }
    } catch (e: any) {
      handleError(e, '장바구니 추가 중 오류가 발생했습니다.')
    }
  }

  const handleCartSuccessConfirm = () => {
    setShowCartSuccessDialog(false)
    // 현재 페이지에 머물기 (아무 동작 안함)
  }

  const handleGoToCart = () => {
    setShowCartSuccessDialog(false)
    router.push("/cart")
  }

  const handlePayment = () => {
    router.push("/ticket/payment")
  }

  const getTrainTypeColor = (trainName: string) => {
    switch (trainName) {
      case "KTX":
        return "bg-blue-600 text-white"
      case "ITX-새마을":
        return "bg-green-600 text-white"
      case "무궁화호":
        return "bg-orange-600 text-white"
      case "ITX-청춘":
        return "bg-purple-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString() + "원"
  }

  const getTotalPrice = () => {
    if (!reservation) return 0
    return reservation.seats.reduce((total, seat) => total + seat.fare, 0)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "yyyy년 MM월 dd일(EEEE)", { locale: ko })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5) // "HH:mm" 형식으로 변환
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">예약 정보를 불러오고 있습니다...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">예약 정보를 불러올 수 없습니다</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={() => router.push('/')} variant="outline">
            홈으로 돌아가기
          </Button>
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
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">승차권 예약 완료</h2>
            <p className="text-gray-600">예약이 완료되었습니다. 결제 기한 내에 결제를 완료해주세요.</p>
          </div>

          {/* Payment Deadline Warning */}
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-center space-x-2 text-red-700">
                <Clock className="h-5 w-5" />
                <span className="font-medium">결제기한이 지난 목록은 자동 삭제됩니다</span>
              </div>
            </CardContent>
          </Card>

          {/* Reservation Details */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="border-l-4 border-blue-500 pl-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getTrainTypeColor(reservation.trainName)} px-3 py-1`}>
                      {reservation.trainName}
                    </Badge>
                    <span className="text-xl font-bold">{reservation.trainNumber}</span>
                    <span className="text-gray-600">{formatDate(reservation.operationDate)}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCancelReservation}>
                      예약취소
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleAddToCart}>
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      장바구니
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {/* Route Information */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      운행 정보
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-semibold">{reservation.departureStationName}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="text-lg font-semibold">{reservation.arrivalStationName}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-gray-600">
                        <span>{formatTime(reservation.departureTime)}</span>
                        <span>~</span>
                        <span>{formatTime(reservation.arrivalTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seat Information */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">좌석 정보</h3>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        {reservation.seats.map((seat, index) => (
                          <div key={seat.seatReservationId} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{seat.carType === "FIRST_CLASS" ? "특실" : "일반실"}</span>
                              <span className="text-gray-600">
                                {seat.carNumber}호차 {seat.seatNumber}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {seat.passengerType === "ADULT" ? "어른" : 
                                 seat.passengerType === "CHILD" ? "어린이" :
                                 seat.passengerType === "SENIOR" ? "경로" :
                                 seat.passengerType === "DISABLED_HEAVY" ? "중증장애인" :
                                 seat.passengerType === "DISABLED_LIGHT" ? "경증장애인" :
                                 seat.passengerType === "VETERAN" ? "국가유공자" :
                                 seat.passengerType === "INFANT" ? "유아" : seat.passengerType}
                              </Badge>
                            </div>
                            <span className="font-semibold text-blue-600">{formatPrice(seat.fare)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">총 요금</span>
                          <span className="text-lg font-bold text-blue-600">{formatPrice(getTotalPrice())}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Deadline */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">결제기한:</span>
                      <span className="text-yellow-800">
                        {format(new Date(reservation.expiresAt), "yyyy년 MM월 dd일 HH:mm", { locale: ko })}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-yellow-600">남은 시간</div>
                      <div className="font-bold text-yellow-800">{timeRemaining}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Button */}
          <div className="text-center mb-8">
            <Button
              onClick={handlePayment}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-12 py-4 text-lg"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              결제하기
            </Button>
          </div>

          {/* Notice Section */}
          <Card>
            <Collapsible open={isNoticeOpen} onOpenChange={setIsNoticeOpen}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">안내</CardTitle>
                    {isNoticeOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• 10분 이내 결제하셔야 승차권 구매가 완료됩니다.</p>
                    <p>• 승차권 예약 후 10분 이내에 결제하지 않으면 예약이 자동 취소됩니다.</p>
                    <p>• 결제 완료 후에는 출발시간 20분 전까지 취소 가능합니다.</p>
                    <p>• 예약번호: {reservation.reservationCode}</p>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </main>

      {/* Cancel Reservation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약 취소</AlertDialogTitle>
            <AlertDialogDescription>
              예약을 취소하시겠습니까?
              <br />
              취소된 예약은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCancelReservation} className="bg-red-600 hover:bg-red-700">
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add to Cart Dialog */}
      <AlertDialog open={showCartDialog} onOpenChange={setShowCartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>장바구니 추가</AlertDialogTitle>
            <AlertDialogDescription>
              해당 목록을 장바구니로 이동하시겠습니까?
              <br />
              장바구니에서 여러 승차권을 함께 결제할 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAddToCart}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cart Success Dialog */}
      <AlertDialog open={showCartSuccessDialog} onOpenChange={setShowCartSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>장바구니 등록 완료</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              장바구니에 등록되었습니다.
              <br />
              장바구니에서 여러 승차권을 함께 결제하거나 현재 페이지에서 계속 이용하실 수 있습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCartSuccessConfirm}>확인</AlertDialogCancel>
            <AlertDialogAction onClick={handleGoToCart} className="bg-blue-600 hover:bg-blue-700">
              장바구니로 이동
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  )
}
