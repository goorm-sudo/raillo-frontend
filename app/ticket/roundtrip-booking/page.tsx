"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import {
  Train,
  Clock,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Users,
  CreditCard,
  CheckCircle,
} from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

interface PassengerCounts {
  adult: number
  child: number
  infant: number
  senior: number
  severelydisabled: number
  mildlydisabled: number
  veteran: number
}

interface TrainInfo {
  trainScheduleId?: number
  id: string
  trainType: string
  trainNumber: string
  departureTime: string
  arrivalTime: string
  duration: string
  departureStation: string
  arrivalStation: string
  generalSeat: {
    available: boolean
    price: number
  }
  reservedSeat: {
    available: boolean
    price: number
  }
  standingSeat: {
    available: boolean
    price: number
  }
}

interface BookingData {
  outboundTrain: TrainInfo
  inboundTrain: TrainInfo
  searchData: {
    departureStation: string
    arrivalStation: string
    departureDate: string
    returnDate: string
    passengers: PassengerCounts
    tripType: string
  }
}

export default function RoundtripBookingPage() {
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)

  // 예매 데이터 로드
  useEffect(() => {
    const savedData = localStorage.getItem('roundtripBookingData')
    if (savedData) {
      try {
        const data = JSON.parse(savedData) as BookingData
        setBookingData(data)
      } catch (error) {
        console.error('예매 데이터 로드 실패:', error)
        router.push('/ticket/booking')
      }
    } else {
      router.push('/ticket/booking')
    }
  }, [router])

  const getTotalPrice = () => {
    if (!bookingData) return 0
    // 가는 열차와 오는 열차의 일반실 가격 합계 (실제로는 선택된 좌석 타입에 따라 달라짐)
    return bookingData.outboundTrain.generalSeat.price + bookingData.inboundTrain.generalSeat.price
  }

  const getTotalPassengers = () => {
    if (!bookingData) return 0
    return Object.values(bookingData.searchData.passengers).reduce((sum, count) => sum + count, 0)
  }

  const handleBooking = async () => {
    if (!bookingData) return

    setLoading(true)
    try {
      // 실제 API 호출 대신 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 예매 성공 시 완료 페이지로 이동
      setBookingComplete(true)
      
      // 예매 완료 데이터 저장
      const completeData = {
        ...bookingData,
        bookingId: `RT-${Date.now()}`,
        totalPrice: getTotalPrice(),
        bookingTime: new Date().toISOString()
      }
      localStorage.setItem('roundtripCompleteData', JSON.stringify(completeData))
      
      // 3초 후 완료 페이지로 이동
      setTimeout(() => {
        router.push('/ticket/payment-complete')
      }, 3000)
      
    } catch (error) {
      console.error('예매 실패:', error)
      alert('예매 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">로딩 중...</div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">왕복 승차권 예매</h2>
            <p className="text-gray-600">선택하신 열차 정보를 확인하고 예매를 완료하세요</p>
          </div>

          {bookingComplete ? (
            <Card className="text-center py-12">
              <CardContent>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">예매가 완료되었습니다!</h3>
                <p className="text-gray-600">결제 완료 페이지로 이동합니다...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Journey Summary */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span>여정 정보</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{bookingData.searchData.departureStation}</span>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{bookingData.searchData.arrivalStation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">총 {getTotalPassengers()}명</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* 가는 열차 정보 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ArrowRight className="h-5 w-5 text-green-600" />
                      <span>가는 열차</span>
                      <Badge variant="secondary">
                        {format(new Date(bookingData.searchData.departureDate), 'M월 d일 (E)', { locale: ko })}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{bookingData.outboundTrain.trainType}</Badge>
                          <span className="font-medium">{bookingData.outboundTrain.trainNumber}</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          ₩{bookingData.outboundTrain.generalSeat.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span>{bookingData.outboundTrain.departureTime}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span>{bookingData.outboundTrain.arrivalTime}</span>
                          <span>({bookingData.outboundTrain.duration})</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 오는 열차 정보 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ArrowLeft className="h-5 w-5 text-red-600" />
                      <span>오는 열차</span>
                      <Badge variant="secondary">
                        {format(new Date(bookingData.searchData.returnDate), 'M월 d일 (E)', { locale: ko })}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{bookingData.inboundTrain.trainType}</Badge>
                          <span className="font-medium">{bookingData.inboundTrain.trainNumber}</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">
                          ₩{bookingData.inboundTrain.generalSeat.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span>{bookingData.inboundTrain.departureTime}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span>{bookingData.inboundTrain.arrivalTime}</span>
                          <span>({bookingData.inboundTrain.duration})</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Passenger Information */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>승객 정보</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(bookingData.searchData.passengers).map(([type, count]) => {
                      if (count === 0) return null
                      const typeLabels: { [key: string]: string } = {
                        adult: '성인',
                        child: '어린이',
                        infant: '유아',
                        senior: '경로',
                        severelydisabled: '중증장애인',
                        mildlydisabled: '경증장애인',
                        veteran: '국가유공자'
                      }
                      return (
                        <div key={type} className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-900">{typeLabels[type]}</div>
                          <div className="text-2xl font-bold text-blue-600">{count}명</div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Price Summary */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span>요금 정보</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>가는 열차 요금</span>
                      <span>₩{bookingData.outboundTrain.generalSeat.price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>오는 열차 요금</span>
                      <span>₩{bookingData.inboundTrain.generalSeat.price.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>총 요금</span>
                      <span className="text-blue-600">₩{getTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Button */}
              <div className="text-center">
                <Button
                  onClick={handleBooking}
                  size="lg"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 text-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      예매 중...
                    </>
                  ) : (
                    <>
                      <Train className="mr-2 h-5 w-5" />
                      왕복 예매하기
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
} 