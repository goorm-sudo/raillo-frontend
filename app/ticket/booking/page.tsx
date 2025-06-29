"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import {
  Train,
  Search,
  CalendarIcon,
  ArrowLeftRight,
  ChevronLeft,
  Plus,
  Minus,
  Users,
  ChevronRight,
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

export default function TicketBookingPage() {
  const router = useRouter()
  const [departureStation, setDepartureStation] = useState("")
  const [arrivalStation, setArrivalStation] = useState("")
  const [departureDate, setDepartureDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [departureTime, setDepartureTime] = useState("")
  const [tripType, setTripType] = useState("oneway")
  const [showPassengerDialog, setShowPassengerDialog] = useState(false)
  const [showDepartureDateDialog, setShowDepartureDateDialog] = useState(false)
  const [showReturnDateDialog, setShowReturnDateDialog] = useState(false)
  const [selectedDepartureTime, setSelectedDepartureTime] = useState("00시")
  const [selectedReturnTime, setSelectedReturnTime] = useState("00시")
  const [tempDepartureDate, setTempDepartureDate] = useState<Date | undefined>(departureDate)
  const [tempReturnDate, setTempReturnDate] = useState<Date | undefined>(returnDate)

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

  // 임시 승객 정보 (다이얼로그에서 사용)
  const [tempPassengerCounts, setTempPassengerCounts] = useState<PassengerCounts>(passengerCounts)

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

  const timeOptions = [
    "00시 이후",
    "02시 이후",
    "04시 이후",
    "06시 이후",
    "08시 이후",
    "10시 이후",
    "12시 이후",
    "14시 이후",
    "16시 이후",
    "18시 이후",
    "20시 이후",
    "22시 이후",
  ]

  const passengerTypes = [
    { key: "adult", label: "어른", description: "(13세 이상)", min: 1, max: 9 },
    { key: "child", label: "어린이", description: "(6~12세)", min: 0, max: 9 },
    { key: "infant", label: "유아", description: "(6세 미만)", min: 0, max: 9 },
    { key: "senior", label: "경로", description: "(65세 이상)", min: 0, max: 9 },
    { key: "severelydisabled", label: "중증 장애인", description: "", min: 0, max: 9 },
    { key: "mildlydisabled", label: "경증 장애인", description: "", min: 0, max: 9 },
    { key: "veteran", label: "국가 유공자", description: "", min: 0, max: 9 },
  ]

  const swapStations = () => {
    const temp = departureStation
    setDepartureStation(arrivalStation)
    setArrivalStation(temp)
  }

  const handleSearch = () => {
    if (!departureStation || !arrivalStation || !departureDate) {
      alert("출발역, 도착역, 출발일을 모두 선택해주세요.")
      return
    }

    // URL 파라미터 생성
    const searchParams = new URLSearchParams({
      departure: departureStation,
      arrival: arrivalStation,
      date: departureDate.toISOString().split("T")[0],
      passengers: getTotalPassengers().toString(),
      tripType,
      ...(departureTime && { time: departureTime }),
      ...(returnDate && { returnDate: returnDate.toISOString().split("T")[0] }),
    })

    // guest 파라미터가 있으면 추가
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("guest") === "true") {
      searchParams.set("guest", "true")
    }

    // 검색 결과 페이지로 이동
    router.push(`/ticket/search?${searchParams.toString()}`)
  }

  const updateTempPassengerCount = (type: keyof PassengerCounts, operation: "plus" | "minus") => {
    const passengerType = passengerTypes.find((p) => p.key === type)
    if (!passengerType) return

    setTempPassengerCounts((prev) => {
      const newCount =
        operation === "plus" ? Math.min(prev[type] + 1, passengerType.max) : Math.max(prev[type] - 1, passengerType.min)

      return {
        ...prev,
        [type]: newCount,
      }
    })
  }

  const openPassengerDialog = () => {
    setTempPassengerCounts(passengerCounts)
    setShowPassengerDialog(true)
  }

  const applyPassengerCounts = () => {
    setPassengerCounts(tempPassengerCounts)
    setShowPassengerDialog(false)
  }

  const cancelPassengerSelection = () => {
    setTempPassengerCounts(passengerCounts)
    setShowPassengerDialog(false)
  }

  const getTotalPassengers = () => {
    return Object.values(passengerCounts).reduce((sum, count) => sum + count, 0)
  }

  const getPassengerSummary = () => {
    const summary = []
    if (passengerCounts.adult > 0) summary.push(`어른 ${passengerCounts.adult}명`)
    if (passengerCounts.child > 0) summary.push(`어린이 ${passengerCounts.child}명`)
    if (passengerCounts.infant > 0) summary.push(`유아 ${passengerCounts.infant}명`)
    if (passengerCounts.senior > 0) summary.push(`경로 ${passengerCounts.senior}명`)
    if (passengerCounts.severelydisabled > 0) summary.push(`중증장애인 ${passengerCounts.severelydisabled}명`)
    if (passengerCounts.mildlydisabled > 0) summary.push(`경증장애인 ${passengerCounts.mildlydisabled}명`)
    if (passengerCounts.veteran > 0) summary.push(`국가유공자 ${passengerCounts.veteran}명`)

    return summary.length > 0 ? summary.join(", ") : "어른 1명"
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
                    <RadioGroupItem value="roundtrip" id="roundtrip" />
                    <Label htmlFor="roundtrip">왕복</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Stations */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-2">
                  <Label htmlFor="departure" className="text-sm font-medium mb-2 block">
                    출발역
                  </Label>
                  <Select value={departureStation} onValueChange={setDepartureStation}>
                    <SelectTrigger>
                      <SelectValue placeholder="출발역을 선택하세요" />
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

                <div className="flex justify-center">
                  <Button type="button" variant="outline" size="sm" onClick={swapStations} className="p-2">
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="arrival" className="text-sm font-medium mb-2 block">
                    도착역
                  </Label>
                  <Select value={arrivalStation} onValueChange={setArrivalStation}>
                    <SelectTrigger>
                      <SelectValue placeholder="도착역을 선택하세요" />
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

              {/* Dates and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">출발일</Label>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => setShowDepartureDateDialog(true)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {departureDate ? format(departureDate, "yyyy년 MM월 dd일", { locale: ko }) : "출발일을 선택하세요"}
                  </Button>
                </div>

                {tripType === "roundtrip" && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">도착일</Label>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      onClick={() => setShowReturnDateDialog(true)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {returnDate ? format(returnDate, "yyyy년 MM월 dd일", { locale: ko }) : "도착일을 선택하세요"}
                    </Button>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium mb-2 block">출발 시간</Label>
                  <Select value={departureTime} onValueChange={setDepartureTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="출발 시간대를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Passengers */}
              <div>
                <Label className="text-sm font-medium mb-2 block">인원</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={openPassengerDialog}
                  className="w-full justify-start text-left font-normal h-auto p-3"
                >
                  <Users className="mr-2 h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">총 {getTotalPassengers()}명</span>
                    <span className="text-xs text-gray-500">{getPassengerSummary()}</span>
                  </div>
                </Button>
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

      {/* Passenger Selection Dialog */}
      <Dialog open={showPassengerDialog} onOpenChange={setShowPassengerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>승객 정보 선택</DialogTitle>
            <DialogDescription>여행하실 승객의 인원수를 선택해주세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {passengerTypes.map((passengerType) => (
              <div key={passengerType.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex flex-col">
                  <span className="font-medium">{passengerType.label}</span>
                  {passengerType.description && (
                    <span className="text-sm text-gray-500">{passengerType.description}</span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateTempPassengerCount(passengerType.key as keyof PassengerCounts, "minus")}
                    disabled={tempPassengerCounts[passengerType.key as keyof PassengerCounts] <= passengerType.min}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold w-8 text-center">
                    {tempPassengerCounts[passengerType.key as keyof PassengerCounts]}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => updateTempPassengerCount(passengerType.key as keyof PassengerCounts, "plus")}
                    disabled={tempPassengerCounts[passengerType.key as keyof PassengerCounts] >= passengerType.max}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={cancelPassengerSelection} className="flex-1">
              취소
            </Button>
            <Button onClick={applyPassengerCounts} className="flex-1 bg-blue-600 hover:bg-blue-700">
              적용
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Departure Date Selection Dialog */}
      <Dialog open={showDepartureDateDialog} onOpenChange={setShowDepartureDateDialog}>
        <DialogContent className="sm:max-w-lg p-0 max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b">
            <DialogTitle className="text-xl font-bold">날짜 선택</DialogTitle>
          </div>

          <div className="p-4">
            {/* Selected Date Display */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
              <div className="text-xl font-bold text-blue-600">
                {tempDepartureDate
                  ? format(tempDepartureDate, "yyyy년 MM월 dd일(E)", { locale: ko })
                  : "날짜를 선택하세요"}
              </div>
              <div className="text-sm text-gray-600 mt-1">{selectedDepartureTime} 이후 출발</div>
            </div>

            {/* Calendar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <button
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => {
                    if (tempDepartureDate) {
                      const prevMonth = new Date(tempDepartureDate)
                      prevMonth.setMonth(prevMonth.getMonth() - 1)
                      setTempDepartureDate(prevMonth)
                    }
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-bold">
                  {tempDepartureDate ? format(tempDepartureDate, "yyyy. MM.", { locale: ko }) : ""}
                </h3>
                <button
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => {
                    if (tempDepartureDate) {
                      const nextMonth = new Date(tempDepartureDate)
                      nextMonth.setMonth(nextMonth.getMonth() + 1)
                      setTempDepartureDate(nextMonth)
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
                    value={
                      tempDepartureDate
                        ? tempDepartureDate.getFullYear().toString()
                        : new Date().getFullYear().toString()
                    }
                    onValueChange={(value) => {
                      if (tempDepartureDate) {
                        const newDate = new Date(tempDepartureDate)
                        newDate.setFullYear(Number.parseInt(value))
                        setTempDepartureDate(newDate)
                      } else {
                        const newDate = new Date()
                        newDate.setFullYear(Number.parseInt(value))
                        setTempDepartureDate(newDate)
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
                    value={
                      tempDepartureDate
                        ? (tempDepartureDate.getMonth() + 1).toString()
                        : (new Date().getMonth() + 1).toString()
                    }
                    onValueChange={(value) => {
                      if (tempDepartureDate) {
                        const newDate = new Date(tempDepartureDate)
                        newDate.setMonth(Number.parseInt(value) - 1)
                        setTempDepartureDate(newDate)
                      } else {
                        const newDate = new Date()
                        newDate.setMonth(Number.parseInt(value) - 1)
                        setTempDepartureDate(newDate)
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
                    value={tempDepartureDate ? tempDepartureDate.getDate().toString() : new Date().getDate().toString()}
                    onValueChange={(value) => {
                      if (tempDepartureDate) {
                        const newDate = new Date(tempDepartureDate)
                        newDate.setDate(Number.parseInt(value))
                        setTempDepartureDate(newDate)
                      } else {
                        const newDate = new Date()
                        newDate.setDate(Number.parseInt(value))
                        setTempDepartureDate(newDate)
                      }
                    }}
                  >
                    <SelectTrigger className="w-[80px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        {
                          length: tempDepartureDate
                            ? new Date(tempDepartureDate.getFullYear(), tempDepartureDate.getMonth() + 1, 0).getDate()
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
                    if (!tempDepartureDate) return null

                    const year = tempDepartureDate.getFullYear()
                    const month = tempDepartureDate.getMonth()
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
                      const isSelected =
                        tempDepartureDate && currentDate.toDateString() === tempDepartureDate.toDateString()
                      const isPast = currentDate < today
                      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6

                      days.push(
                        <button
                          key={i}
                          onClick={() => {
                            if (!isPast && isCurrentMonth) {
                              setTempDepartureDate(currentDate)
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
                    variant={selectedDepartureTime === time ? "default" : "outline"}
                    className={`text-xs py-2 px-3 ${selectedDepartureTime === time ? "bg-blue-600" : ""}`}
                    onClick={() => setSelectedDepartureTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex border-t p-4">
            <Button variant="outline" onClick={() => setShowDepartureDateDialog(false)} className="flex-1 mr-2">
              취소
            </Button>
            <Button
              onClick={() => {
                if (tempDepartureDate) {
                  setDepartureDate(tempDepartureDate)
                  setShowDepartureDateDialog(false)
                }
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              적용
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Return Date Selection Dialog */}
      <Dialog open={showReturnDateDialog} onOpenChange={setShowReturnDateDialog}>
        <DialogContent className="sm:max-w-lg p-0 max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b">
            <DialogTitle className="text-xl font-bold">날짜 선택</DialogTitle>
          </div>

          <div className="p-4">
            {/* Selected Date Display */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
              <div className="text-xl font-bold text-blue-600">
                {tempReturnDate ? format(tempReturnDate, "yyyy년 MM월 dd일(E)", { locale: ko }) : "날짜를 선택하세요"}
              </div>
              <div className="text-sm text-gray-600 mt-1">{selectedReturnTime} 이후 출발</div>
            </div>

            {/* Calendar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <button
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => {
                    if (tempReturnDate) {
                      const prevMonth = new Date(tempReturnDate)
                      prevMonth.setMonth(prevMonth.getMonth() - 1)
                      setTempReturnDate(prevMonth)
                    }
                  }}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-bold">
                  {tempReturnDate ? format(tempReturnDate, "yyyy. MM.", { locale: ko }) : ""}
                </h3>
                <button
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => {
                    if (tempReturnDate) {
                      const nextMonth = new Date(tempReturnDate)
                      nextMonth.setMonth(nextMonth.getMonth() + 1)
                      setTempReturnDate(nextMonth)
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
                    value={
                      tempReturnDate ? tempReturnDate.getFullYear().toString() : new Date().getFullYear().toString()
                    }
                    onValueChange={(value) => {
                      if (tempReturnDate) {
                        const newDate = new Date(tempReturnDate)
                        newDate.setFullYear(Number.parseInt(value))
                        setTempReturnDate(newDate)
                      } else {
                        const newDate = new Date()
                        newDate.setFullYear(Number.parseInt(value))
                        setTempReturnDate(newDate)
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
                    value={
                      tempReturnDate
                        ? (tempReturnDate.getMonth() + 1).toString()
                        : (new Date().getMonth() + 1).toString()
                    }
                    onValueChange={(value) => {
                      if (tempReturnDate) {
                        const newDate = new Date(tempReturnDate)
                        newDate.setMonth(Number.parseInt(value) - 1)
                        setTempReturnDate(newDate)
                      } else {
                        const newDate = new Date()
                        newDate.setMonth(Number.parseInt(value) - 1)
                        setTempReturnDate(newDate)
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
                    value={tempReturnDate ? tempReturnDate.getDate().toString() : new Date().getDate().toString()}
                    onValueChange={(value) => {
                      if (tempReturnDate) {
                        const newDate = new Date(tempReturnDate)
                        newDate.setDate(Number.parseInt(value))
                        setTempReturnDate(newDate)
                      } else {
                        const newDate = new Date()
                        newDate.setDate(Number.parseInt(value))
                        setTempReturnDate(newDate)
                      }
                    }}
                  >
                    <SelectTrigger className="w-[80px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        {
                          length: tempReturnDate
                            ? new Date(tempReturnDate.getFullYear(), tempReturnDate.getMonth() + 1, 0).getDate()
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
                    if (!tempReturnDate) return null

                    const year = tempReturnDate.getFullYear()
                    const month = tempReturnDate.getMonth()
                    const firstDay = new Date(year, month, 1)
                    const lastDay = new Date(year, month + 1, 0)
                    const startDate = new Date(firstDay)
                    startDate.setDate(startDate.getDate() - firstDay.getDay())

                    const days = []
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const minDate = departureDate || today

                    for (let i = 0; i < 42; i++) {
                      const currentDate = new Date(startDate)
                      currentDate.setDate(startDate.getDate() + i)

                      const isCurrentMonth = currentDate.getMonth() === month
                      const isToday = currentDate.getTime() === today.getTime()
                      const isSelected = tempReturnDate && currentDate.toDateString() === tempReturnDate.toDateString()
                      const isPast = currentDate < minDate
                      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6

                      days.push(
                        <button
                          key={i}
                          onClick={() => {
                            if (!isPast && isCurrentMonth) {
                              setTempReturnDate(currentDate)
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
                    variant={selectedReturnTime === time ? "default" : "outline"}
                    className={`text-xs py-2 px-3 ${selectedReturnTime === time ? "bg-blue-600" : ""}`}
                    onClick={() => setSelectedReturnTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex border-t p-4">
            <Button variant="outline" onClick={() => setShowReturnDateDialog(false)} className="flex-1 mr-2">
              취소
            </Button>
            <Button
              onClick={() => {
                if (tempReturnDate) {
                  setReturnDate(tempReturnDate)
                  setShowReturnDateDialog(false)
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
