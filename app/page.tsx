"use client"

import Link from "next/link"
import {useState} from "react"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {
  ArrowLeftRight,
  CalendarIcon,
  CreditCard,
  RotateCcw,
  Search,
  Ticket,
  User,
  X,
  Train,
  MapPin,
  Clock,
} from "lucide-react"
import PageLayout from "@/components/layout/PageLayout"
import {StationSelector} from "@/components/ui/station-selector"
import {DateTimeSelector} from "@/components/ui/date-time-selector"
import {PassengerSelector} from "@/components/ui/passenger-selector"

interface PassengerCounts {
  adult: number
  child: number
  infant: number
  senior: number
  severelydisabled: number
  mildlydisabled: number
  veteran: number
}

export default function HomePage() {
  // 임시 로그인 상태 시뮬레이션 (실제로는 인증 상태에 따라 결정)
  const isLoggedIn = false // Simplified login status
  const router = useRouter()
  
  // 예매 폼 상태
  const [departureStation, setDepartureStation] = useState("")
  const [arrivalStation, setArrivalStation] = useState("")
  const [departureDate, setDepartureDate] = useState<Date>(new Date())
  const [passengers, setPassengers] = useState<PassengerCounts>({
    adult: 1,
    child: 0,
    infant: 0,
    senior: 0,
    severelydisabled: 0,
    mildlydisabled: 0,
    veteran: 0,
  })
  const [showSidebar, setShowSidebar] = useState(false)

  const handleSearch = async () => {
    if (!departureStation || !arrivalStation || !departureDate) {
      alert("모든 항목을 선택해주세요.")
      return
    }

    // 검색 기록 저장
    const searchHistory = {
      departure: departureStation,
      arrival: arrivalStation,
      timestamp: Date.now()
    }
    
    const existingHistory = localStorage.getItem('rail-o-search-history')
    let history = []
    
    if (existingHistory) {
      try {
        history = JSON.parse(existingHistory)
      } catch (error) {
        console.error('기존 검색 기록 파싱 실패:', error)
      }
    }

    // 중복 제거
    history = history.filter((item: any) => 
      !(item.departure === departureStation && item.arrival === arrivalStation)
    )

    // 새 기록을 맨 앞에 추가
    history.unshift(searchHistory)

    // 최대 5개까지만 저장
    history = history.slice(0, 5)

    localStorage.setItem('rail-o-search-history', JSON.stringify(history))

    // 검색 조건을 localStorage에 저장하여 새로고침 시에도 유지
    const searchData = {
      departureStation,
      arrivalStation,
      departureDate: `${departureDate.getFullYear()}-${(departureDate.getMonth() + 1).toString().padStart(2, '0')}-${departureDate.getDate().toString().padStart(2, '0')}`,
      departureHour: departureDate.getHours().toString().padStart(2, '0'),
      passengers
    }
    
    localStorage.setItem('searchData', JSON.stringify(searchData))
    router.push('/ticket/search')
  }

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

  const handleBothStationsChange = (departure: string, arrival: string) => {
    setDepartureStation(departure)
    setArrivalStation(arrival)
  }

  return (
    <PageLayout>
      {/* Sidebar Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowSidebar(false)}>
          <div
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar Header */}
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">카테고리</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                className="text-white hover:bg-blue-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Sidebar Content */}
            <div className="p-4">
              <nav className="space-y-2">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">승차권 서비스</h3>

                  <Link
                    href="/ticket/purchased"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">승차권 확인</span>
                  </Link>

                  <Link
                    href="/ticket/booking"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Ticket className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700">승차권 예매</span>
                  </Link>

                  <Link
                    href="/ticket/reservations"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Search className="h-5 w-5 text-orange-600" />
                    <span className="text-gray-700">예약 승차권 조회</span>
                  </Link>

                  <Link
                    href="/ticket/purchased"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <RotateCcw className="h-5 w-5 text-red-600" />
                    <span className="text-gray-700">승차권 반환</span>
                  </Link>
                </div>

                {/* 비회원 서비스 섹션 */}
                <div className="space-y-1 mt-6">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">비회원 서비스</h3>

                  <Link
                    href="/guest-ticket/search"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <User className="h-5 w-5 text-indigo-600" />
                    <span className="text-gray-700">비회원 승차권 확인</span>
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section with reduced spacing */}
          <div className="text-center mb-12">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4 shadow-lg">
                <Train className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              안전하고 편리한
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                철도여행
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              RAIL-O와 함께하는 스마트한 기차여행을 시작하세요
            </p>
          </div>

          {/* Ticket Booking Form with enhanced design */}
          <Card className="mb-16 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-2xl border-0">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">열차 예매</h2>
                <p className="text-blue-100">원하는 조건으로 열차를 검색하고 예매하세요</p>
              </div>
              
              {/* 한 줄 예매 폼 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                              {/* 출발역 */}
              <div className="lg:col-span-2">
                <StationSelector
                  value={departureStation}
                  onValueChange={handleDepartureStationChange}
                  placeholder="출발역 선택"
                  label="출발역"
                  otherStation={arrivalStation}
                  onBothStationsChange={handleBothStationsChange}
                />
              </div>

              {/* 교환 버튼 */}
              <div className="lg:col-span-1 flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={swapStations}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-3 h-12 w-12 rounded-full transition-all duration-200"
                >
                  <ArrowLeftRight className="h-5 w-5" />
                </Button>
              </div>

              {/* 도착역 */}
              <div className="lg:col-span-2">
                <StationSelector
                  value={arrivalStation}
                  onValueChange={handleArrivalStationChange}
                  placeholder="도착역 선택"
                  label="도착역"
                  otherStation={departureStation}
                  onBothStationsChange={handleBothStationsChange}
                />
              </div>

                {/* 출발일 */}
                <div className="lg:col-span-2">
                  <DateTimeSelector
                    value={departureDate}
                    onValueChange={(date) => {
                      setDepartureDate(date)
                    }}
                    placeholder="날짜 선택"
                    label="출발일"
                  />
                </div>

                {/* 인원 */}
                <div className="lg:col-span-2">
                  <PassengerSelector
                    value={passengers}
                    onValueChange={setPassengers}
                    placeholder="인원 선택"
                    label="인원"
                    simple={false}
                  />
                </div>

                {/* 검색 버튼 */}
                <div className="lg:col-span-3">
                  <Button
                    size="lg"
                    onClick={handleSearch}
                    className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold h-12 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Search className="mr-3 h-5 w-5" />
                    열차 조회하기
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Grid with improved spacing and design */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">주요 서비스</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                RAIL-O에서 제공하는 다양한 서비스를 이용해보세요
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 승차권 확인 */}
              <Link href="/ticket/purchased">
                <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                        <CreditCard className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">승차권 확인</CardTitle>
                        <CardDescription className="text-gray-600">예매한 승차권 정보를 확인하세요</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button variant="outline" className="w-full group-hover:bg-green-50 group-hover:border-green-300 group-hover:text-green-700 transition-all duration-200 font-medium">
                      확인하기
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* 예약 승차권 조회 및 취소 */}
              <Link href="/ticket/reservations">
                <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-orange-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                        <CalendarIcon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">예약승차권 조회</CardTitle>
                        <CardDescription className="text-gray-600">예약한 승차권을 조회하고 취소할 수 있습니다</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button variant="outline" className="w-full group-hover:bg-orange-50 group-hover:border-orange-300 group-hover:text-orange-700 transition-all duration-200 font-medium">
                      조회하기
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* 열차 조회 */}
              <Link href="/ticket/booking">
                <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                        <Search className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">승차권 예매</CardTitle>
                        <CardDescription className="text-gray-600">원하는 열차를 검색하고 예매하세요</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button variant="outline" className="w-full group-hover:bg-purple-50 group-hover:border-purple-300 group-hover:text-purple-700 transition-all duration-200 font-medium">
                      예매하기
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Additional Features Section */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-8 text-gray-400">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm">24시간 운영</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span className="text-sm">전국 역 연결</span>
              </div>
              <div className="flex items-center space-x-2">
                <Train className="h-5 w-5" />
                <span className="text-sm">안전한 여행</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
