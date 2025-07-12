"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Train,
  ChevronLeft,
  Clock,
  Users,
  AlertCircle,
  Info,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Filter,
} from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { trainApi } from "@/lib/api/client"

// 기차 정보 타입 정의
interface TrainInfo {
  trainId: string
  trainType: string
  trainNumber: string
  departureStation: string
  arrivalStation: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  availableSeats: number
  seatTypes: string[]
  seatInfo: {
    [key: string]: {
      available: number
      price: number
    }
  }
}

export default function TrainSearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // URL 파라미터에서 검색 조건 가져오기
  const departure = searchParams.get("departure") || "서울"
  const arrival = searchParams.get("arrival") || "부산"
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0]
  const passengers = parseInt(searchParams.get("passengers") || "1")
  const time = searchParams.get("time")
  
  // 상태 관리
  const [trains, setTrains] = useState<TrainInfo[]>([])
  const [selectedTrain, setSelectedTrain] = useState<TrainInfo | null>(null)
  const [selectedSeatType, setSelectedSeatType] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [errorType, setErrorType] = useState<'error' | 'info' | 'warning'>('error')
  const [errorCode, setErrorCode] = useState<string | null>(null)

  // 출발 시간이 지난 경우 처리
  const handleTimePassedError = (originalMessage: string) => {
    const now = new Date()
    const currentHour = now.getHours()
    const nextEvenHour = Math.ceil(currentHour / 2) * 2
    
    if (nextEvenHour < 24) {
      const newTime = nextEvenHour.toString().padStart(2, '0')
      const newUrl = new URLSearchParams(window.location.search)
      newUrl.set('time', newTime)
      
      // 2초 후 자동으로 다음 시간대로 재검색
      setTimeout(() => {
        router.push(`/ticket/search?${newUrl.toString()}`)
      }, 2000)
      
      setError(`선택하신 출발 시간이 이미 지났습니다.\n\n${nextEvenHour}시 이후로 자동으로 재검색합니다...`)
    }
  }
  
  // 운행하지 않는 날짜인 경우 처리
  const handleNoOperationError = () => {
    // 다음 운행일 찾기 로직 (실제로는 API에서 제공해야 함)
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDateStr = nextDay.toISOString().split('T')[0]
    
    const newUrl = new URLSearchParams(window.location.search)
    newUrl.set('date', nextDateStr)
    
    setError(`${error}\n\n다음 운행일: ${format(nextDay, 'M월 d일 (EEEE)', { locale: ko })}`)
  }

  // 기차 검색 API 호출
  useEffect(() => {
    const fetchTrains = async () => {
      setLoading(true)
      setError("")
      
      try {
        
        const response = await trainApi.searchTrains({
          departure,
          arrival,
          date,
          passengers,
          time
        })
        
        if (response?.result?.trains) {
          setTrains(response.result.trains)
        } else {
          setError("검색 결과가 없습니다.")
        }
      } catch (err: any) {
        // 기차 검색 실패
        
        const responseErrorCode = err?.response?.data?.errorCode
        const responseErrorMessage = err?.response?.data?.errorMessage
        
        setErrorCode(responseErrorCode)
        
        // 에러 타입 결정 (4xxx는 사용자 안내, 5xxx는 시스템 오류)
        if (responseErrorCode) {
          if (responseErrorCode.startsWith('4') || responseErrorCode.startsWith('T4')) {
            setErrorType('info')
          } else if (responseErrorCode.startsWith('5')) {
            setErrorType('error')
          } else {
            setErrorType('warning')
          }
        }
        
        // 백엔드에서 보낸 에러 메시지가 있는 경우 사용
        if (responseErrorMessage) {
          setError(responseErrorMessage)
          
          // T4404: 출발 시간이 지난 경우 - 현재 시간 이후로 자동 조정 제안
          if (responseErrorCode === 'T4404') {
            handleTimePassedError(responseErrorMessage)
          }
          // T4405: 해당 날짜에 운행하지 않는 경우
          else if (responseErrorCode === 'T4405') {
            handleNoOperationError()
          }
        } else if (err?.message) {
          setError(err.message)
        } else {
          setError("기차 검색 중 오류가 발생했습니다.")
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchTrains()
  }, [departure, arrival, date, passengers, time])

  // 좌석 선택 처리
  const handleSeatSelection = (train: TrainInfo, seatType: string) => {
    const seatInfo = train.seatInfo[seatType]
    if (!seatInfo || seatInfo.available === 0) {
      alert("선택하신 좌석은 매진되었습니다.")
      return
    }
    
    setSelectedTrain(train)
    setSelectedSeatType(seatType)
  }

  // 예매 진행
  const handleBookingConfirm = () => {
    if (!selectedTrain || !selectedSeatType) {
      alert("열차와 좌석을 선택해주세요.")
      return
    }
    
    // 예매 정보를 세션 스토리지에 저장
    const bookingInfo = {
      train: selectedTrain,
      seatType: selectedSeatType,
      departure,
      arrival,
      date,
      passengers,
      price: selectedTrain.seatInfo[selectedSeatType].price
    }
    
    sessionStorage.setItem('bookingInfo', JSON.stringify(bookingInfo))
    
    // 좌석 선택 페이지로 이동
    router.push('/ticket/seat-selection')
  }

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    return price.toLocaleString() + "원"
  }

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center space-x-2">
              <Train className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-600">RAIL-O</h1>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

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
            <Link href="/ticket/booking">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                다시 검색
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 검색 조건 요약 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold">{departure}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="text-lg font-semibold">{arrival}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(date), "yyyy년 MM월 dd일", { locale: ko })}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{passengers}명</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 에러 메시지 */}
          {error && (
            <Card className={`mb-6 ${
              errorType === 'info' 
                ? 'border-blue-200 bg-blue-50' 
                : errorType === 'warning'
                ? 'border-yellow-200 bg-yellow-50'
                : 'border-red-200 bg-red-50'
            }`}>
              <CardContent className="p-6">
                <div className={`flex items-start space-x-2 ${
                  errorType === 'info'
                    ? 'text-blue-600'
                    : errorType === 'warning'
                    ? 'text-yellow-700'
                    : 'text-red-600'
                }`}>
                  {errorType === 'info' ? (
                    <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  ) : errorType === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="space-y-2">
                    <div className="whitespace-pre-line">{error}</div>
                    
                    {/* 스마트 액션 버튼 */}
                    {errorCode === 'T4404' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          const now = new Date()
                          const currentHour = now.getHours()
                          const nextEvenHour = Math.ceil(currentHour / 2) * 2
                          const newTime = nextEvenHour.toString().padStart(2, '0')
                          const newUrl = new URLSearchParams(window.location.search)
                          newUrl.set('time', newTime)
                          router.push(`/ticket/search?${newUrl.toString()}`)
                        }}
                      >
                        현재 시간 이후로 재검색
                      </Button>
                    )}
                    
                    {errorCode === 'T4405' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() => {
                          const nextDay = new Date(date)
                          nextDay.setDate(nextDay.getDate() + 1)
                          const nextDateStr = nextDay.toISOString().split('T')[0]
                          const newUrl = new URLSearchParams(window.location.search)
                          newUrl.set('date', nextDateStr)
                          router.push(`/ticket/search?${newUrl.toString()}`)
                        }}
                      >
                        다음 날짜로 검색
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 기차 목록 */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              검색 결과 ({trains.length}개)
            </h2>
            
            {trains.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Train className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    검색 결과가 없습니다
                  </h3>
                  <p className="text-gray-600 mb-4">
                    선택하신 조건에 맞는 열차가 없습니다.
                  </p>
                  <Button 
                    onClick={() => router.push("/ticket/booking")} 
                    variant="outline"
                  >
                    다시 검색하기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              trains.map((train) => (
                <Card 
                  key={train.trainId} 
                  className={`hover:shadow-lg transition-shadow ${
                    selectedTrain?.trainId === train.trainId ? "ring-2 ring-blue-500" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      {/* 기차 정보 */}
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className="bg-blue-600 text-white">
                            {train.trainType}
                          </Badge>
                          <span className="font-semibold">{train.trainNumber}호</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{train.departureStation}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span>{train.arrivalStation}</span>
                        </div>
                      </div>

                      {/* 시간 정보 */}
                      <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 mb-1">
                          <span className="text-xl font-bold">{train.departureTime}</span>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                          <span className="text-xl font-bold">{train.arrivalTime}</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{train.duration}</span>
                        </div>
                      </div>

                      {/* 좌석 선택 */}
                      <div>
                        <RadioGroup
                          value={selectedTrain?.trainId === train.trainId ? selectedSeatType : ""}
                          onValueChange={(value) => handleSeatSelection(train, value)}
                        >
                          {Object.entries(train.seatInfo).map(([seatType, info]) => (
                            <div key={seatType} className="flex items-center justify-between py-2">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                  value={seatType} 
                                  id={`${train.trainId}-${seatType}`}
                                  disabled={info.available === 0}
                                />
                                <Label 
                                  htmlFor={`${train.trainId}-${seatType}`}
                                  className={`cursor-pointer ${
                                    info.available === 0 ? "text-gray-400 line-through" : ""
                                  }`}
                                >
                                  {seatType}
                                </Label>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">
                                  {formatPrice(info.price)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {info.available > 0 ? `${info.available}석` : "매진"}
                                </div>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* 예매 버튼 */}
          {selectedTrain && selectedSeatType && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
              <div className="container mx-auto max-w-4xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">선택하신 열차</p>
                    <p className="font-semibold">
                      {selectedTrain.trainType} {selectedTrain.trainNumber}호 - {selectedSeatType}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">총 요금</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatPrice(selectedTrain.seatInfo[selectedSeatType].price * passengers)}
                      </p>
                    </div>
                    <Button 
                      onClick={handleBookingConfirm}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                    >
                      좌석 선택하기
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}