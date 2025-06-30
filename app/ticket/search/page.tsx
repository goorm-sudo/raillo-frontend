"use client"

import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { searchTrains, stationUtils, makeReservation } from "@/lib/api/train"
import { SeatSelectionDialog } from "@/components/ui/seat-selection-dialog"
import { BookingPanel } from "@/components/ui/booking-panel"
import { SearchForm } from "@/components/ui/search-form"
import { TrainList } from "@/components/ui/train-list"
import { UsageInfo } from "@/components/ui/usage-info"
import { tokenManager } from "@/lib/auth"

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

type SeatType = "generalSeat" | "reservedSeat" | "standingSeat"

// 3. Update the component to include passenger selection functionality and fix date selection
export default function TrainSearchPage() {
  const router = useRouter()
  const [allTrains, setAllTrains] = useState<TrainInfo[]>([])
  const [displayedTrains, setDisplayedTrains] = useState<TrainInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [selectedTrain, setSelectedTrain] = useState<TrainInfo | null>(null)
  const [selectedSeatType, setSelectedSeatType] = useState<SeatType>("generalSeat")
  const [showBookingPanel, setShowBookingPanel] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [searchConditionsChanged, setSearchConditionsChanged] = useState(false)

  // 검색 조건 상태
  const [searchData, setSearchData] = useState<{
    departureStation: string
    arrivalStation: string
    departureDate: string
    departureHour: string
    passengers: PassengerCounts
  } | null>(null)

  // Date selection state
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Passenger selection state
  const [passengerCounts, setPassengerCounts] = useState<PassengerCounts>({
    adult: 1,
    child: 0,
    infant: 0,
    senior: 0,
    severelydisabled: 0,
    mildlydisabled: 0,
    veteran: 0,
  })

  // Seat selection state
  const [showSeatSelection, setShowSeatSelection] = useState(false)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [selectedCar, setSelectedCar] = useState(1)

  // URL parameters (fallback)
  const [departureStation, setDepartureStation] = useState("")
  const [arrivalStation, setArrivalStation] = useState("")
  const [departureDateParam, setDepartureDateParam] = useState(new Date().toISOString().split("T")[0])

  // 실제 API 호출 함수
  const fetchTrainsFromAPI = async (searchData: any) => {
    setLoading(true)
    
    try {
      // 총 승객 수 계산
      const totalPassengers = Object.values(searchData.passengers).reduce((sum: number, count: any) => sum + (count as number), 0)

      // API 요청 파라미터 준비
      const departureStationId = stationUtils.getStationId(searchData.departureStation)
      const arrivalStationId = stationUtils.getStationId(searchData.arrivalStation)

      if (!departureStationId || !arrivalStationId) {
        alert("역 정보를 찾을 수 없습니다.")
        setLoading(false)
        return
      }

      const searchRequest = {
        departureStationId,
        arrivalStationId,
        operationDate: searchData.departureDate,
        passengerCount: totalPassengers,
        departureHour: searchData.departureHour.replace("시", "")
      }

      // 열차 조회 API 호출
      const response = await searchTrains(searchRequest, 0, 10)
      
      if (response.result) {
        // 새로운 API 응답 구조 처리
        const content = response.result.content || response.result
        const resultArray = Array.isArray(content) ? content : [content]
        
        const apiTrains: TrainInfo[] = resultArray.map((train: any, index: number) => ({
          trainScheduleId: train.trainScheduleId,
          id: `${train.trainNumber || train.id || index}_${train.departureTime || index}_${index}`,
          trainType: train.trainName || train.trainType || "KTX",
          trainNumber: train.trainNumber || `${index + 1}`,
          departureTime: train.departureTime ? train.departureTime.substring(0, 5) : "00:00",
          arrivalTime: train.arrivalTime ? train.arrivalTime.substring(0, 5) : "00:00",
          duration: train.formattedTravelTime || train.travelTime || "0시간 0분",
          departureStation: train.departureStationName || train.departureStation || searchData.departureStation,
          arrivalStation: train.arrivalStationName || train.arrivalStation || searchData.arrivalStation,
          generalSeat: { 
            available: train.standardSeat?.canReserve === true, 
            price: train.standardSeat?.fare || 8400 
          },
          reservedSeat: { 
            available: train.firstClassSeat?.canReserve === true, 
            price: train.firstClassSeat?.fare || 13200 
          },
          standingSeat: { 
            available: train.standing?.canReserve === true, 
            price: train.standing?.fare || 0 
          },
        }))
        
        // 페이지네이션 정보 처리
        const totalElements = response.result.totalElements || apiTrains.length
        const totalPages = response.result.totalPages || 1
        const hasNext = response.result.hasNext ?? false
        
        setAllTrains(apiTrains)
        setDisplayedTrains(apiTrains) // 모든 데이터를 먼저 보여줌
        setTotalResults(totalElements)
        setCurrentPage(0) // 페이지 0으로 초기화
        setHasNext(hasNext)
      } else {
        console.error("열차 조회 실패:", response.message)
        // 실패 시 빈 결과로 설정 (alert 제거)
        setAllTrains([])
        setDisplayedTrains([])
        setTotalResults(0)
        setHasNext(false)
      }
    } catch (error) {
      console.error("열차 조회 중 오류 발생:", error)
      
      // 오류 시 빈 결과로 설정 (alert 제거)
      setAllTrains([])
      setDisplayedTrains([])
      setTotalResults(0)
      setHasNext(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // localStorage에서 검색 조건 읽기
    const storedSearchData = localStorage.getItem('searchData')
    if (storedSearchData) {
      try {
        const parsedData = JSON.parse(storedSearchData)
        setSearchData(parsedData)
        setPassengerCounts(parsedData.passengers)
        
        // 날짜와 시간 정보 설정
        const dateWithTime = new Date(parsedData.departureDate)
        if (parsedData.departureHour) {
          dateWithTime.setHours(parseInt(parsedData.departureHour), 0, 0, 0)
        }
        setDate(dateWithTime)
        
        setDepartureStation(parsedData.departureStation)
        setArrivalStation(parsedData.arrivalStation)
        setSearchConditionsChanged(false)
        
        // 실제 API 호출
        fetchTrainsFromAPI(parsedData)
      } catch (error) {
        console.error('검색 데이터 파싱 오류:', error)
        // fallback으로 빈 결과 설정
        setAllTrains([])
        setDisplayedTrains([])
        setTotalResults(0)
        setLoading(false)
      }
    } else {
      // localStorage에 데이터가 없으면 기본값 설정
      setDepartureStation("서울")
      setArrivalStation("부산")
      setAllTrains([])
      setDisplayedTrains([])
      setTotalResults(0)
      setLoading(false)
    }
  }, [])

  // Update search parameters
  const handleUpdateSearch = () => {
    if (!date) {
      alert("출발일을 선택해주세요.")
      return
    }

    // 새로운 검색 조건 생성
    const newSearchData = {
      departureStation: departureStation,
      arrivalStation: arrivalStation,
      departureDate: format(date, "yyyy-MM-dd"),
      departureHour: searchData?.departureHour || date.getHours().toString().padStart(2, '0'),
      passengers: passengerCounts
    }

    // localStorage에 새로운 검색 조건 저장
    localStorage.setItem('searchData', JSON.stringify(newSearchData))
    
    // 검색 조건 상태 업데이트
    setSearchData(newSearchData)
    setSearchConditionsChanged(false)
    
    // 페이지 초기화
    setCurrentPage(0)
    
    // 새로운 조건으로 API 호출
    fetchTrainsFromAPI(newSearchData)
  }

  // 날짜 변경 시 검색 조건 업데이트 (즉시 검색하지 않음)
  const handleDateChange = (newDate: Date) => {
    setDate(newDate)
    setSearchConditionsChanged(true)
    
    // 현재 검색 조건이 있으면 업데이트만 하고 검색은 하지 않음
    if (searchData) {
      const updatedSearchData = {
        ...searchData,
        departureDate: format(newDate, "yyyy-MM-dd"),
        departureHour: newDate.getHours().toString().padStart(2, '0')
      }
      setSearchData(updatedSearchData)
      localStorage.setItem('searchData', JSON.stringify(updatedSearchData))
    }
  }

  // 승객 수 변경 시 검색 조건 업데이트 (즉시 검색하지 않음)
  const handlePassengerChange = (newPassengerCounts: PassengerCounts) => {
    setPassengerCounts(newPassengerCounts)
    setSearchConditionsChanged(true)
    
    // 현재 검색 조건이 있으면 업데이트만 하고 검색은 하지 않음
    if (searchData) {
      const updatedSearchData = {
        ...searchData,
        passengers: newPassengerCounts
      }
      setSearchData(updatedSearchData)
      localStorage.setItem('searchData', JSON.stringify(updatedSearchData))
    }
  }

  // 출발역 변경 핸들러
  const handleDepartureStationChange = (station: string) => {
    if (station === (searchData?.arrivalStation || arrivalStation)) {
      // 출발역과 도착역이 같으면 자동으로 바꾸기
      setArrivalStation(searchData?.departureStation || departureStation)
      setDepartureStation(station)
      
      // searchData도 업데이트
      if (searchData) {
        const updatedSearchData = {
          ...searchData,
          departureStation: station,
          arrivalStation: searchData.departureStation
        }
        setSearchData(updatedSearchData)
        localStorage.setItem('searchData', JSON.stringify(updatedSearchData))
      }
    } else {
      setDepartureStation(station)
      
      // searchData도 업데이트
      if (searchData) {
        const updatedSearchData = {
          ...searchData,
          departureStation: station
        }
        setSearchData(updatedSearchData)
        localStorage.setItem('searchData', JSON.stringify(updatedSearchData))
      }
    }
    setSearchConditionsChanged(true)
  }

  // 도착역 변경 핸들러
  const handleArrivalStationChange = (station: string) => {
    if (station === (searchData?.departureStation || departureStation)) {
      // 출발역과 도착역이 같으면 자동으로 바꾸기
      setDepartureStation(searchData?.arrivalStation || arrivalStation)
      setArrivalStation(station)
      
      // searchData도 업데이트
      if (searchData) {
        const updatedSearchData = {
          ...searchData,
          arrivalStation: station,
          departureStation: searchData.arrivalStation
        }
        setSearchData(updatedSearchData)
        localStorage.setItem('searchData', JSON.stringify(updatedSearchData))
      }
    } else {
      setArrivalStation(station)
      
      // searchData도 업데이트
      if (searchData) {
        const updatedSearchData = {
          ...searchData,
          arrivalStation: station
        }
        setSearchData(updatedSearchData)
        localStorage.setItem('searchData', JSON.stringify(updatedSearchData))
      }
    }
    setSearchConditionsChanged(true)
  }

  const getTrainTypeColor = (trainType: string) => {
    return "bg-blue-600 text-white" // Only KTX trains, so always blue
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString() + "원"
  }

  const getSeatTypeName = (seatType: string) => {
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
    setShowBookingPanel(true) // 예매 패널 먼저 열기
  }

  const handleLoadMore = async () => {
    if (!searchData) return
    
    setLoadingMore(true)

    try {
      const nextPage = currentPage + 1
      const departureStationId = stationUtils.getStationId(searchData.departureStation)
      const arrivalStationId = stationUtils.getStationId(searchData.arrivalStation)
      
      if (!departureStationId || !arrivalStationId) {
        console.error("역 정보를 찾을 수 없습니다.")
        setLoadingMore(false)
        return
      }
      
      const searchRequest = {
        departureStationId,
        arrivalStationId,
        operationDate: searchData.departureDate,
        passengerCount: Object.values(searchData.passengers).reduce((sum: number, count: any) => sum + (count as number), 0),
        departureHour: searchData.departureHour.replace("시", "")
      }

      const response = await searchTrains(searchRequest, nextPage, 10)
      
      if (response.result) {
        const content = response.result.content || response.result
        const resultArray = Array.isArray(content) ? content : [content]
        
        const newTrains: TrainInfo[] = resultArray.map((train: any, index: number) => ({
          trainScheduleId: train.trainScheduleId,
          id: `${train.trainNumber || train.id || index}_${train.departureTime || index}_${index}_${nextPage}`,
          trainType: train.trainName || train.trainType || "KTX",
          trainNumber: train.trainNumber || `${index + 1}`,
          departureTime: train.departureTime ? train.departureTime.substring(0, 5) : "00:00",
          arrivalTime: train.arrivalTime ? train.arrivalTime.substring(0, 5) : "00:00",
          duration: train.formattedTravelTime || train.travelTime || "0시간 0분",
          departureStation: train.departureStationName || train.departureStation || searchData.departureStation,
          arrivalStation: train.arrivalStationName || train.arrivalStation || searchData.arrivalStation,
          generalSeat: { 
            available: train.standardSeat?.canReserve === true, 
            price: train.standardSeat?.fare || 8400 
          },
          reservedSeat: { 
            available: train.firstClassSeat?.canReserve === true, 
            price: train.firstClassSeat?.fare || 13200 
          },
          standingSeat: { 
            available: train.standing?.canReserve === true, 
            price: train.standing?.fare || 0 
          },
        }))

        // 기존 데이터에 새 데이터 추가
        setAllTrains(prev => [...prev, ...newTrains])
        setDisplayedTrains(prev => [...prev, ...newTrains])
        setCurrentPage(nextPage)
        setHasNext(response.result.hasNext ?? false)
        if (newTrains.length === 0) {
          setTotalResults(displayedTrains.length)
        }
      }
    } catch (error) {
      console.error("더보기 로딩 중 오류 발생:", error)
      setHasNext(false)
    } finally {
      setLoadingMore(false)
    }
  }

  // 예약용 passengerSummary 생성 함수
  const getPassengerSummaryForReservation = () => ({
    adult: passengerCounts.adult,
    child: passengerCounts.child,
    senior: passengerCounts.senior,
  })

  const handleBooking = async () => {
    if (!selectedTrain) return

    // 로그인 상태 확인
    if (!tokenManager.isAuthenticated()) {
      // 현재 경로를 redirectTo로 전달
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/ticket/search'
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`)
      return
    }

    // 역 id 추출
    const departureStationId = stationUtils.getStationId(departureStation)
    const arrivalStationId = stationUtils.getStationId(arrivalStation)

    if (!departureStationId || !arrivalStationId) {
      alert("역 정보를 찾을 수 없습니다.")
      return
    }

    // passengerSummary 생성
    const passengerSummary = getPassengerSummaryForReservation()

    // 예약 요청 데이터
    const reservationRequest = {
      trainScheduleId: selectedTrain.trainScheduleId!,
      seatId: 1, // 고정
      departureStationId,
      arrivalStationId,
      passengerSummary,
      tripType: 'OW' as const,
    }

    try {
      const response = await makeReservation(reservationRequest)
      if (response.result) {
        // 예약 정보로 채울 수 있는 값만 세션에 저장
        const reservationInfo = {
          trainType: selectedTrain.trainType,
          trainNumber: selectedTrain.trainNumber,
          date: date ? date.toISOString().split('T')[0] : '',
          departureStation: departureStation,
          arrivalStation: arrivalStation,
          departureTime: selectedTrain.departureTime,
          arrivalTime: selectedTrain.arrivalTime,
          seatClass: getSeatTypeName(selectedSeatType),
          carNumber: selectedCar,
          seats: selectedSeats, // 전체 좌석 배열 추가
          price: selectedTrain[selectedSeatType].price * selectedSeats.length,
          // paymentDeadline, reservationNumber 등은 백엔드 응답에 따라 추후 추가
        }
        sessionStorage.setItem('reservationInfo', JSON.stringify(reservationInfo))
        router.push(`/ticket/reservation`)
      } else {
        alert("예약에 실패했습니다.")
      }
    } catch (e) {
      alert("예약 요청 중 오류가 발생했습니다.")
    }
  }

  const closeBookingPanel = () => {
    setShowBookingPanel(false)
    setSelectedTrain(null)
    setSelectedSeats([]) // 좌석 선택 초기화
    setSelectedCar(1) // 호차 선택 초기화
  }

  const handleSeatClick = (seatNumber: string) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        // 이미 선택된 좌석을 클릭한 경우 - 단순히 제거
        return prev.filter((seat) => seat !== seatNumber)
      } else {
        // 새로운 좌석을 선택하는 경우
        return [...prev, seatNumber]
      }
    })
  }

  const handleSeatSelectionApply = (seats: string[], car: number) => {
    const requiredSeats = getTotalPassengers()
    
    if (seats.length !== requiredSeats) {
      alert(`${requiredSeats}개의 좌석을 선택해주세요.`)
      return
    }
    
    setSelectedSeats(seats)
    setSelectedCar(car)
    setShowSeatSelection(false)
    setShowBookingPanel(true) // 예매 패널 다시 열기
  }

  const getTotalPassengers = () => {
    return Object.values(passengerCounts).reduce((sum, count) => sum + count, 0)
  }

  const [hasNext, setHasNext] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">열차 정보를 검색하고 있습니다...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <main className="container mx-auto px-4 py-8 pb-32">
        <div className="max-w-6xl mx-auto">
          {/* Search Form */}
          <SearchForm
            searchData={searchData}
            departureStation={departureStation}
            arrivalStation={arrivalStation}
            date={date}
            passengerCounts={passengerCounts}
            searchConditionsChanged={searchConditionsChanged}
            onDepartureStationChange={handleDepartureStationChange}
            onArrivalStationChange={handleArrivalStationChange}
            onDateChange={handleDateChange}
            onPassengerChange={handlePassengerChange}
            onSearch={handleUpdateSearch}
          />

          {/* Train List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                검색 결과
              </h2>
              <div className="text-sm text-gray-600">* 요금은 어른 기준이며, 할인 혜택이 적용될 수 있습니다.</div>
            </div>

            <TrainList
              displayedTrains={displayedTrains}
              totalResults={totalResults}
              selectedTrain={selectedTrain}
              loadingMore={loadingMore}
              hasMoreTrains={hasNext}
              onSeatSelection={handleSeatSelection}
              onLoadMore={handleLoadMore}
              getTrainTypeColor={getTrainTypeColor}
              formatPrice={formatPrice}
              getSeatTypeName={getSeatTypeName}
            />
          </div>

          {/* Usage Info */}
          <UsageInfo />
        </div>
      </main>

      {/* Seat Selection Dialog */}
      <SeatSelectionDialog
        isOpen={showSeatSelection}
        onClose={() => setShowSeatSelection(false)}
        selectedTrain={selectedTrain}
        selectedSeatType={selectedSeatType}
        selectedSeats={selectedSeats}
        onSeatClick={handleSeatClick}
        onApply={handleSeatSelectionApply}
        getSeatTypeName={getSeatTypeName}
        getTotalPassengers={getTotalPassengers}
      />

      {/* Booking Panel */}
      <BookingPanel
        isOpen={showBookingPanel}
        onClose={closeBookingPanel}
        selectedTrain={selectedTrain}
        selectedSeatType={selectedSeatType}
        selectedSeats={selectedSeats}
        selectedCar={selectedCar}
        onSeatSelection={() => {
          // BookingPanel 닫기
          setShowBookingPanel(false)
          // 약간의 지연 후 좌석 선택 다이얼로그 열기
          setTimeout(() => {
            setShowSeatSelection(true)
          }, 100)
        }}
        onBooking={handleBooking}
        getTrainTypeColor={getTrainTypeColor}
        getSeatTypeName={getSeatTypeName}
        formatPrice={formatPrice}
      />

      <Footer />
    </div>
  )
}