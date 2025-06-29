"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Search, Train, MapPin, Clock, User, ArrowRight, ChevronLeft, X, AlertTriangle, Info, CreditCard } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { cn } from "@/lib/utils"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
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

interface ReservationItem {
  id: string
  trainType: string
  trainNumber: string
  date: string
  departureStation: string
  arrivalStation: string
  departureTime: string
  arrivalTime: string
  seatClass: string
  carNumber: number
  seatNumber: string
  price: number
  reservationNumber: string
  paymentDeadline: Date
  status: "pending" | "expired"
}

export default function ReservationsPage() {
  const router = useRouter()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null)

  // 예약 목록 (결제 안된 예약들)
  const [reservations] = useState<ReservationItem[]>([
    {
      id: "1",
      trainType: "ITX-새마을",
      trainNumber: "1036",
      date: "2025년 06월 02일(월)",
      departureStation: "대구",
      arrivalStation: "서울",
      departureTime: "09:33",
      arrivalTime: "13:14",
      seatClass: "일반실",
      carNumber: 3,
      seatNumber: "8A",
      price: 42400,
      reservationNumber: "R2025060100001",
      paymentDeadline: new Date(Date.now() + 25 * 60 * 1000), // 25분 후
      status: "pending",
    },
    {
      id: "2",
      trainType: "KTX",
      trainNumber: "101",
      date: "2025년 06월 05일(목)",
      departureStation: "서울",
      arrivalStation: "부산",
      departureTime: "06:00",
      arrivalTime: "08:42",
      seatClass: "일반실",
      carNumber: 2,
      seatNumber: "15B",
      price: 59800,
      reservationNumber: "R2025060100002",
      paymentDeadline: new Date(Date.now() - 5 * 60 * 1000), // 5분 전 (만료)
      status: "expired",
    },
  ])

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

  const getTimeRemaining = (deadline: Date) => {
    const now = new Date()
    const diff = deadline.getTime() - now.getTime()

    if (diff <= 0) {
      return "결제 기한 만료"
    }

    const minutes = Math.floor(diff / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    return `${minutes}분 ${seconds}초 남음`
  }

  const handleCancelReservation = (reservationId: string) => {
    setSelectedReservation(reservationId)
    setShowCancelDialog(true)
  }

  const confirmCancelReservation = () => {
    if (selectedReservation) {
      // 실제로는 API 호출하여 예약 취소
      console.log("예약 취소:", selectedReservation)
      alert("예약이 취소되었습니다.")
    }
    setShowCancelDialog(false)
    setSelectedReservation(null)
  }

  const handlePayment = (reservationId: string) => {
    router.push("/ticket/payment")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">예약승차권 조회</h2>
            <p className="text-gray-600">예약한 승차권을 확인하고 결제하거나 취소할 수 있습니다</p>
          </div>

          {/* Notice */}
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-blue-700">
                <Info className="h-5 w-5" />
                <span className="font-medium">결제 기한이 지난 목록은 자동 삭제됩니다</span>
              </div>
            </CardContent>
          </Card>

          {/* Reservation List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">예약 내역</h3>

            {reservations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">예약 내역이 없습니다</h3>
                  <p className="text-gray-600 mb-6">새로운 예약을 진행하세요.</p>
                  <Link href="/ticket/booking">
                    <Button className="bg-blue-600 hover:bg-blue-700">승차권 예매하기</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              reservations.map((reservation) => (
                <Card
                  key={reservation.id}
                  className={`${reservation.status === "expired" ? "bg-gray-50 border-gray-300" : "border-blue-200"}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getTrainTypeColor(reservation.trainType)} px-3 py-1`}>
                          {reservation.trainType}
                        </Badge>
                        <span className="text-lg font-bold">{reservation.trainNumber}</span>
                        <span className="text-gray-600">{reservation.date}</span>
                        {reservation.status === "expired" && (
                          <Badge variant="destructive" className="bg-red-600">
                            결제기한만료
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">{formatPrice(reservation.price)}</div>
                        <div className="text-xs text-gray-500">예약번호: {reservation.reservationNumber}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Route Info */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          운행 정보
                        </h4>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{reservation.departureStation}</span>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <span className="font-medium">{reservation.arrivalStation}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {reservation.departureTime} ~ {reservation.arrivalTime}
                          </div>
                        </div>
                      </div>

                      {/* Seat Info */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">좌석 정보</h4>
                        <div className="space-y-1">
                          <div className="text-sm">{reservation.seatClass}</div>
                          <div className="text-sm text-gray-600">
                            {reservation.carNumber}호차 {reservation.seatNumber}
                          </div>
                        </div>
                      </div>

                      {/* Payment Deadline */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          결제 기한
                        </h4>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {format(reservation.paymentDeadline, "MM/dd HH:mm", { locale: ko })}
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              reservation.status === "expired" ? "text-red-600" : "text-orange-600"
                            }`}
                          >
                            {getTimeRemaining(reservation.paymentDeadline)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelReservation(reservation.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        예약취소
                      </Button>
                      {reservation.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handlePayment(reservation.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          결제하기
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Notice */}
          <Card className="mt-8 bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-2 text-sm text-yellow-800">
                  <h3 className="font-semibold">예약승차권 조회 안내</h3>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>예약 후 10분 이내에 결제하지 않으면 자동으로 취소됩니다.</li>
                    <li>결제 기한이 지난 예약은 자동으로 삭제됩니다.</li>
                    <li>예약 취소는 결제 기한 내에만 가능합니다.</li>
                    <li>예약번호는 예약 완료 시 발급된 번호입니다.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Cancel Reservation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약 취소</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 예약을 취소하시겠습니까?
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

      {/* Footer */}
      <Footer />
    </div>
  )
}
