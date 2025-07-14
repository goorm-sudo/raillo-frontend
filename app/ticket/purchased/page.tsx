"use client"

import Link from "next/link"
import { useState } from "react"
import { useAuth } from '@/hooks/use-auth'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Train, ChevronLeft, MapPin, ArrowRight, Download, QrCode, Calendar, User, Clock, Printer, CreditCard } from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

interface PurchasedTicket {
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
  ticketNumber: string
  purchaseDate: Date
  status: "valid" | "used" | "expired"
}

export default function PurchasedTicketsPage() {
  const { isAuthenticated, isChecking } = useAuth({ redirectPath: '/ticket/purchased' })

  // 구매한 승차권 목록
  const [tickets] = useState<PurchasedTicket[]>([
    // 빈 배열로 설정하여 empty state 표시
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-600 text-white"
      case "used":
        return "bg-gray-600 text-white"
      case "expired":
        return "bg-red-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "valid":
        return "사용가능"
      case "used":
        return "사용완료"
      case "expired":
        return "기간만료"
      default:
        return "알 수 없음"
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString() + "원"
  }

  const handleDownloadTicket = (ticketId: string) => {
    // 실제로는 PDF 다운로드 기능 구현
    alert("승차권을 다운로드합니다.")
  }

  const handleShowQR = (ticketId: string) => {
    // 실제로는 QR 코드 모달 표시
    alert("QR 코드를 표시합니다.")
  }

  // 로그인 상태 확인 중이거나 인증되지 않은 경우 로딩 표시
  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">인증을 확인하고 있습니다...</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">승차권 확인</h2>
          </div>

          {/* Content */}
          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">승차권</h2>
            </div>

            <div className="space-y-6">
              {/* Info Message */}
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">
                    전달한 승차권을 확인하시려면{" "}
                    <Link href="/ticket/booking" className="text-blue-600 hover:underline">
                      여기
                    </Link>
                    를 클릭하세요.
                  </p>
                </CardContent>
              </Card>

              {/* Ticket List or Empty State */}
              {tickets.length === 0 ? (
                <Card className="border-gray-200">
                  <CardContent className="p-16 text-center">
                    {/* Ticket Icon */}
                    <div className="mx-auto mb-6 w-24 h-16 relative">
                      <svg
                        viewBox="0 0 100 60"
                        className="w-full h-full text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        {/* Ticket outline */}
                        <path
                          d="M10 10 L90 10 L90 50 L10 50 Z"
                          fill="none"
                          stroke="currentColor"
                          strokeDasharray="3,2"
                        />
                        {/* Perforation line */}
                        <line
                          x1="50"
                          y1="10"
                          x2="50"
                          y2="50"
                          stroke="currentColor"
                          strokeDasharray="2,2"
                          strokeWidth="1"
                        />
                        {/* Small circles for perforation */}
                        <circle cx="50" cy="15" r="1" fill="currentColor" />
                        <circle cx="50" cy="25" r="1" fill="currentColor" />
                        <circle cx="50" cy="35" r="1" fill="currentColor" />
                        <circle cx="50" cy="45" r="1" fill="currentColor" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">발권하신 승차권이 없습니다.</h3>
                  </CardContent>
                </Card>
              ) : (
                tickets.map((ticket) => (
                  <Card key={ticket.id} className="border-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Badge className={`${getTrainTypeColor(ticket.trainType)} px-3 py-1`}>
                            {ticket.trainType}
                          </Badge>
                          <span className="text-lg font-bold">{ticket.trainNumber}</span>
                          <span className="text-gray-600">{ticket.date}</span>
                          <Badge className={`${getStatusColor(ticket.status)} px-2 py-1`}>
                            {getStatusText(ticket.status)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-blue-600">{formatPrice(ticket.price)}</div>
                          <div className="text-xs text-gray-500">승차권번호: {ticket.ticketNumber}</div>
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
                              <span className="font-medium">{ticket.departureStation}</span>
                              <ArrowRight className="h-3 w-3 text-gray-400" />
                              <span className="font-medium">{ticket.arrivalStation}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {ticket.departureTime} ~ {ticket.arrivalTime}
                            </div>
                          </div>
                        </div>

                        {/* Seat Info */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">좌석 정보</h4>
                          <div className="space-y-1">
                            <div className="text-sm">{ticket.seatClass}</div>
                            <div className="text-sm text-gray-600">
                              {ticket.carNumber}호차 {ticket.seatNumber}
                            </div>
                          </div>
                        </div>

                        {/* Purchase Info */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            구매 정보
                          </h4>
                          <div className="space-y-1">
                            <div className="text-sm">{format(ticket.purchaseDate, "yyyy.MM.dd", { locale: ko })}</div>
                            <div className="text-sm text-gray-600">결제완료</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadTicket(ticket.id)}
                          disabled={ticket.status === "expired"}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          다운로드
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleShowQR(ticket.id)}
                          disabled={ticket.status !== "valid"}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <QrCode className="h-4 w-4 mr-1" />
                          QR코드
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
