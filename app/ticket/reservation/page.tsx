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

interface ReservationInfo {
  trainType: string
  trainNumber: string
  date: string
  departureStation: string
  arrivalStation: string
  departureTime: string
  arrivalTime: string
  seatClass: string
  carNumber: number
  seats?: string[]
  price: number
  paymentDeadline: Date
  reservationNumber: string
}

export default function ReservationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [reservation, setReservation] = useState<ReservationInfo | null>(null)
  const [timeRemaining, setTimeRemaining] = useState("")
  const [isNoticeOpen, setIsNoticeOpen] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showCartDialog, setShowCartDialog] = useState(false)
  const [showCartSuccessDialog, setShowCartSuccessDialog] = useState(false)

  useEffect(() => {
    // sessionStorage에서 예약 정보 가져오기
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('reservationInfo') : null
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setReservation({
          trainType: parsed.trainType,
          trainNumber: parsed.trainNumber,
          date: parsed.date,
          departureStation: parsed.departureStation,
          arrivalStation: parsed.arrivalStation,
          departureTime: parsed.departureTime,
          arrivalTime: parsed.arrivalTime,
          seatClass: parsed.seatClass,
          carNumber: parsed.carNumber,
          seats: parsed.seats,
          price: parsed.price,
          paymentDeadline: addMinutes(new Date(), 10), // 10분 후 결제 기한
          reservationNumber: '', // 추후 백엔드 응답값으로 대체
        })
        return
      } catch (e) {
        // 파싱 실패 시 fallback
      }
    }
    // URL 파라미터에서 예약 정보 가져오기 (실제로는 API 호출)
    const mockReservation: ReservationInfo = {
      trainType: "ITX-새마을",
      trainNumber: "1036",
      date: "2025년 06월 02일(월)",
      departureStation: "대구",
      arrivalStation: "서울",
      departureTime: "09:33",
      arrivalTime: "13:14",
      seatClass: "일반실",
      carNumber: 3,
      seats: ["8A"],
      price: 42400,
      paymentDeadline: addMinutes(new Date(), 10), // 10분 후 결제 기한
      reservationNumber: "R2025060100001",
    }
    setReservation(mockReservation)
  }, [])

  useEffect(() => {
    if (!reservation) return

    const updateTimer = () => {
      const now = new Date()
      const deadline = reservation.paymentDeadline
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

  const confirmCancelReservation = () => {
    setShowCancelDialog(false)
    // 실제로는 취소 API 호출 후 목록 페이지로 이동
    alert("예약이 취소되었습니다.")
    router.push("/")
  }

  const handleAddToCart = () => {
    setShowCartDialog(true)
  }

  const confirmAddToCart = () => {
    setShowCartDialog(false)
    // 실제로는 장바구니 API 호출
    setShowCartSuccessDialog(true)
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

  const getTrainTypeColor = (trainType: string) => {
    switch (trainType) {
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

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">예약 정보를 불러오고 있습니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Train className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-600">RAIL-O</h1>
              </Link>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Link href="/" className="hover:text-blue-600">
                  홈
                </Link>
                <span>{">"}</span>
                <Link href="/ticket/booking" className="hover:text-blue-600">
                  승차권예매
                </Link>
                <span>{">"}</span>
                <span className="text-blue-600">예약완료</span>
              </div>
            </div>
            <Link href="/ticket/search">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ChevronLeft className="h-4 w-4" />
                <span>돌아가기</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

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
                    <Badge className={`${getTrainTypeColor(reservation.trainType)} px-3 py-1`}>
                      {reservation.trainType}
                    </Badge>
                    <span className="text-xl font-bold">{reservation.trainNumber}</span>
                    <span className="text-gray-600">{reservation.date}</span>
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
                        <span className="text-lg font-semibold">{reservation.departureStation}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span className="text-lg font-semibold">{reservation.arrivalStation}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-gray-600">
                        <span>{reservation.departureTime}</span>
                        <span>~</span>
                        <span>{reservation.arrivalTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seat Information */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">좌석 정보</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{reservation.seatClass}</span>
                        <span className="text-gray-600">
                          {reservation.carNumber}호차
                          {reservation.seats && reservation.seats.length > 0
                            ? reservation.seats.map((seat, idx) => (
                                <span key={seat}>
                                  {idx > 0 ? ', ' : ' '}{seat}
                                </span>
                              ))
                            : ''}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-blue-600">{formatPrice(reservation.price)}</div>
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
                        {format(reservation.paymentDeadline, "yyyy년 MM월 dd일 HH:mm", { locale: ko })}
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
                    <p>• 승차권을 받지받은 스마트폰에서만 확인할 수 있습니다.</p>
                    <p>• 승차권 예약 후 10분 이내에 결제하지 않으면 예약이 자동 취소됩니다.</p>
                    <p>• 결제 완료 후에는 출발시간 20분 전까지 취소 가능합니다.</p>
                    <p>• 예약번호: {reservation.reservationNumber}</p>
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

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-4">고객센터</h3>
              <p className="text-sm text-gray-300">1544-7788</p>
              <p className="text-sm text-gray-300">평일 05:30~23:30</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">빠른 링크</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <Link href="#" className="hover:text-white">
                    이용약관
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    개인정보처리방침
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    사이트맵
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">RAIL-O 소개</h3>
              <p className="text-sm text-gray-300">
                RAIL-O는 국민의 안전하고 편리한 철도여행을 위해 최선을 다하고 있습니다.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 RAIL-O. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
