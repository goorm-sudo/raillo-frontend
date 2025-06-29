"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import {
  Train,
  Ticket,
  Search,
  CalendarIcon,
  CreditCard,
  User,
  ShoppingCart,
  LogIn,
  Clock,
  MapPin,
  ArrowLeftRight,
  Menu,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Star,
} from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export default function HomePage() {
  // 임시 로그인 상태 시뮬레이션 (실제로는 인증 상태에 따라 결정)
  const isLoggedIn = false // Simplified login status
  // 예매 폼 상태
  const [departureStation, setDepartureStation] = useState("")
  const [arrivalStation, setArrivalStation] = useState("")
  const [departureDate, setDepartureDate] = useState<Date>()
  const [passengers, setPassengers] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)
  const [showDateDialog, setShowDateDialog] = useState(false)
  const [selectedTime, setSelectedTime] = useState("00시")
  const [tempDate, setTempDate] = useState<Date | undefined>(departureDate)

  // 주요 기차역 목록
  const stations = [
    "서울",
    "용산",
    "영등포",
    "수원",
    "천안아산",
    "대전",
    "김천구미",
    "동대구",
    "신경주",
    "울산",
    "부산",
    "광주송정",
    "목포",
    "여수엑스포",
    "강릉",
    "정동진",
    "춘천",
    "원주",
    "제천",
    "안동",
    "포항",
    "경주",
    "마산",
    "진주",
    "순천",
    "여수",
  ]

  const handleSearch = () => {
    if (!departureStation || !arrivalStation || !departureDate || !passengers) {
      alert("모든 항목을 선택해주세요.")
      return
    }

    // URL 파라미터 생성
    const searchParams = new URLSearchParams({
      departure: departureStation,
      arrival: arrivalStation,
      date: departureDate.toISOString().split("T")[0],
      passengers: passengers,
    })

    // 검색 결과 페이지로 이동
    window.location.href = `/ticket/search?${searchParams.toString()}`
  }

  const swapStations = () => {
    const temp = departureStation
    setDepartureStation(arrivalStation)
    setArrivalStation(temp)
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
                <label className="block text-sm font-medium text-blue-100 mb-2">출발역</label>
                <Select value={departureStation} onValueChange={setDepartureStation}>
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue placeholder="출발역 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station} value={station}>
                        {station}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <label className="block text-sm font-medium text-blue-100 mb-2">도착역</label>
                <Select value={arrivalStation} onValueChange={setArrivalStation}>
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue placeholder="도착역 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station} value={station}>
                        {station}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 출발일 */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-blue-100 mb-2">출발일</label>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-white text-gray-900 hover:bg-gray-50"
                  onClick={() => setShowDateDialog(true)}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {departureDate ? format(departureDate, "MM/dd", { locale: ko }) : "날짜 선택"}
                </Button>
              </div>

              {/* 인원 */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-blue-100 mb-2">인원</label>
                <Select value={passengers} onValueChange={setPassengers}>
                  <SelectTrigger className="bg-white text-gray-900">
                    <SelectValue placeholder="인원 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">어른 1명</SelectItem>
                    <SelectItem value="2">어른 2명</SelectItem>
                    <SelectItem value="3">어른 3명</SelectItem>
                    <SelectItem value="4">어른 4명</SelectItem>
                    <SelectItem value="5">어른 5명</SelectItem>
                    <SelectItem value="6">어른 6명</SelectItem>
                  </SelectContent>
                </Select>
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

      {/* Date Selection Dialog */}
      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent className="sm:max-w-lg p-0 max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b">
            <DialogTitle className="text-xl font-bold">날짜 선택</DialogTitle>
          </div>

          <div className="p-4">
            {/* Selected Date Display */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
              <div className="text-xl font-bold text-blue-600">
                {tempDate ? format(tempDate, "yyyy년 MM월 dd일(E)", { locale: ko }) : "날짜를 선택하세요"}
              </div>
              <div className="text-sm text-gray-600 mt-1">{selectedTime} 이후 출발</div>
            </div>

            {/* Calendar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <button
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => {
                    if (tempDate) {
                      const prevMonth = new Date(tempDate)
                      prevMonth.setMonth(prevMonth.getMonth() - 1)
                      setTempDate(prevMonth)
                    }
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-bold">{tempDate ? format(tempDate, "yyyy. MM.", { locale: ko }) : ""}</h3>
                <button
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => {
                    if (tempDate) {
                      const nextMonth = new Date(tempDate)
                      nextMonth.setMonth(nextMonth.getMonth() + 1)
                      setTempDate(nextMonth)
                    }
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* 날짜 직접 선택 필드 */}
              <div className="flex items-center justify-center space-x-2 mb-4 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-1">
                  <Select
                    value={tempDate ? tempDate.getFullYear().toString() : new Date().getFullYear().toString()}
                    onValueChange={(value) => {
                      if (tempDate) {
                        const newDate = new Date(tempDate)
                        newDate.setFullYear(Number.parseInt(value))
                        setTempDate(newDate)
                      } else {
                        const newDate = new Date()
                        newDate.setFullYear(Number.parseInt(value))
                        setTempDate(newDate)
                      }
                    }}
                  >
                    <SelectTrigger className="w-[90px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}년
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-1">
                  <Select
                    value={tempDate ? (tempDate.getMonth() + 1).toString() : (new Date().getMonth() + 1).toString()}
                    onValueChange={(value) => {
                      if (tempDate) {
                        const newDate = new Date(tempDate)
                        newDate.setMonth(Number.parseInt(value) - 1)
                        setTempDate(newDate)
                      } else {
                        const newDate = new Date()
                        newDate.setMonth(Number.parseInt(value) - 1)
                        setTempDate(newDate)
                      }
                    }}
                  >
                    <SelectTrigger className="w-[80px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {month}월
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-1">
                  <Select
                    value={tempDate ? tempDate.getDate().toString() : new Date().getDate().toString()}
                    onValueChange={(value) => {
                      if (tempDate) {
                        const newDate = new Date(tempDate)
                        newDate.setDate(Number.parseInt(value))
                        setTempDate(newDate)
                      } else {
                        const newDate = new Date()
                        newDate.setDate(Number.parseInt(value))
                        setTempDate(newDate)
                      }
                    }}
                  >
                    <SelectTrigger className="w-[80px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        {
                          length: tempDate
                            ? new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate()
                            : 31,
                        },
                        (_, i) => i + 1,
                      ).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}일
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Custom Calendar */}
              <div className="border rounded-lg overflow-hidden bg-white">
                {/* Days of week header */}
                <div className="grid grid-cols-7 bg-gray-50">
                  {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
                    <div
                      key={day}
                      className={`p-3 text-center text-sm font-medium ${index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-gray-700"}`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                  {(() => {
                    if (!tempDate) return null

                    const year = tempDate.getFullYear()
                    const month = tempDate.getMonth()
                    const firstDay = new Date(year, month, 1)
                    const lastDay = new Date(year, month + 1, 0)
                    const startDate = new Date(firstDay)
                    startDate.setDate(startDate.getDate() - firstDay.getDay())

                    const days = []
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)

                    for (let i = 0; i < 42; i++) {
                      const currentDate = new Date(startDate)
                      currentDate.setDate(startDate.getDate() + i)

                      const isCurrentMonth = currentDate.getMonth() === month
                      const isToday = currentDate.getTime() === today.getTime()
                      const isSelected = tempDate && currentDate.toDateString() === tempDate.toDateString()
                      const isPast = currentDate < today
                      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6

                      days.push(
                        <button
                          key={i}
                          onClick={() => {
                            if (!isPast && isCurrentMonth) {
                              setTempDate(currentDate)
                            }
                          }}
                          disabled={isPast || !isCurrentMonth}
                          className={`
                            p-3 text-sm transition-colors relative
                            ${
                              isCurrentMonth
                                ? isPast
                                  ? "text-gray-300 cursor-not-allowed"
                                  : isSelected
                                    ? "bg-blue-600 text-white font-semibold"
                                    : isToday
                                      ? "bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200"
                                      : isWeekend
                                        ? currentDate.getDay() === 0
                                          ? "text-red-500 hover:bg-red-50"
                                          : "text-blue-500 hover:bg-blue-50"
                                        : "text-gray-900 hover:bg-gray-100"
                                : "text-gray-300"
                            }
                          `}
                        >
                          {currentDate.getDate()}
                        </button>,
                      )
                    }

                    return days
                  })()}
                </div>
              </div>
            </div>

            {/* Time Selection */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-3">시간선택</h4>
              <div className="grid grid-cols-4 gap-2">
                {[
                  "00시",
                  "01시",
                  "02시",
                  "03시",
                  "04시",
                  "06시",
                  "08시",
                  "10시",
                  "12시",
                  "14시",
                  "16시",
                  "18시",
                  "20시",
                  "22시",
                ].map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    className={`text-xs py-2 px-3 ${selectedTime === time ? "bg-blue-600" : ""}`}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex border-t p-4">
            <Button variant="outline" onClick={() => setShowDateDialog(false)} className="flex-1 mr-2">
              취소
            </Button>
            <Button
              onClick={() => {
                if (tempDate) {
                  setDepartureDate(tempDate)
                  setShowDateDialog(false)
                }
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              적용
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
