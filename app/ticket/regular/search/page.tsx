"use client"

import Link from "next/link"
import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Train, ChevronLeft, Home, ChevronRight, ArrowLeftRight, Printer } from "lucide-react"

interface RegularTicketOption {
  id: string
  trainType: string
  route: string
  price: number
  description: string
}

export default function RegularTicketSearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<RegularTicketOption | null>(null)

  // URL 파라미터에서 검색 조건 가져오기
  const departureStation = searchParams.get("departure") || "서울"
  const arrivalStation = searchParams.get("arrival") || "천안아산"
  const startDate = searchParams.get("startDate") || "2025-06-02"
  const endDate = searchParams.get("endDate") || "2025-06-11"

  // 정기승차권 옵션들 (KTX만 표시)
  const ticketOptions: RegularTicketOption[] = [
    {
      id: "1",
      trainType: "KTX 산천",
      route: `${departureStation} ↔ ${arrivalStation}`,
      price: 60000,
      description: "기간자유형",
    },
  ]

  const formatPrice = (price: number) => {
    return price.toLocaleString() + "원"
  }

  const handleTicketSelect = (ticket: RegularTicketOption) => {
    setSelectedTicket(ticket)
    setShowPaymentDialog(true)
  }

  const handlePayment = () => {
    setShowPaymentDialog(false)
    // 기존 결제 페이지로 이동
    router.push("/ticket/payment")
  }

  const formatDateRange = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${format(start, "yyyy년 MM월 dd일(E)", { locale: ko })} ~ ${format(end, "yyyy년 MM월 dd일(E)", { locale: ko })}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Train className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-600">RAIL-O</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/ticket/regular/booking">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ChevronLeft className="h-4 w-4" />
                  <span>돌아가기</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Blue Header Section */}
      <div className="bg-blue-500 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">할인승차권 조회</h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Home className="h-4 w-4" />
            <Link href="/" className="hover:text-blue-600">
              홈
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>할인승차권 조회</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Search Summary */}
          <Card className="mb-6 bg-white">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">본인만 사용가능</h2>

                {/* Date Range */}
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <div className="px-6 py-3 bg-gray-50 rounded-lg border">
                    <span className="text-lg">
                      {format(new Date(startDate), "yyyy년 MM월 dd일(E)", { locale: ko })}
                    </span>
                  </div>
                  <ArrowLeftRight className="h-5 w-5 text-gray-400" />
                  <div className="px-6 py-3 bg-gray-50 rounded-lg border">
                    <span className="text-lg">{format(new Date(endDate), "yyyy년 MM월 dd일(E)", { locale: ko })}</span>
                  </div>
                </div>

                {/* Station Route */}
                <div className="flex items-center justify-center space-x-4">
                  <div className="px-8 py-4 bg-gray-50 rounded-full border">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                      <span className="text-xl font-medium">{departureStation}</span>
                    </div>
                  </div>
                  <ArrowLeftRight className="h-5 w-5 text-gray-400" />
                  <div className="px-8 py-4 bg-gray-50 rounded-full border">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      <span className="text-xl font-medium">{arrivalStation}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Options */}
          <div className="space-y-4">
            {ticketOptions.map((ticket) => (
              <Card
                key={ticket.id}
                className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleTicketSelect(ticket)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-blue-600 text-white px-3 py-1 text-sm">{ticket.trainType}</Badge>
                      <span className="text-lg font-medium">{ticket.route}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">{ticket.description}</div>
                      <div className="text-xl font-bold text-blue-600">{formatPrice(ticket.price)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">안내 메시지</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-4">
              <p className="text-lg font-medium">해당 정기승차권을 결제하시겠습니까?</p>

              <div className="space-y-2 text-gray-700">
                <p className="font-medium">
                  {departureStation} ↔ {arrivalStation} (왕복)
                </p>
                <p>{formatDateRange()}</p>
                <p className="text-sm">김구름 님 본인만 사용가능</p>
              </div>
            </div>
          </div>
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)} className="flex-1 rounded-full">
              취소
            </Button>
            <Button onClick={handlePayment} className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-full">
              결제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
