"use client"

import Link from "next/link"

// 1. Update the imports to include Dialog components for passenger selection
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import {
  Train,
  ChevronLeft,
  Clock,
  MapPin,
  ArrowRight,
  Users,
  Zap,
  Plus,
  Minus,
  X,
  CreditCard,
  CalendarIcon,
  ChevronRight,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// 2. Add PassengerCounts interface
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

type SeatType = "generalSeat" | "reservedSeat" | "standingSeat"

interface SeatInfo {
  id: string
  row: number
  column: string
  isAvailable: boolean
  isSelected: boolean
  direction: "forward" | "backward"
  hasUsb: boolean
}

interface CarInfo {
  carNumber: number
  totalSeats: number
  availableSeats: number
  seatType: string
  seats: SeatInfo[]
}

// 3. Update the component to include passenger selection functionality and fix date selection
export default function TrainSearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [allTrains, setAllTrains] = useState<TrainInfo[]>([])
  const [displayedTrains, setDisplayedTrains] = useState<TrainInfo[]>([])
  const [filteredTrains, setFilteredTrains] = useState<TrainInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedTrain, setSelectedTrain] = useState<TrainInfo | null>(null)
  const [selectedSeatType, setSelectedSeatType] = useState<SeatType>("generalSeat")
  const [showBookingPanel, setShowBookingPanel] = useState(false)
  const trainsPerPage = 5

  // Date selection state
  const [date, setDate] = useState<Date | undefined>(() => {
    const dateParam = searchParams.get("date")
    if (dateParam) {
      return new Date(dateParam)
    }
    return new Date()
  })

  // 상태 추가 (useState 부분에 추가)
  const [showDateDialog, setShowDateDialog] = useState(false)
  const [selectedTime, setSelectedTime] = useState("00시")
  const [tempDate, setTempDate] = useState<Date | undefined>(date)

  // Passenger selection state
  const [showPassengerDialog, setShowPassengerDialog] = useState(false)
  const [passengerCounts, setPassengerCounts] = useState<PassengerCounts>({
    adult: 1,
    child: 0,
    infant: 0,
    senior: 0,
    severelydisabled: 0,
    mildlydisabled: 0,
    veteran: 0,
  })
  const [tempPassengerCounts, setTempPassengerCounts] = useState<PassengerCounts>({ ...passengerCounts })

  // Seat selection state
  const [showSeatSelection, setShowSeatSelection] = useState(false)
  const [selectedCar, setSelectedCar] = useState(1)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [carData, setCarData] = useState<CarInfo[]>([])

  // URL parameters
  const departureStation = searchParams.get("departure") || "서울"
  const arrivalStation = searchParams.get("arrival") || "부산"
  const departureDateParam = searchParams.get("date") || new Date().toISOString().split("T")[0]
  const passengersParam = searchParams.get("passengers") || "1"

  // Passenger types for selection dialog
  const passengerTypes = [
    { key: "adult", label: "어른", description: "(13세 이상)", min: 1, max: 9 },
    { key: "child", label: "어린이", description: "(6~12세)", min: 0, max: 9 },
    { key: "infant", label: "유아", description: "(6세 미만)", min: 0, max: 9 },
    { key: "senior", label: "경로", description: "(65세 이상)", min: 0, max: 9 },
    { key: "severelydisabled", label: "중증 장애인", description: "", min: 0, max: 9 },
    { key: "mildlydisabled", label: "경증 장애인", description: "", min: 0, max: 9 },
    { key: "veteran", label: "국가 유공자", description: "", min: 0, max: 9 },
  ]

  useEffect(() => {
    // Fetch train data (mock)
    const fetchTrains = async () => {
      setLoading(true)

      // Mock data - only KTX trains
      const mockTrains: TrainInfo[] = [
        {
          id: "1",
          trainType: "KTX",
          trainNumber: "101",
          departureTime: "06:00",
          arrivalTime: "08:42",
          duration: "2시간 42분",
          departureStation,
          arrivalStation,
          generalSeat: { available: true, price: 59800 },
          reservedSeat: { available: true, price: 96900 },
          standingSeat: { available: false, price: 0 },
        },
        {
          id: "2",
          trainType: "KTX",
          trainNumber: "103",
          departureTime: "06:30",
          arrivalTime: "09:12",
          duration: "2시간 42분",
          departureStation,
          arrivalStation,
          generalSeat: { available: true, price: 59800 },
          reservedSeat: { available: true, price: 96900 },
          standingSeat: { available: true, price: 53800 },
        },
        {
          id: "3",
          trainType: "KTX",
          trainNumber: "105",
          departureTime: "07:00",
          arrivalTime: "09:42",
          duration: "2시간 42분",
          departureStation,
          arrivalStation,
          generalSeat: { available: false, price: 59800 },
          reservedSeat: { available: true, price: 96900 },
          standingSeat: { available: true, price: 53800 },
        },
        {
          id: "4",
          trainType: "KTX",
          trainNumber: "107",
          departureTime: "08:30",
          arrivalTime: "11:12",
          duration: "2시간 42분",
          departureStation,
          arrivalStation,
          generalSeat: { available: true, price: 59800 },
          reservedSeat: { available: false, price: 96900 },
          standingSeat: { available: true, price: 53800 },
        },
        {
          id: "5",
          trainType: "KTX",
          trainNumber: "109",
          departureTime: "10:00",
          arrivalTime: "12:42",
          duration: "2시간 42분",
          departureStation,
          arrivalStation,
          generalSeat: { available: true, price: 59800 },
          reservedSeat: { available: true, price: 96900 },
          standingSeat: { available: false, price: 0 },
        },
        {
          id: "6",
          trainType: "KTX",
          trainNumber: "111",
          departureTime: "11:30",
          arrivalTime: "14:12",
          duration: "2시간 42분",
          departureStation,
          arrivalStation,
          generalSeat: { available: true, price: 59800 },
          reservedSeat: { available: true, price: 96900 },
          standingSeat: { available: true, price: 53800 },
        },
        {
          id: "7",
          trainType: "KTX",
          trainNumber: "113",
          departureTime: "12:00",
          arrivalTime: "14:42",
          duration: "2시간 42분",
          departureStation,
          arrivalStation,
          generalSeat: { available: true, price: 59800 },
          reservedSeat: { available: true, price: 96900 },
          standingSeat: { available: false, price: 0 },
        },
        {
          id: "8",
          trainType: "KTX",
          trainNumber: "115",
          departureTime: "13:30",
          arrivalTime: "16:12",
          duration: "2시간 42분",
          departureStation,
          arrivalStation,
          generalSeat: { available: true, price: 59800 },
          reservedSeat: { available: true, price: 96900 },
          standingSeat: { available: true, price: 53800 },
        },
      ]

      // Loading simulation
      setTimeout(() => {
        setAllTrains(mockTrains)
        setFilteredTrains(mockTrains)
        setLoading(false)
      }, 1000)
    }

    fetchTrains()
  }, [departureStation, arrivalStation, departureDateParam])

  // Update displayed trains based on pagination
  useEffect(() => {
    const startIndex = 0
    const endIndex = currentPage * trainsPerPage
    setDisplayedTrains(filteredTrains.slice(startIndex, endIndex))
  }, [filteredTrains, currentPage])

  // Passenger selection functions
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
    setTempPassengerCounts({ ...passengerCounts })
    setShowPassengerDialog(true)
  }

  const applyPassengerCounts = () => {
    setPassengerCounts({ ...tempPassengerCounts })
    setShowPassengerDialog(false)
  }

  const cancelPassengerSelection = () => {
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

  // Update search parameters
  const handleUpdateSearch = () => {
    if (!date) {
      alert("출발일을 선택해주세요.")
      return
    }

    // Create URL parameters
    const newSearchParams = new URLSearchParams({
      departure: departureStation,
      arrival: arrivalStation,
      date: format(date, "yyyy-MM-dd"),
      passengers: getTotalPassengers().toString(),
    })

    // Add guest parameter if it exists
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("guest") === "true") {
      newSearchParams.set("guest", "true")
    }

    // Navigate to search results page
    window.location.href = `/ticket/search?${newSearchParams.toString()}`
  }

  const getTrainTypeColor = (trainType: string) => {
    return "bg-blue-600 text-white" // Only KTX trains, so always blue
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString() + "원"
  }

  const getSeatTypeName = (seatType: SeatType) => {
    switch (seatType) {
      case "generalSeat":
        return "일반실"
      case "reservedSeat":
        return "특실"
      case "standingSeat":
        return "입석"
      default:
        return ""
    }
  }

  const handleSeatSelection = (train: TrainInfo, seatType: SeatType) => {
    const seatInfo = train[seatType]
    if (!seatInfo.available) {
      alert("선택하신 좌석은 매진되었습니다.")
      return
    }

    setSelectedTrain(train)
    setSelectedSeatType(seatType)
    setShowBookingPanel(true)
  }

  const handleLoadMore = () => {
    setLoadingMore(true)

    // Loading simulation
    setTimeout(() => {
      setCurrentPage((prev) => prev + 1)
      setLoadingMore(false)
    }, 500)
  }

  const handleBooking = () => {
    if (!selectedTrain) return

    // Check if guest user
    const urlParams = new URLSearchParams(window.location.search)
    const isGuest = urlParams.get("guest") === "true"

    if (isGuest) {
      // Navigate to guest booking page
      const guestBookingParams = new URLSearchParams({
        trainType: selectedTrain.trainType,
        trainNumber: selectedTrain.trainNumber,
        departure: departureStation,
        arrival: arrivalStation,
        date: date ? date.toISOString().split("T")[0] : departureDateParam,
        time: selectedTrain.departureTime,
        seatType: getSeatTypeName(selectedSeatType),
        price: selectedTrain[selectedSeatType].price.toString(),
      })
      router.push(`/ticket/guest-booking?${guestBookingParams.toString()}`)
    } else {
      // Navigate to regular reservation page
      router.push("/ticket/reservation")
    }
  }

  const closeBookingPanel = () => {
    setShowBookingPanel(false)
    setSelectedTrain(null)
  }

  const hasMoreTrains = displayedTrains.length < filteredTrains.length

  const handleSeatClick = (seatNumber: string) => {
    const maxSeats = getTotalPassengers()

    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        // Remove if already selected
        return prev.filter((seat) => seat !== seatNumber)
      } else {
        // Add new seat if not at max
        if (prev.length >= maxSeats) {
          alert(`최대 ${maxSeats}개의 좌석만 선택할 수 있습니다.`)
          return prev
        }
        return [...prev, seatNumber]
      }
    })
  }

  const handleSeatSelectionApply = () => {
    const requiredSeats = getTotalPassengers()

    if (selectedSeats.length !== requiredSeats) {
      alert(`${requiredSeats}개의 좌석을 선택해주세요.`)
      return
    }

    setShowSeatSelection(false)
    // Store selected seats or process them
    console.log("선택된 좌석:", selectedSeats)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <header className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Train className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-600">RAIL-O</h1>
              </Link>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">열차 정보를 검색하고 있습니다...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Train className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-600">RAIL-O</h1>
              </Link>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Link href="/" className="hover:text-blue-600">
                  홈
                </Link>
                <span>{">"}</span>
                <Link href="/ticket/booking" className="hover:text-blue-600">
                  승차권예매
                </Link>
                <span>{">"}</span>
                <span className="text-blue-600">열차조회</span>
              </div>
            </div>
            <Link href="/ticket/booking">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ChevronLeft className="h-4 w-4" />
                <span>다시 검색</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-32">
        <div className="max-w-6xl mx-auto">
          {/* Search Summary */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <span className="text-lg font-semibold">{departureStation}</span>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span className="text-lg font-semibold">{arrivalStation}</span>
                  </div>

                  <Separator orientation="vertical" className="hidden md:block h-6" />

                  {/* Date Selection */}
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal w-[240px]"
                      onClick={() => setShowDateDialog(true)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "yyyy년 MM월 dd일 (E)", { locale: ko }) : "출발일을 선택하세요"}
                    </Button>
                  </div>

                  <Separator orientation="vertical" className="hidden md:block h-6" />

                  {/* Passenger Selection */}
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <Button
                      variant="outline"
                      onClick={openPassengerDialog}
                      className="justify-start text-left font-normal"
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">총 {getTotalPassengers()}명</span>
                        <span className="text-xs text-gray-500">{getPassengerSummary()}</span>
                      </div>
                    </Button>
                  </div>
                </div>

                <Button onClick={handleUpdateSearch} variant="outline">
                  검색 조건 적용
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Train Type Filter */}
          {/* <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">열차 종류:</span>
                <div className="flex flex-wrap gap-2">
                  {trainFilters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilter(filter)}
                      className={getFilterButtonStyle(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Train List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                검색 결과 ({filteredTrains.length}개)
                {/* {selectedFilter !== "전체" && (
                  <span className="text-base font-normal text-gray-600 ml-2">- {selectedFilter} 필터 적용</span>
                )} */}
              </h2>
              <div className="text-sm text-gray-600">* 요금은 어른 기준이며, 할인 혜택이 적용될 수 있습니다.</div>
            </div>

            {displayedTrains.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Train className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
                  <p className="text-gray-600 mb-4">선택하신 조건에 맞는 열차가 없습니다.</p>
                  <Button onClick={() => router.push("/ticket/booking")} variant="outline">
                    다시 검색하기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {displayedTrains.map((train) => (
                  <Card
                    key={train.id}
                    className={`hover:shadow-lg transition-shadow ${
                      selectedTrain?.id === train.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        {/* Train Info */}
                        <div className="lg:col-span-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge className={`${getTrainTypeColor(train.trainType)} px-3 py-1`}>
                              {train.trainType}
                            </Badge>
                            <span className="font-semibold text-lg">{train.trainNumber}</span>
                            <Zap className="h-4 w-4 text-yellow-500" />
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{train.departureStation}</span>
                            <ArrowRight className="h-4 w-4" />
                            <span>{train.arrivalStation}</span>
                          </div>
                        </div>

                        {/* Time Info */}
                        <div className="lg:col-span-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-2xl font-bold text-blue-600">{train.departureTime}</span>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                            <span className="text-2xl font-bold text-blue-600">{train.arrivalTime}</span>
                          </div>
                          <div className="text-sm text-gray-600">{train.duration}</div>
                        </div>

                        {/* Seat Options */}
                        <div className="lg:col-span-5">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {/* 일반실 */}
                            <div className="border rounded-lg p-3">
                              <div className="text-sm font-medium mb-1">일반실</div>
                              <div className="text-lg font-bold text-blue-600 mb-2">
                                {formatPrice(train.generalSeat.price)}
                              </div>
                              <Button
                                size="sm"
                                className="w-full"
                                disabled={!train.generalSeat.available}
                                onClick={() => handleSeatSelection(train, "generalSeat")}
                              >
                                {train.generalSeat.available ? "선택" : "매진"}
                              </Button>
                            </div>

                            {/* 특실 */}
                            <div className="border rounded-lg p-3">
                              <div className="text-sm font-medium mb-1">특실</div>
                              <div className="text-lg font-bold text-blue-600 mb-2">
                                {formatPrice(train.reservedSeat.price)}
                              </div>
                              <Button
                                size="sm"
                                className="w-full"
                                disabled={!train.reservedSeat.available}
                                onClick={() => handleSeatSelection(train, "reservedSeat")}
                              >
                                {train.reservedSeat.available ? "선택" : "매진"}
                              </Button>
                            </div>

                            {/* 입석 */}
                            <div className="border rounded-lg p-3">
                              <div className="text-sm font-medium mb-1">입석</div>
                              <div className="text-lg font-bold text-blue-600 mb-2">
                                {train.standingSeat.available ? formatPrice(train.standingSeat.price) : "-"}
                              </div>
                              <Button
                                size="sm"
                                className="w-full"
                                variant="outline"
                                disabled={!train.standingSeat.available}
                                onClick={() => handleSeatSelection(train, "standingSeat")}
                              >
                                {train.standingSeat.available ? "선택" : "없음"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Load More Button */}
                {hasMoreTrains && (
                  <div className="text-center py-6">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      variant="outline"
                      size="lg"
                      className="px-8"
                    >
                      {loadingMore ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          로딩 중...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          더보기 ({filteredTrains.length - displayedTrains.length}개 더)
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Additional Info */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">이용 안내</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>• 표시된 요금은 어른 기준이며, 어린이·경로·장애인 할인이 적용될 수 있습니다.</p>
              <p>• 승차권 구입 후 출발시간 20분 전까지 취소 가능합니다.</p>
              <p>• KTX는 전 좌석 지정석입니다.</p>
              <p>• 입석은 좌석이 매진된 경우에만 판매됩니다.</p>
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
                  setDate(tempDate)
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

      {/* Booking Panel - Bottom Sidebar */}
      {showBookingPanel && selectedTrain && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeBookingPanel} />

          {/* Bottom Panel */}
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="container mx-auto px-4 py-6 max-w-6xl">
              {/* Panel Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Badge className={`${getTrainTypeColor(selectedTrain.trainType)} px-3 py-1`}>
                    {selectedTrain.trainType}
                  </Badge>
                  <span className="text-xl font-bold">{selectedTrain.trainNumber}</span>
                  <span className="text-gray-600">열차 예매</span>
                </div>
                <Button variant="ghost" size="sm" onClick={closeBookingPanel}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Train Schedule */}
                <div className="lg:col-span-1">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    열차 시각
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">출발</span>
                      <span className="font-semibold">{selectedTrain.departureTime}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">도착</span>
                      <span className="font-semibold">{selectedTrain.arrivalTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">소요시간</span>
                      <span className="font-semibold">{selectedTrain.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Fare Information */}
                <div className="lg:col-span-1">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    운임 요금
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">{getSeatTypeName(selectedSeatType)}</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {formatPrice(selectedTrain[selectedSeatType].price * getTotalPassengers())}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{getPassengerSummary()}</div>
                    </div>
                  </div>
                </div>

                {/* Seat Selection */}
                <div className="lg:col-span-1">
                  <h3 className="font-semibold text-gray-900 mb-3">좌석 선택</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">선택된 좌석</div>
                      <div className="text-lg font-semibold">{getSeatTypeName(selectedSeatType)}</div>
                      <div className="text-sm text-gray-500">좌석을 선택해주세요</div>
                    </div>
                    <Button onClick={() => setShowSeatSelection(true)} variant="outline" className="w-full">
                      좌석 선택
                    </Button>
                  </div>
                </div>

                {/* Booking Button */}
                <div className="lg:col-span-1">
                  <h3 className="font-semibold text-gray-900 mb-3">예매하기</h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">총 결제 금액</div>
                      <div className="text-xl font-bold text-blue-600">
                        {formatPrice(selectedTrain[selectedSeatType].price * getTotalPassengers())}
                      </div>
                    </div>
                    <Button
                      onClick={handleBooking}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                      size="lg"
                    >
                      예매하기
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Seat Selection Dialog - Improved Train Layout */}
      {showSeatSelection && selectedTrain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b bg-white">
              <h2 className="text-xl font-bold">
                좌석선택({selectedTrain.trainType}, {selectedTrain.trainNumber})
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowSeatSelection(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Car Selection */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-center">
                <Select
                  value={selectedCar.toString()}
                  onValueChange={(value) => setSelectedCar(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((car) => (
                      <SelectItem key={car} value={car.toString()}>
                        {car}호차 (36석) {getSeatTypeName(selectedSeatType)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Seat Legend */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center justify-end space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 border border-blue-300 rounded flex items-center justify-center">
                    <span className="text-xs">↑</span>
                  </div>
                  <span>순방향</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-200 border border-gray-300 rounded flex items-center justify-center">
                    <span className="text-xs">↓</span>
                  </div>
                  <span>역방향</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-600 border border-blue-700 rounded"></div>
                  <span>선택</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-200 border border-yellow-400 rounded flex items-center justify-center">
                    <span className="text-xs">⚡</span>
                  </div>
                  <span>콘센트 USB</span>
                </div>
              </div>
            </div>

            {/* Train Seat Map */}
            <div className="p-6 overflow-auto max-h-[60vh]">
              <div className="border-2 border-blue-300 rounded-lg p-6 bg-blue-50 min-w-[800px]">
                {/* Direction Indicator */}
                <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
                  <span className="font-semibold">대구</span>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 20 }, (_, i) => (
                      <span key={i} className="text-blue-400">
                        →
                      </span>
                    ))}
                  </div>
                  <span className="font-semibold">서울</span>
                </div>

                {/* Train Layout */}
                <div className="flex items-center justify-center">
                  <div className="flex items-center space-x-4">
                    {/* Left Restrooms */}
                    <div className="flex flex-col space-y-2">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center border">
                        <span className="text-xs">🚻</span>
                      </div>
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center border">
                        <span className="text-xs">🚻</span>
                      </div>
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center border">
                        <span className="text-xs">🚻</span>
                      </div>
                    </div>

                    {/* Seat Grid */}
                    <div className="grid grid-rows-4 grid-flow-col gap-2">
                      {/* Row D (Window) */}
                      {Array.from({ length: 16 }, (_, i) => {
                        const seatNumber = `${i + 1}D`
                        const isOccupied = Math.random() > 0.7
                        const isSelected = selectedSeats.includes(seatNumber)
                        const hasUsb = i % 4 === 0

                        return (
                          <button
                            key={seatNumber}
                            onClick={() => !isOccupied && handleSeatClick(seatNumber)}
                            disabled={isOccupied}
                            className={`
                              w-12 h-12 text-xs font-medium rounded border-2 transition-all duration-200 hover:scale-105
                              ${
                                isSelected
                                  ? "bg-blue-600 text-white border-blue-700 shadow-lg"
                                  : isOccupied
                                    ? "bg-gray-400 text-white border-gray-500 cursor-not-allowed"
                                    : hasUsb
                                      ? "bg-yellow-100 border-yellow-300 hover:bg-yellow-200 text-gray-800"
                                      : "bg-blue-100 border-blue-300 hover:bg-blue-200 text-gray-800"
                              }
                            `}
                          >
                            {seatNumber}
                          </button>
                        )
                      })}

                      {/* Row C */}
                      {Array.from({ length: 16 }, (_, i) => {
                        const seatNumber = `${i + 1}C`
                        const isOccupied = Math.random() > 0.7
                        const isSelected = selectedSeats.includes(seatNumber)
                        const hasUsb = i % 4 === 0

                        return (
                          <button
                            key={seatNumber}
                            onClick={() => !isOccupied && handleSeatClick(seatNumber)}
                            disabled={isOccupied}
                            className={`
                              w-12 h-12 text-xs font-medium rounded border-2 transition-all duration-200 hover:scale-105
                              ${
                                isSelected
                                  ? "bg-blue-600 text-white border-blue-700 shadow-lg"
                                  : isOccupied
                                    ? "bg-gray-400 text-white border-gray-500 cursor-not-allowed"
                                    : hasUsb
                                      ? "bg-yellow-100 border-yellow-300 hover:bg-yellow-200 text-gray-800"
                                      : "bg-blue-100 border-blue-300 hover:bg-blue-200 text-gray-800"
                              }
                            `}
                          >
                            {seatNumber}
                          </button>
                        )
                      })}

                      {/* Aisle space */}
                      <div className="h-4"></div>

                      {/* Row B */}
                      {Array.from({ length: 16 }, (_, i) => {
                        const seatNumber = `${i + 1}B`
                        const isOccupied = Math.random() > 0.7
                        const isSelected = selectedSeats.includes(seatNumber)
                        const hasUsb = i % 4 === 0

                        return (
                          <button
                            key={seatNumber}
                            onClick={() => !isOccupied && handleSeatClick(seatNumber)}
                            disabled={isOccupied}
                            className={`
                              w-12 h-12 text-xs font-medium rounded border-2 transition-all duration-200 hover:scale-105
                              ${
                                isSelected
                                  ? "bg-blue-600 text-white border-blue-700 shadow-lg"
                                  : isOccupied
                                    ? "bg-gray-400 text-white border-gray-500 cursor-not-allowed"
                                    : hasUsb
                                      ? "bg-yellow-100 border-yellow-300 hover:bg-yellow-200 text-gray-800"
                                      : "bg-blue-100 border-blue-300 hover:bg-blue-200 text-gray-800"
                              }
                            `}
                          >
                            {seatNumber}
                          </button>
                        )
                      })}

                      {/* Row A (Window) */}
                      {Array.from({ length: 16 }, (_, i) => {
                        const seatNumber = `${i + 1}A`
                        const isOccupied = Math.random() > 0.7
                        const isSelected = selectedSeats.includes(seatNumber)
                        const hasUsb = i % 4 === 0

                        return (
                          <button
                            key={seatNumber}
                            onClick={() => !isOccupied && handleSeatClick(seatNumber)}
                            disabled={isOccupied}
                            className={`
                              w-12 h-12 text-xs font-medium rounded border-2 transition-all duration-200 hover:scale-105
                              ${
                                isSelected
                                  ? "bg-blue-600 text-white border-blue-700 shadow-lg"
                                  : isOccupied
                                    ? "bg-gray-400 text-white border-gray-500 cursor-not-allowed"
                                    : hasUsb
                                      ? "bg-yellow-100 border-yellow-300 hover:bg-yellow-200 text-gray-800"
                                      : "bg-blue-100 border-blue-300 hover:bg-blue-200 text-gray-800"
                              }
                            `}
                          >
                            {seatNumber}
                          </button>
                        )
                      })}
                    </div>

                    {/* Right Restrooms */}
                    <div className="flex flex-col space-y-2">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center border">
                        <span className="text-xs">🚻</span>
                      </div>
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center border">
                        <span className="text-xs">🚻</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  선택된 좌석: {selectedSeats.length > 0 ? selectedSeats.join(", ") : "없음"}
                </div>
                <Button
                  onClick={handleSeatSelectionApply}
                  disabled={selectedSeats.length !== getTotalPassengers()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  선택적용({selectedSeats.length}명 좌석 선택/총 {getTotalPassengers()}명)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
