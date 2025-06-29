"use client"

import Link from "next/link"
import {useState} from "react"
import {useRouter} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {
  ArrowLeftRight,
  CalendarIcon,
  Clock,
  CreditCard,
  MapPin,
  RotateCcw,
  Search,
  Ticket,
  User,
  X,
} from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

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
                    href="/ticket/regular"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <CalendarIcon className="h-5 w-5 text-purple-600" />
                    <span className="text-gray-700">정기 승차권</span>
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
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">안전하고 편리한 철도여행</h2>
          <p className="text-lg text-gray-600 mb-8">RAIL-O와 함께하는 스마트한 기차여행을 시작하세요</p>
        </div>

        {/* Ticket Booking Form */}
        <Card className="mb-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            {/* 한 줄 예매 폼 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
              {/* 출발역 */}
              <div className="lg:col-span-2">
                <StationSelector
                  value={departureStation}
                  onValueChange={handleDepartureStationChange}
                  placeholder="출발역 선택"
                  label="출발역"
                />
              </div>

              {/* 교환 버튼 */}
              <div className="lg:col-span-1 flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={swapStations}
                  className="text-white hover:bg-blue-500 p-2 h-10"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>

              {/* 도착역 */}
              <div className="lg:col-span-2">
                <StationSelector
                  value={arrivalStation}
                  onValueChange={handleArrivalStationChange}
                  placeholder="도착역 선택"
                  label="도착역"
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
                  className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold h-10"
                >
                  <Search className="mr-2 h-4 w-4" />
                  열차 조회하기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 승차권 확인 */}
          <Link href="/ticket/purchased">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span>승차권 확인</span>
                </CardTitle>
                <CardDescription>예매한 승차권 정보를 확인하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  확인하기
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* 예약 승차권 조회 및 취소 */}
          <Link href="/ticket/reservations">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-orange-600" />
                  <span>예약승차권 조회</span>
                </CardTitle>
                <CardDescription>예약한 승차권을 조회하고 취소할 수 있습니다</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  조회하기
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* 열차 조회 */}
          <Link href="/ticket/booking">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-purple-600" />
                  <span>승차권 예매</span>
                </CardTitle>
                <CardDescription>원하는 열차를 검색하고 예매하세요</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  예매하기
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">실시간 운행정보</h3>
              <p className="text-sm text-gray-600">열차 지연 및 운행 상황을 실시간으로 확인</p>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <MapPin className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">역 정보</h3>
              <p className="text-sm text-gray-600">전국 기차역 위치 및 편의시설 안내</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6 text-center">
              <Ticket className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">할인혜택</h3>
              <p className="text-sm text-gray-600">다양한 할인 혜택과 이벤트 정보</p>
            </CardContent>
          </Card>
        </div>

        {/* Notice Section */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-lg text-yellow-800">공지사항</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">공지</Badge>
                <span className="text-sm">2024년 설날 연휴 열차 운행 안내</span>
                <span className="text-xs text-gray-500 ml-auto">2024.01.15</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">이벤트</Badge>
                <span className="text-sm">겨울 여행 할인 이벤트 진행 중</span>
                <span className="text-xs text-gray-500 ml-auto">2024.01.10</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">안내</Badge>
                <span className="text-sm">모바일 앱 업데이트 안내</span>
                <span className="text-xs text-gray-500 ml-auto">2024.01.08</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
