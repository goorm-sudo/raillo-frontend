"use client"

import { useState, useEffect } from "react"
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Train, MapPin, ArrowRight, User } from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getTickets } from '@/lib/api/booking'
import { handleError } from '@/lib/utils/errorHandler'
import { differenceInMinutes, parse } from "date-fns"

interface Ticket {
  ticketId: number
  reservationId: number
  operationDate: string
  departureStationId: number
  departureStationName: string
  departureTime: string
  arrivalStationId: number
  arrivalStationName: string
  arrivalTime: string
  trainNumber: string
  trainName: string
  trainCarType: string
  trainCarNumber: number
  seatRow: number
  seatColumn: string
  seatType: string
}

export default function PurchasedTicketsPage() {
  const { isAuthenticated, isChecking } = useAuth({ redirectPath: '/ticket/purchased' })
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 승차권 목록 조회
  useEffect(() => {
    // 로그인 상태가 확인된 후에만 승차권 목록을 조회
    if (isChecking || !isAuthenticated) return

    const fetchTickets = async () => {
      try {
        setLoading(true)
        const response = await getTickets()
        setTickets((response as any).result ?? [])
      } catch (err) {
        const errorMessage = handleError(err, '승차권 목록 조회 중 오류가 발생했습니다.', false)
        setError(errorMessage)
        setTickets([])
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [isChecking, isAuthenticated])

  const getTrainTypeColor = (trainName: string) => {
    switch (trainName) {
      case "KTX":
      case "KTX-산천":
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

  const getCarTypeName = (carType: string) => {
    switch (carType) {
      case "STANDARD":
        return "일반실"
      case "FIRST_CLASS":
        return "특실"
      default:
        return carType
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "yyyy년 MM월 dd일(EEEE)", { locale: ko })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5) // "HH:mm" 형식으로 변환
  }

  // reservationId로 그룹화
  const groupedTickets = tickets.reduce<Record<number, Ticket[]>>((acc, ticket) => {
    if (!acc[ticket.reservationId]) acc[ticket.reservationId] = []
    acc[ticket.reservationId].push(ticket)
    return acc
  }, {})

  // 소요 시간 계산 함수
  const getDuration = (departure: string, arrival: string) => {
    // "HH:mm:ss" 형식
    const dep = parse(departure, "HH:mm:ss", new Date())
    const arr = parse(arrival, "HH:mm:ss", new Date())
    let diff = differenceInMinutes(arr, dep)
    if (diff < 0) diff += 24 * 60 // 자정 넘는 경우
    const hours = Math.floor(diff / 60)
    const minutes = diff % 60
    return `${hours > 0 ? hours + "시간 " : ""}${minutes}분`
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
          <p className="text-gray-600">승차권을 불러오고 있습니다...</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">승차권 확인</h2>
          </div>

          {/* Content */}
          <div className="w-full">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">승차권</h2>
            </div>

            <div className="space-y-6">
              {/* Error Message */}
              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </CardContent>
                </Card>
              )}

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
                Object.values(groupedTickets).map((group) => {
                  const first = group[0]
                  return (
                    <Card key={first.reservationId} className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-white shadow-lg">
                      <CardContent className="p-6">
                        {/* 승차권 헤더 */}
                        <div className="border-b-2 border-blue-200 pb-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                <Train className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <Badge className={`${getTrainTypeColor(first.trainName)} px-3 py-1 text-sm font-bold`}>
                                    {first.trainName}
                                  </Badge>
                                  <span className="text-xl font-bold text-gray-900">{first.trainNumber}</span>
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {formatDate(first.operationDate)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                            </div>
                          </div>
                        </div>

                        {/* 승차권 본문 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* 운행 정보 */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                              운행 정보
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="text-center flex-1">
                                  <div className="text-2xl font-bold text-blue-600">{formatTime(first.departureTime)}</div>
                                  <div className="text-sm text-gray-600 mt-1">{first.departureStationName}</div>
                                </div>
                                <div className="flex items-center mx-4">
                                  <div className="w-16 h-0.5 bg-blue-300"></div>
                                  <ArrowRight className="h-4 w-4 text-blue-400 mx-1" />
                                  <div className="w-16 h-0.5 bg-blue-300"></div>
                                </div>
                                <div className="text-center flex-1">
                                  <div className="text-2xl font-bold text-blue-600">{formatTime(first.arrivalTime)}</div>
                                  <div className="text-sm text-gray-600 mt-1">{first.arrivalStationName}</div>
                                </div>
                              </div>
                              <div className="text-center">
                                <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                                  소요시간 {getDuration(first.departureTime, first.arrivalTime)}
                                </span>
                              </div>
                            </div>
                          </div>

                                                     {/* 좌석 정보 */}
                           <div className="bg-white rounded-lg p-4 border border-gray-200">
                             <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                               <User className="h-4 w-4 mr-2 text-green-600" />
                               좌석 정보
                             </h4>
                             <div className="space-y-2">
                               {(() => {
                                 // 호차별로 좌석 그룹화
                                 const seatsByCar = group.reduce<Record<number, string[]>>((acc, ticket) => {
                                   if (!acc[ticket.trainCarNumber]) acc[ticket.trainCarNumber] = []
                                   acc[ticket.trainCarNumber].push(`${ticket.seatRow}${ticket.seatColumn}`)
                                   return acc
                                 }, {})

                                 return Object.entries(seatsByCar).map(([carNumber, seats]) => (
                                   <div key={carNumber} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                     <div className="flex items-center space-x-2">
                                       <Badge variant="outline" className="text-xs">
                                         {getCarTypeName(group[0].trainCarType)}
                                       </Badge>
                                       <span className="font-medium text-gray-900">
                                         {carNumber}호차({seats.join(', ')})
                                       </span>
                                     </div>
                                   </div>
                                 ))
                               })()}
                             </div>
                           </div>
                        </div>

                        {/* 승차권 하단 정보 */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span>승차권 발권완료</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
