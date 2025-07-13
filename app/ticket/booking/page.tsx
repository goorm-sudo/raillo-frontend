"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import {
  Train,
  Search,
  ArrowLeftRight,
} from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { StationSelector } from "@/components/ui/station-selector"
import { DateTimeSelector } from "@/components/ui/date-time-selector"
import { PassengerSelector } from "@/components/ui/passenger-selector"

interface PassengerCounts {
  adult: number
  child: number
  infant: number
  senior: number
  severelydisabled: number
  mildlydisabled: number
  veteran: number
}

export default function TicketBookingPage() {
  const router = useRouter()
  const [departureStation, setDepartureStation] = useState("")
  const [arrivalStation, setArrivalStation] = useState("")
  const [departureDate, setDepartureDate] = useState<Date>(new Date())
  const [tripType, setTripType] = useState("oneway")

  // 승객 정보 상태
  const [passengerCounts, setPassengerCounts] = useState<PassengerCounts>({
    adult: 1,
    child: 0,
    infant: 0,
    senior: 0,
    severelydisabled: 0,
    mildlydisabled: 0,
    veteran: 0,
  })

  const swapStations = () => {
    const temp = departureStation
    setDepartureStation(arrivalStation)
    setArrivalStation(temp)
  }

  const handleDepartureStationChange = (station: string) => {
    if (station === arrivalStation) {
      // 출발역과 도착역이 같으면 자동으로 바꾸기
      setArrivalStation(departureStation)
      setDepartureStation(station)
    } else {
      setDepartureStation(station)
    }
  }

  const handleArrivalStationChange = (station: string) => {
    if (station === departureStation) {
      // 출발역과 도착역이 같으면 자동으로 바꾸기
      setDepartureStation(arrivalStation)
      setArrivalStation(station)
    } else {
      setArrivalStation(station)
    }
  }

  const handleSearch = () => {
    if (!departureStation || !arrivalStation || !departureDate) {
      alert("출발역, 도착역, 출발일을 모두 선택해주세요.")
      return
    }

    // 검색 기록 저장
    const searchHistory = {
      departure: departureStation,
      arrival: arrivalStation,
      timestamp: Date.now()
    }
    
    // 기존 검색 기록 가져오기
    const existingHistory = localStorage.getItem('rail-o-search-history')
    let historyArray: any[] = []
    
    if (existingHistory) {
      try {
        historyArray = JSON.parse(existingHistory)
      } catch (error) {
        console.error('기존 검색 기록 파싱 실패:', error)
      }
    }
    
    // 중복 제거 (같은 출발역-도착역 조합이 있으면 제거)
    historyArray = historyArray.filter(item => 
      !(item.departure === searchHistory.departure && item.arrival === searchHistory.arrival)
    )
    
    // 새 기록을 맨 앞에 추가
    historyArray.unshift(searchHistory)
    
    // 최대 3개까지만 유지
    historyArray = historyArray.slice(0, 3)
    
    // 로컬 스토리지에 저장
    localStorage.setItem('rail-o-search-history', JSON.stringify(historyArray))

    // 검색 조건을 localStorage에 저장하여 새로고침 시에도 유지
    const searchData = {
      departureStation,
      arrivalStation,
      departureDate: `${departureDate.getFullYear()}-${(departureDate.getMonth() + 1).toString().padStart(2, '0')}-${departureDate.getDate().toString().padStart(2, '0')}`,
      departureHour: departureDate.getHours().toString().padStart(2, '0'),
      passengers: passengerCounts,
      tripType
    }
    
    localStorage.setItem('searchData', JSON.stringify(searchData))
    router.push('/ticket/search')
  }

  const getTotalPassengers = () => {
    return Object.values(passengerCounts).reduce((sum, count) => sum + count, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">승차권 예매</h2>
            <p className="text-gray-600">원하시는 열차를 검색하고 예매하세요</p>
          </div>

          {/* Booking Form */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Train className="h-5 w-5 text-blue-600" />
                <span>승차권 검색</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trip Type */}
              <div>
                <Label className="text-base font-semibold mb-3 block">여행 구분</Label>
                <RadioGroup value={tripType} onValueChange={setTripType} className="flex space-x-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="oneway" id="oneway" />
                    <Label htmlFor="oneway">편도</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="roundtrip" id="roundtrip" disabled />
                    <Label htmlFor="roundtrip" className="text-gray-400">왕복 (준비 중)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Stations */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-2">
                  <StationSelector
                    value={departureStation}
                    onValueChange={handleDepartureStationChange}
                    placeholder="출발역을 선택하세요"
                    label="출발역"
                    variant="white"
                    otherStation={arrivalStation}
                    onBothStationsChange={(departure, arrival) => {
                      setDepartureStation(departure)
                      setArrivalStation(arrival)
                    }}
                  />
                </div>

                <div className="flex justify-center">
                  <Button type="button" variant="outline" size="sm" onClick={swapStations} className="p-2">
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="md:col-span-2">
                  <StationSelector
                    value={arrivalStation}
                    onValueChange={handleArrivalStationChange}
                    placeholder="도착역을 선택하세요"
                    label="도착역"
                    variant="white"
                    otherStation={departureStation}
                    onBothStationsChange={(departure, arrival) => {
                      setDepartureStation(departure)
                      setArrivalStation(arrival)
                    }}
                  />
                </div>
              </div>

              {/* Date and Passengers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <DateTimeSelector
                    value={departureDate}
                    onValueChange={setDepartureDate}
                    placeholder="출발일을 선택하세요"
                    label="출발일"
                    variant="white"
                  />
                </div>

                <div>
                  <PassengerSelector
                    value={passengerCounts}
                    onValueChange={setPassengerCounts}
                    placeholder="인원을 선택하세요"
                    label="인원"
                    simple={false}
                    variant="white"
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSearch}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 text-lg"
                >
                  <Search className="mr-2 h-5 w-5" />
                  열차 조회하기
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">예매 안내</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• 승차권은 출발일 1개월 전부터 예매 가능합니다.</p>
                <p>• 예매 취소는 출발시간 20분 전까지 가능합니다.</p>
                <p>• 어린이는 만 6세~12세, 경로는 만 65세 이상입니다.</p>
                <p>• 장애인 할인은 1~3급 장애인에게 적용됩니다.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">할인 혜택</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• 어린이: 일반실 50% 할인</p>
                <p>• 경로: 일반실 30% 할인</p>
                <p>• 장애인: 일반실 50% 할인</p>
                <p>• 국가유공자: 일반실 30% 할인</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
