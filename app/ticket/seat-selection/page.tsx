"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Train,
  ChevronLeft,
  User,
  Users,
  Info,
  AlertCircle,
  Check,
  X,
  ArrowRight,
  Loader2
} from "lucide-react"
import { trainApi } from "@/lib/api/client"
import { STATION_MAP } from "@/lib/types/train.types"
import type { 
  TrainCarInfo, 
  SeatInfo,
  TrainCarSeatDetailResponse 
} from "@/lib/types/train.types"

interface BookingInfo {
  train: {
    trainId: string
    trainType: string
    trainNumber: string
    departureTime: string
    arrivalTime: string
  }
  seatType: string
  departure: string
  arrival: string
  date: string
  passengers: number
  price: number
}

export default function SeatSelectionPage() {
  const router = useRouter()
  const [bookingInfo, setBookingInfo] = useState<BookingInfo | null>(null)
  const [cars, setCars] = useState<TrainCarInfo[]>([])
  const [selectedCar, setSelectedCar] = useState<string | null>(null)
  const [seats, setSeats] = useState<SeatInfo[]>([])
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [loadingCars, setLoadingCars] = useState(true)
  const [loadingSeats, setLoadingSeats] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 페이지 로드 시 예약 정보 확인
  useEffect(() => {
    const storedBookingInfo = sessionStorage.getItem('bookingInfo')
    if (!storedBookingInfo) {
      alert('예약 정보가 없습니다. 다시 검색해주세요.')
      router.push('/ticket/booking')
      return
    }
    
    const info = JSON.parse(storedBookingInfo)
    setBookingInfo(info)
    
    // 객차 목록 조회
    fetchTrainCars(info)
  }, [router])

  // 객차 목록 조회
  const fetchTrainCars = async (info: BookingInfo) => {
    setLoadingCars(true)
    setError(null)
    
    try {
      const departureStationId = STATION_MAP[info.departure] || 1
      const arrivalStationId = STATION_MAP[info.arrival] || 11
      
      const response = await trainApi.getTrainCars({
        trainScheduleId: parseInt(info.train.trainId),
        departureStationId,
        arrivalStationId,
        passengerCount: info.passengers
      })
      
      // 선택한 좌석 타입에 맞는 객차만 필터링
      const filteredCars = response.result.carInfos.filter((car: TrainCarInfo) => {
        if (info.seatType === "특실") {
          return car.carType === 'FIRST_CLASS'
        } else {
          return car.carType === 'STANDARD'
        }
      })
      
      setCars(filteredCars)
      
      // 추천 객차가 있으면 자동 선택
      if (response.result.recommendedCarNumber) {
        setSelectedCar(response.result.recommendedCarNumber)
        fetchSeatDetail(response.result.recommendedCarNumber, filteredCars, info)
      }
    } catch (err) {
      console.error('객차 목록 조회 실패:', err)
      setError('객차 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoadingCars(false)
    }
  }

  // 좌석 상세 조회
  const fetchSeatDetail = async (carNumber: string, carList: TrainCarInfo[], info: BookingInfo) => {
    setLoadingSeats(true)
    setError(null)
    
    try {
      const car = carList.find(c => c.carNumber === carNumber)
      if (!car) return
      
      const departureStationId = STATION_MAP[info.departure] || 1
      const arrivalStationId = STATION_MAP[info.arrival] || 11
      
      const response = await trainApi.getSeatDetail({
        trainCarId: car.id,
        trainScheduleId: parseInt(info.train.trainId),
        departureStationId,
        arrivalStationId
      })
      
      console.log('좌석 조회 응답:', response)
      console.log('좌석 데이터:', response.result)
      
      // seats 또는 seatList 중 어느 것이 오는지 확인
      const seatData = response.result.seats || response.result.seatList || []
      console.log('실제 좌석 배열:', seatData)
      
      setSeats(seatData)
    } catch (err) {
      console.error('좌석 상세 조회 실패:', err)
      setError('좌석 정보를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoadingSeats(false)
    }
  }

  // 객차 선택
  const handleCarSelection = (carNumber: string) => {
    setSelectedCar(carNumber)
    setSelectedSeats([]) // 객차 변경 시 선택된 좌석 초기화
    if (bookingInfo) {
      fetchSeatDetail(carNumber, cars, bookingInfo)
    }
  }

  // 좌석 선택/해제
  const handleSeatSelection = (seatId: number) => {
    if (!bookingInfo) return
    
    const seat = seats.find(s => s.seatId === seatId)
    if (!seat || !seat.isAvailable) return
    
    if (selectedSeats.includes(seatId)) {
      // 좌석 해제
      setSelectedSeats(selectedSeats.filter(id => id !== seatId))
    } else {
      // 좌석 선택 (최대 인원수까지)
      if (selectedSeats.length < bookingInfo.passengers) {
        setSelectedSeats([...selectedSeats, seatId])
      } else {
        alert(`최대 ${bookingInfo.passengers}명까지 선택 가능합니다.`)
      }
    }
  }

  // 예약 진행
  const handleReservation = async () => {
    if (!bookingInfo || selectedSeats.length !== bookingInfo.passengers) {
      alert(`${bookingInfo?.passengers}명의 좌석을 선택해주세요.`)
      return
    }
    
    // 선택된 좌석 정보 저장
    const selectedSeatInfo = selectedSeats.map(seatId => {
      const seat = seats.find(s => s.seatId === seatId)
      const car = cars.find(c => c.carNumber === selectedCar)
      return {
        seatId,
        seatNumber: seat?.seatNumber,
        carNumber: selectedCar,
        seatClass: car?.seatClass,
        fare: seat?.fare
      }
    })
    
    const reservationData = {
      ...bookingInfo,
      selectedSeats: selectedSeatInfo,
      totalAmount: selectedSeatInfo.reduce((sum, seat) => sum + (seat.fare || 0), 0)
    }
    
    sessionStorage.setItem('reservationData', JSON.stringify(reservationData))
    router.push('/ticket/reservation')
  }

  // 좌석 위치 스타일
  const getSeatPositionIcon = (position: string) => {
    switch (position) {
      case 'WINDOW':
        return '🪟'
      case 'AISLE':
        return '🚶'
      default:
        return ''
    }
  }

  // 좌석 상태 스타일
  const getSeatStyle = (seat: SeatInfo) => {
    if (!seat.isAvailable) {
      return "bg-gray-200 text-gray-400 cursor-not-allowed"
    }
    if (selectedSeats.includes(seat.seatId)) {
      return "bg-blue-600 text-white ring-2 ring-blue-400"
    }
    return "bg-white hover:bg-blue-50 border-2 border-gray-300 cursor-pointer"
  }

  if (!bookingInfo) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Train className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-600">RAIL-O</h1>
            </Link>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              이전으로
            </Button>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* 페이지 제목 */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">좌석 선택</h2>
            <p className="text-gray-600">원하시는 좌석을 선택해주세요</p>
          </div>

          {/* 예약 정보 요약 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-blue-600 text-white">
                      {bookingInfo.train.trainType}
                    </Badge>
                    <span className="font-semibold">{bookingInfo.train.trainNumber}호</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{bookingInfo.departure}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{bookingInfo.arrival}</span>
                  </div>
                  <div className="text-gray-600">
                    {bookingInfo.train.departureTime} ~ {bookingInfo.train.arrivalTime}
                  </div>
                  <Badge variant="outline">{bookingInfo.seatType}</Badge>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{bookingInfo.passengers}명</span>
                  </div>
                  <div className="text-sm text-blue-600">
                    {selectedSeats.length}/{bookingInfo.passengers}석 선택됨
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 객차 선택 */}
            <div>
              <h3 className="text-lg font-semibold mb-4">객차 선택</h3>
              {loadingCars ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : cars.length === 0 ? (
                <Card className="bg-gray-50">
                  <CardContent className="p-6 text-center">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">이용 가능한 객차가 없습니다.</p>
                  </CardContent>
                </Card>
              ) : (
                <RadioGroup value={selectedCar || ''} onValueChange={(value) => handleCarSelection(value)}>
                  <div className="space-y-2">
                    {cars.map((car) => (
                      <Label
                        key={car.carNumber}
                        htmlFor={`car-${car.carNumber}`}
                        className={`block cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                          selectedCar === car.carNumber 
                            ? 'border-blue-600 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem 
                            value={car.carNumber} 
                            id={`car-${car.carNumber}`}
                            className="shrink-0"
                          />
                          <div className="flex-1">
                            <div className="font-medium">{parseInt(car.carNumber)}호차</div>
                            <div className="text-sm text-gray-600">
                              잔여 {car.remainingSeats}/{car.totalSeats}석
                            </div>
                            {car.recommendationReason && (
                              <div className="text-xs text-blue-600 mt-1">
                                {car.recommendationReason}
                              </div>
                            )}
                          </div>
                        </div>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </div>

            {/* 좌석 배치도 */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">좌석 배치도</h3>
              {!selectedCar ? (
                <Card className="bg-gray-50">
                  <CardContent className="p-12 text-center">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">객차를 먼저 선택해주세요.</p>
                  </CardContent>
                </Card>
              ) : loadingSeats ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">좌석 정보를 불러오는 중...</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    {/* 범례 */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-white border-2 border-gray-300 rounded"></div>
                          <span>선택가능</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-600 rounded"></div>
                          <span>선택됨</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gray-200 rounded"></div>
                          <span>예약됨</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span>🪟 창가</span>
                        <span className="ml-3">🚶 통로</span>
                      </div>
                    </div>

                    {/* 좌석 그리드 */}
                    <div className="grid grid-cols-4 gap-2">
                      {seats.map((seat) => (
                        <button
                          key={seat.seatId}
                          onClick={() => handleSeatSelection(seat.seatId)}
                          disabled={!seat.isAvailable}
                          className={`relative p-3 rounded-lg transition-all ${getSeatStyle(seat)}`}
                        >
                          <div className="text-sm font-medium">{seat.seatNumber}</div>
                          <div className="text-xs mt-1">
                            {getSeatPositionIcon(seat.seatPosition)}
                          </div>
                          {selectedSeats.includes(seat.seatId) && (
                            <Check className="absolute top-1 right-1 h-4 w-4" />
                          )}
                        </button>
                      ))}
                    </div>

                    {seats.length === 0 && (
                      <div className="text-center py-8 text-gray-600">
                        좌석 정보가 없습니다.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <Card className="mt-6 border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 안내 사항 */}
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-2 text-blue-700">
                <Info className="h-5 w-5 mt-0.5" />
                <div className="text-sm">
                  <p>• 좌석은 {bookingInfo.passengers}명 모두 선택해야 합니다.</p>
                  <p>• 선택한 좌석은 예약 완료 전까지 다른 사용자가 선택할 수 있습니다.</p>
                  <p>• 좌석 위치는 열차 진행 방향 기준입니다.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 하단 버튼 */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              이전 단계
            </Button>
            <Button
              onClick={handleReservation}
              disabled={selectedSeats.length !== bookingInfo.passengers}
              className="bg-blue-600 hover:bg-blue-700"
            >
              예약 정보 확인
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}