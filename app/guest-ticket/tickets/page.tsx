"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Train, Home, Printer, Download, QrCode, Clock, MapPin, User, AlertTriangle } from "lucide-react"
import { paymentHistoryApi } from "@/lib/api/client"

export default function GuestTicketsPage() {
  const router = useRouter()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guestInfo, setGuestInfo] = useState<any>(null)

  // 페이지 로드 시 비회원 정보 확인 및 티켓 조회
  useEffect(() => {
    const savedGuestInfo = sessionStorage.getItem('guestInfo')
    if (!savedGuestInfo) {
      alert("비회원 정보가 없습니다. 다시 검색해주세요.")
      router.push('/guest-ticket/search')
      return
    }
    
    const info = JSON.parse(savedGuestInfo)
    setGuestInfo(info)
    fetchGuestTickets(info)
  }, [router])

  // 비회원 티켓 조회
  const fetchGuestTickets = async (info: any) => {
    setLoading(true)
    setError(null)
    
    try {
      // TODO: 이 부분은 추후 Ticket 도메인이 구현되면 ticketApi.getGuestTickets()로 변경되어야 합니다
      // 현재는 임시로 Payment API를 사용하여 결제 정보만 조회합니다
      // 예약 번호가 있는 경우 해당 예약만 조회, 없으면 전체 조회
      const reservationId = info.reservationId ? parseInt(info.reservationId) : 0
      const data = await paymentHistoryApi.getGuestPaymentHistory(
        reservationId,
        info.name,
        info.phoneNumber,
        info.password
      )
      
      // API 응답을 프론트엔드 형식으로 변환
      // TODO: Ticket 도메인이 구현되면 이 변환 로직이 필요 없어집니다
      const transformedTickets = data.payments?.map((item: any, index: number) => ({
        id: item.paymentId || item.reservationNumber || `T${index + 1}`,
        // TODO: 아래 정보들은 Ticket API에서 제공되어야 합니다
        trainType: "KTX", // 임시 고정값
        trainNumber: "-", // 임시 값
        departure: {
          station: "조회 불가", // 임시 값
          time: "-",
          date: "-",
        },
        arrival: {
          station: "조회 불가", // 임시 값
          time: "-",
          date: "-",
        },
        seat: {
          car: "-", // 임시 값
          seat: "-", // 임시 값
          class: "일반실", // 임시 고정값
        },
        passenger: {
          name: info.name,
          phone: info.phoneNumber,
        },
        price: item.amountPaid || item.totalAmount || 0,
        status: item.paymentStatus === 'COMPLETED' ? "사용가능" : 
                item.paymentStatus === 'USED' ? "사용완료" : "기간만료",
        purchaseDate: item.paidAt ? new Date(item.paidAt).toLocaleString('ko-KR') : "-",
        reservationNumber: item.reservationId || item.externalOrderId || "-",
      })) || []
      
      setTickets(transformedTickets)
    } catch (error) {
      console.error('비회원 티켓 조회 실패:', error)
      setError('티켓 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "사용가능":
        return "bg-green-100 text-green-800"
      case "사용완료":
        return "bg-gray-100 text-gray-800"
      case "기간만료":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">비회원 승차권 확인</h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b py-3">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              <Home className="h-4 w-4" />
            </Link>
            <span>/</span>
            <span>비회원서비스</span>
            <span>/</span>
            <span className="text-blue-600">승차권 확인</span>
          </div>
          <Button variant="ghost" size="sm">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Passenger Info */}
          {guestInfo && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-500 mr-3" />
                  <div>
                    <p className="font-semibold">{guestInfo.name}</p>
                    <p className="text-sm text-gray-600">{guestInfo.phoneNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">예매 승차권 목록</h2>
            {!loading && !error && (
              <>
                <p className="text-gray-600">총 {tickets.length}건의 승차권이 조회되었습니다.</p>
                {/* TODO: Ticket 도메인 구현 완료 시 이 알림을 제거하세요 */}
                {tickets.length > 0 && (
                  <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      현재 일부 승차권 정보(열차번호, 좌석정보 등)가 제한적으로 표시됩니다. 
                      전체 정보는 추후 업데이트될 예정입니다.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-48 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
                <Button 
                  onClick={() => guestInfo && fetchGuestTickets(guestInfo)} 
                  variant="outline" 
                  size="sm" 
                  className="ml-4"
                >
                  다시 시도
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {!loading && !error && tickets.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Train className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">예매 내역이 없습니다</h3>
                <p className="text-gray-600 mb-6">해당 정보로 조회된 승차권이 없습니다.</p>
                <Link href="/guest-ticket/search">
                  <Button variant="outline">다시 검색하기</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Tickets List */}
          {!loading && !error && tickets.length > 0 && (
            <div className="space-y-6">
              {tickets.map((ticket) => (
              <Card key={ticket.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Train className="h-6 w-6 text-blue-600" />
                      <div>
                        <CardTitle className="text-xl font-bold text-blue-900">
                          {ticket.trainType} {ticket.trainNumber}호
                        </CardTitle>
                        <p className="text-sm text-blue-700">예매번호: {ticket.reservationNumber}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 운행 정보 */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        운행 정보
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{ticket.departure.station}</p>
                            <p className="text-sm text-gray-600">{ticket.departure.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600 text-lg">{ticket.departure.time}</p>
                            <p className="text-xs text-gray-500">출발</p>
                          </div>
                        </div>
                        <div className="border-l-2 border-dashed border-gray-300 ml-2 h-4"></div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{ticket.arrival.station}</p>
                            <p className="text-sm text-gray-600">{ticket.arrival.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600 text-lg">{ticket.arrival.time}</p>
                            <p className="text-xs text-gray-500">도착</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 좌석 정보 */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">좌석 정보</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">좌석등급</span>
                          <span className="font-medium">{ticket.seat.class}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">호차</span>
                          <span className="font-medium">{ticket.seat.car}호차</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">좌석번호</span>
                          <span className="font-medium">{ticket.seat.seat}</span>
                        </div>
                      </div>
                    </div>

                    {/* 승객 및 구매 정보 */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        승객 정보
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">이름</span>
                          <span className="font-medium">{ticket.passenger.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">연락처</span>
                          <span className="font-medium">{ticket.passenger.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">구매일</span>
                          <span className="font-medium">{ticket.purchaseDate}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-gray-600">결제금액</span>
                          <span className="font-bold text-lg text-blue-600">{ticket.price.toLocaleString()}원</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>다운로드</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <QrCode className="h-4 w-4" />
                      <span>QR코드</span>
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>운행정보</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link href="/guest-ticket/search">
              <Button variant="outline" className="px-6">
                다시 조회하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
