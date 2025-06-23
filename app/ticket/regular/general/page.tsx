"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Train, ChevronLeft, Home, ChevronRight, CalendarIcon, ArrowLeftRight, Users } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export default function GeneralRegularTicketPage() {
  const router = useRouter()
  const [tripType, setTripType] = useState("direct")
  const [departureStation, setDepartureStation] = useState("")
  const [arrivalStation, setArrivalStation] = useState("")
  const [ticketPeriod, setTicketPeriod] = useState("10days")
  const [startDate, setStartDate] = useState<Date>(new Date(2025, 5, 2)) // 2025년 06월 02일
  const [passengers, setPassengers] = useState("1")

  // 상태 추가
  const [showDateDialog, setShowDateDialog] = useState(false)
  const [selectedTime, setSelectedTime] = useState("00시")
  const [tempStartDate, setTempStartDate] = useState<Date>(startDate)

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

  const swapStations = () => {
    const temp = departureStation
    setDepartureStation(arrivalStation)
    setArrivalStation(temp)
  }

  const handleSearch = () => {
    if (!departureStation || !arrivalStation) {
      alert("출발역과 도착역을 모두 선택해주세요.")
      return
    }

    // 검색 결과 페이지로 이동 (일반정기권용)
    const searchParams = new URLSearchParams({
      departure: departureStation,
      arrival: arrivalStation,
      startDate: startDate.toISOString().split("T")[0],
      passengers: passengers,
      tripType: tripType,
      ticketPeriod: ticketPeriod,
      type: "general",
    })

    router.push(`/ticket/regular/search?${searchParams.toString()}`)
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
            <Link href="/ticket/regular">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ChevronLeft className="h-4 w-4" />
                <span>돌아가기</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Blue Header Section */}
      <div className="bg-blue-500 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">정기승차권</h1>
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
            <span>예매</span>
            <ChevronRight className="h-4 w-4" />
            <Link href="/ticket/regular" className="hover:text-blue-600">
              정기승차권
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Card */}
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8">
              {/* Title */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">일반정기권</h2>
              </div>

              {/* Trip Type Selection */}
              <div className="mb-8">
                <RadioGroup value={tripType} onValueChange={setTripType} className="flex justify-center space-x-8">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="direct" id="direct" className="data-[state=checked]:bg-blue-600" />
                    <Label htmlFor="direct" className="text-lg">
                      직통
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="transfer" id="transfer" className="data-[state=checked]:bg-blue-600" />
                    <Label htmlFor="transfer" className="text-lg">
                      환승
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Station Selection */}
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  {/* Departure Station */}
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <Label className="text-lg font-medium">출발</Label>
                    </div>
                    <Select value={departureStation} onValueChange={setDepartureStation}>
                      <SelectTrigger className="h-12 text-lg bg-gray-50 border-gray-300">
                        <SelectValue placeholder="출발역" />
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

                  {/* Swap Button */}
                  <div className="md:col-span-1 flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={swapStations}
                      className="p-3 rounded-full border-gray-300"
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Arrival Station */}
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <Label className="text-lg font-medium">도착</Label>
                    </div>
                    <Select value={arrivalStation} onValueChange={setArrivalStation}>
                      <SelectTrigger className="h-12 text-lg bg-gray-50 border-gray-300">
                        <SelectValue placeholder="도착역" />
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
                </div>
              </div>

              {/* Ticket Period Selection */}
              <div className="mb-8">
                <RadioGroup
                  value={ticketPeriod}
                  onValueChange={setTicketPeriod}
                  className="flex justify-center space-x-8"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="10days" id="10days" className="data-[state=checked]:bg-blue-600" />
                    <Label htmlFor="10days" className="text-lg">
                      10일 정기권
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1month" id="1month" className="data-[state=checked]:bg-blue-600" />
                    <Label htmlFor="1month" className="text-lg">
                      1개월 정기권
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Schedule and Passengers */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">일정 및 인원</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">시작일</Label>
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-start text-left font-normal bg-gray-50 border-gray-300"
                      onClick={() => setShowDateDialog(true)}
                    >
                      <span className="text-lg">{format(startDate, "yyyy년 MM월 dd일(E)", { locale: ko })}</span>
                      <CalendarIcon className="ml-auto h-4 w-4" />
                    </Button>
                  </div>

                  {/* Passengers */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">인원</Label>
                    <Select value={passengers} onValueChange={setPassengers}>
                      <SelectTrigger className="h-12 bg-gray-50 border-gray-300">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-lg">총 {passengers}명</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">총 1명</SelectItem>
                        <SelectItem value="2">총 2명</SelectItem>
                        <SelectItem value="3">총 3명</SelectItem>
                        <SelectItem value="4">총 4명</SelectItem>
                        <SelectItem value="5">총 5명</SelectItem>
                        <SelectItem value="6">총 6명</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <div className="text-center">
                <Button
                  onClick={handleSearch}
                  className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 text-lg rounded-full"
                  size="lg"
                >
                  열차 조회
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
                {format(tempStartDate, "yyyy년 MM월 dd일(E)", { locale: ko })}
              </div>
              <div className="text-sm text-gray-600 mt-1">{selectedTime} 이후 출발</div>
            </div>

            {/* Calendar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <button
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => {
                    const prevMonth = new Date(tempStartDate)
                    prevMonth.setMonth(prevMonth.getMonth() - 1)
                    setTempStartDate(prevMonth)
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-bold">{format(tempStartDate, "yyyy. MM.", { locale: ko })}</h3>
                <button
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => {
                    const nextMonth = new Date(tempStartDate)
                    nextMonth.setMonth(nextMonth.getMonth() + 1)
                    setTempStartDate(nextMonth)
                  }}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* 날짜 직접 선택 필드 */}
              <div className="flex items-center justify-center space-x-2 mb-4 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-1">
                  <Select
                    value={tempStartDate.getFullYear().toString()}
                    onValueChange={(value) => {
                      const newDate = new Date(tempStartDate)
                      newDate.setFullYear(Number.parseInt(value))
                      setTempStartDate(newDate)
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
                    value={(tempStartDate.getMonth() + 1).toString()}
                    onValueChange={(value) => {
                      const newDate = new Date(tempStartDate)
                      newDate.setMonth(Number.parseInt(value) - 1)
                      setTempStartDate(newDate)
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
                    value={tempStartDate.getDate().toString()}
                    onValueChange={(value) => {
                      const newDate = new Date(tempStartDate)
                      newDate.setDate(Number.parseInt(value))
                      setTempStartDate(newDate)
                    }}
                  >
                    <SelectTrigger className="w-[80px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: new Date(tempStartDate.getFullYear(), tempStartDate.getMonth() + 1, 0).getDate() },
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
                    const year = tempStartDate.getFullYear()
                    const month = tempStartDate.getMonth()
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
                      const isSelected = tempStartDate && currentDate.toDateString() === tempStartDate.toDateString()
                      const isPast = currentDate < today
                      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6

                      days.push(
                        <button
                          key={i}
                          onClick={() => {
                            if (!isPast && isCurrentMonth) {
                              setTempStartDate(currentDate)
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
                setStartDate(tempStartDate)
                setShowDateDialog(false)
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              적용
            </Button>
          </div>
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
