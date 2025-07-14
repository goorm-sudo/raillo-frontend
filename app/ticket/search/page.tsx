"use client"

import {useEffect, useRef, useState} from "react"
import {useRouter} from "next/navigation"
import {format} from "date-fns"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import {searchTrains, stationUtils, searchCars, searchSeats} from "@/lib/api/train"
import {makeReservation, addToCart as addToCartAPI} from "@/lib/api/booking"
import { handleError } from '@/lib/utils/errorHandler'
import {SeatSelectionDialog} from "@/components/ui/seat-selection-dialog"
import {BookingPanel} from "@/components/ui/booking-panel"
import {SearchForm} from "@/components/ui/search-form"
import {TrainList} from "@/components/ui/train-list"
import {UsageInfo} from "@/components/ui/usage-info"
import {tokenManager} from "@/lib/auth"
import { ko } from 'date-fns/locale'

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

// 예약 정보 타입 정의
interface ReservationInfo {
  reservationId: number
  seatReservationId: number
  trainType: string
  trainNumber: string
  date: string
  departureStation: string
  arrivalStation: string
  departureTime: string
  arrivalTime: string
  seatClass: string
  carNumber: number
  seats: string[]
  price: number
}

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
    returnDate?: string
    returnHour?: string
    passengers: PassengerCounts
    tripType?: string
  } | null>(null)

  // Date selection state
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [returnDate, setReturnDate] = useState<Date | undefined>(new Date())

  // 왕복 관련 상태
  const [isRoundtrip, setIsRoundtrip] = useState(false)
  const [outboundTrains, setOutboundTrains] = useState<TrainInfo[]>([])
  const [inboundTrains, setInboundTrains] = useState<TrainInfo[]>([])
  const [selectedOutboundTrain, setSelectedOutboundTrain] = useState<TrainInfo | null>(null)
  const [selectedInboundTrain, setSelectedInboundTrain] = useState<TrainInfo | null>(null)
  const [outboundReserved, setOutboundReserved] = useState(false) // 가는 열차 예매 완료 여부
  
  // 오는 열차 더보기 관련 상태
  const [inboundCurrentPage, setInboundCurrentPage] = useState(0)
  const [inboundHasNext, setInboundHasNext] = useState(false)
  const [loadingInboundMore, setLoadingInboundMore] = useState(false)

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
  
  // 객차 및 좌석 조회 상태
  const [carList, setCarList] = useState<any[]>([])
  const [seatList, setSeatList] = useState<any[]>([])
  const [loadingCars, setLoadingCars] = useState(false)
  const [loadingSeats, setLoadingSeats] = useState(false)

  // URL parameters (fallback)
  const [departureStation, setDepartureStation] = useState("")
  const [arrivalStation, setArrivalStation] = useState("")
  const [departureDateParam, setDepartureDateParam] = useState(new Date().toISOString().split("T")[0])

  // 중복 호출 방지 플래그
  const didFetchTrains = useRef(false)

  // 실제 API 호출 함수
  const fetchTrainsFromAPI = async (searchData: any) => {
    setLoading(true)
    
    try {
      // 검색 기록 저장
      const searchHistory = {
        departure: searchData.departureStation,
        arrival: searchData.arrivalStation,
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

      // 가는 열차 검색
      const searchRequest = {
        departureStationId,
        arrivalStationId,
        operationDate: searchData.departureDate,
        passengerCount: totalPassengers,
        departureHour: String(searchData.departureHour || "00").replace("시", "")
      }
      
      console.log('🚂 Train Search Request:', searchRequest)

      // 열차 조회 API 호출
      const response = await searchTrains(searchRequest, 0, 10)
      
      if (response.result) {
        // 새로운 API 응답 구조 처리
        const content = response.result.content || response.result
        const resultArray = Array.isArray(content) ? content : [content]
        
        const apiTrains: TrainInfo[] = resultArray.map((train: any, index: number) => ({
          trainScheduleId: train.trainScheduleId || 0,
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
            available: train.standingSeat?.canReserve === true, 
            price: train.standingSeat?.fare || 4200 
          }
        }))

        setAllTrains(apiTrains)
        setDisplayedTrains(apiTrains)
        setTotalResults(response.result.totalElements || apiTrains.length)
        
        // hasNext 설정 추가
        setHasNext(response.result.hasNext ?? false)
        
        // 왕복일 때는 가는 열차만 먼저 검색 (오는 열차는 예매 완료 후 검색)
        // if (searchData.tripType === 'roundtrip' && searchData.returnDate) {
        //   await fetchInboundTrains(searchData, totalPassengers)
        // }
      } else {
        setAllTrains([])
        setDisplayedTrains([])
        setTotalResults(0)
        setHasNext(false)
      }
    } catch (error) {
      console.error('열차 검색 실패:', error)
      setAllTrains([])
      setDisplayedTrains([])
      setTotalResults(0)
      setHasNext(false)
    } finally {
      setLoading(false)
    }
  }

  // 오는 열차 검색 함수
  const fetchInboundTrains = async (searchData: any, totalPassengers: number) => {
    try {
      const departureStationId = stationUtils.getStationId(searchData.arrivalStation) // 출발역과 도착역이 바뀜
      const arrivalStationId = stationUtils.getStationId(searchData.departureStation)

      if (!departureStationId || !arrivalStationId) {
        console.error("역 정보를 찾을 수 없습니다.")
        return
      }

      const searchRequest = {
        departureStationId,
        arrivalStationId,
        operationDate: searchData.returnDate,
        passengerCount: totalPassengers,
        departureHour: searchData.returnHour?.replace("시", "") || "00"
      }

      const response = await searchTrains(searchRequest, 0, 10)
      
      if (response.result) {
        const content = response.result.content || response.result
        const resultArray = Array.isArray(content) ? content : [content]
        
        const inboundTrains: TrainInfo[] = resultArray.map((train: any, index: number) => ({
          trainScheduleId: train.trainScheduleId || 0,
          id: `inbound_${train.trainNumber || train.id || index}_${train.departureTime || index}_${index}`,
          trainType: train.trainName || train.trainType || "KTX",
          trainNumber: train.trainNumber || `${index + 1}`,
          departureTime: train.departureTime ? train.departureTime.substring(0, 5) : "00:00",
          arrivalTime: train.arrivalTime ? train.arrivalTime.substring(0, 5) : "00:00",
          duration: train.formattedTravelTime || train.travelTime || "0시간 0분",
          departureStation: train.departureStationName || train.departureStation || searchData.arrivalStation,
          arrivalStation: train.arrivalStationName || train.arrivalStation || searchData.departureStation,
          generalSeat: { 
            available: train.standardSeat?.canReserve === true, 
            price: train.standardSeat?.fare || 8400 
          },
          reservedSeat: { 
            available: train.firstClassSeat?.canReserve === true, 
            price: train.firstClassSeat?.fare || 13200 
          },
          standingSeat: { 
            available: train.standingSeat?.canReserve === true, 
            price: train.standingSeat?.fare || 4200 
          }
        }))

        setInboundTrains(inboundTrains)
        setInboundHasNext(response.result.hasNext ?? false)
      }
    } catch (error) {
      console.error('오는 열차 검색 실패:', error)
    }
  }

  // 왕복일 때 가는 열차 예매 완료 후 오는 열차 검색
  const fetchInboundTrainsAfterReservation = async () => {
    if (!searchData || !searchData.returnDate) return
    
    setLoading(true)
    try {
      const totalPassengers = Object.values(searchData.passengers).reduce((sum: number, count: any) => sum + (count as number), 0)
      await fetchInboundTrains(searchData, totalPassengers)
    } catch (error) {
      console.error('오는 열차 검색 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  // 왕복일 때 가는 열차 예매 완료 처리
  const handleOutboundReservationComplete = async () => {
    setOutboundReserved(true)
    // 오는 열차 검색
    await fetchInboundTrainsAfterReservation()
  }

  // Load search data from localStorage on component mount
  useEffect(() => {
    if (didFetchTrains.current) return;
    didFetchTrains.current = true;
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
        
        // 왕복 여부 확인
        if (parsedData.tripType === 'roundtrip') {
          setIsRoundtrip(true)
          if (parsedData.returnDate) {
            setReturnDate(new Date(parsedData.returnDate))
          }
        }
        
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

    // 가는 날짜가 오늘보다 이전인지 확인
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) {
      alert("가는 날짜는 오늘 이후여야 합니다.")
      return
    }

    // 왕복일 때 오는 날짜가 가는 날짜보다 이전인지 확인
    if (searchData?.tripType === 'roundtrip' && returnDate && returnDate <= date) {
      alert("오는 날짜는 가는 날짜보다 늦어야 합니다.")
      return
    }

    // 새로운 검색 조건 생성
    const newSearchData = {
      departureStation: departureStation,
      arrivalStation: arrivalStation,
      departureDate: format(date, "yyyy-MM-dd"),
      departureHour: searchData?.departureHour || date.getHours().toString().padStart(2, '0'),
      returnDate: searchData?.returnDate,
      returnHour: searchData?.returnHour,
      passengers: passengerCounts,
      tripType: searchData?.tripType
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
    
    // 객차 조회 호출
    if (train.trainScheduleId) {
      fetchCars(train.trainScheduleId)
    }
    
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
          trainScheduleId: train.trainScheduleId || 0,
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

  // 오는 열차 더보기 함수
  const handleInboundLoadMore = async () => {
    if (!searchData) return
    
    setLoadingInboundMore(true)

    try {
      const nextPage = inboundCurrentPage + 1
      const departureStationId = stationUtils.getStationId(searchData.arrivalStation) // 출발역과 도착역이 바뀜
      const arrivalStationId = stationUtils.getStationId(searchData.departureStation)
      
      if (!departureStationId || !arrivalStationId) {
        console.error("역 정보를 찾을 수 없습니다.")
        setLoadingInboundMore(false)
        return
      }
      
      const searchRequest = {
        departureStationId,
        arrivalStationId,
        operationDate: searchData.returnDate || "",
        passengerCount: Object.values(searchData.passengers).reduce((sum: number, count: any) => sum + (count as number), 0),
        departureHour: searchData.returnHour?.replace("시", "") || "00"
      }

      const response = await searchTrains(searchRequest, nextPage, 10)
      
      if (response.result) {
        const content = response.result.content || response.result
        const resultArray = Array.isArray(content) ? content : [content]
        
        const newInboundTrains: TrainInfo[] = resultArray.map((train: any, index: number) => ({
          trainScheduleId: train.trainScheduleId || 0,
          id: `inbound_${train.trainNumber || train.id || index}_${train.departureTime || index}_${index}_${nextPage}`,
          trainType: train.trainName || train.trainType || "KTX",
          trainNumber: train.trainNumber || `${index + 1}`,
          departureTime: train.departureTime ? train.departureTime.substring(0, 5) : "00:00",
          arrivalTime: train.arrivalTime ? train.arrivalTime.substring(0, 5) : "00:00",
          duration: train.formattedTravelTime || train.travelTime || "0시간 0분",
          departureStation: train.departureStationName || train.departureStation || searchData.arrivalStation,
          arrivalStation: train.arrivalStationName || train.arrivalStation || searchData.departureStation,
          generalSeat: { 
            available: train.standardSeat?.canReserve === true, 
            price: train.standardSeat?.fare || 8400 
          },
          reservedSeat: { 
            available: train.firstClassSeat?.canReserve === true, 
            price: train.firstClassSeat?.fare || 13200 
          },
          standingSeat: { 
            available: train.standingSeat?.canReserve === true, 
            price: train.standingSeat?.fare || 4200 
          }
        }))

        // 기존 데이터에 새 데이터 추가
        setInboundTrains(prev => [...prev, ...newInboundTrains])
        setInboundCurrentPage(nextPage)
        setInboundHasNext(response.result.hasNext ?? false)
      }
    } catch (error) {
      console.error("오는 열차 더보기 로딩 중 오류 발생:", error)
      setInboundHasNext(false)
    } finally {
      setLoadingInboundMore(false)
    }
  }

  // 예약용 passengers 생성 함수
  const getPassengersForReservation = () => {
    const passengers = []
    
    if (passengerCounts.adult > 0) {
      passengers.push({ passengerType: 'ADULT' as const, count: passengerCounts.adult })
    }
    if (passengerCounts.child > 0) {
      passengers.push({ passengerType: 'CHILD' as const, count: passengerCounts.child })
    }
    if (passengerCounts.infant > 0) {
      passengers.push({ passengerType: 'INFANT' as const, count: passengerCounts.infant })
    }
    if (passengerCounts.senior > 0) {
      passengers.push({ passengerType: 'SENIOR' as const, count: passengerCounts.senior })
    }
    if (passengerCounts.severelydisabled > 0) {
      passengers.push({ passengerType: 'DISABLED_HEAVY' as const, count: passengerCounts.severelydisabled })
    }
    if (passengerCounts.mildlydisabled > 0) {
      passengers.push({ passengerType: 'DISABLED_LIGHT' as const, count: passengerCounts.mildlydisabled })
    }
    if (passengerCounts.veteran > 0) {
      passengers.push({ passengerType: 'VETERAN' as const, count: passengerCounts.veteran })
    }
    
    return passengers
  }

  // 선택된 좌석의 seatId 배열 생성
  const getSelectedSeatIds = () => {
    return selectedSeats.map(seatNumber => {
      const seat = seatList.find(s => s.seatNumber === seatNumber)
      return seat?.seatId || 0
    }).filter(id => id > 0)
  }

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

    // passengers 생성
    const passengers = getPassengersForReservation()
    
    // 선택된 좌석의 seatId 배열 생성
    const seatIds = getSelectedSeatIds()
    
    if (seatIds.length === 0) {
      alert("선택된 좌석 정보를 찾을 수 없습니다.")
      return
    }

    // 예약 요청 데이터
    if (!selectedTrain.trainScheduleId) {
      alert("열차 스케줄 정보를 찾을 수 없습니다.")
      return
    }
    
    const reservationRequest = {
      trainScheduleId: selectedTrain.trainScheduleId,
      departureStationId,
      arrivalStationId,
      passengers,
      seatIds,
      tripType: 'OW' as const,
    }

    try {
      const response = await makeReservation(reservationRequest)
      if (response.result) {
        const { reservationId } = response.result
        // 예약 ID를 세션 스토리지에 임시 저장 (API 호출용)
        sessionStorage.setItem('tempReservationId', reservationId.toString())
        
        // 왕복일 때는 가는 열차 예매 완료 처리
        if (isRoundtrip && !outboundReserved) {
          // 가는 열차를 장바구니에 추가
          await addToCart(selectedTrain, selectedSeatType, true)
          await handleOutboundReservationComplete()
          // 예매 패널 닫기
          closeBookingPanel()
          // 성공 메시지
          alert('가는 열차가 장바구니에 추가되었습니다. 이제 오는 열차를 선택하세요.')
        } else if (isRoundtrip && outboundReserved) {
          // 오는 열차를 장바구니에 추가
          await addToCart(selectedTrain, selectedSeatType, false)
          // 예매 패널 닫기
          closeBookingPanel()
          // 장바구니로 이동
          router.push('/cart')
        } else {
          // 편도인 경우 예약 완료 페이지로 이동
          router.push('/ticket/reservation')
        }
      } else {
        alert("예약에 실패했습니다.")
      }
    } catch (e: any) {
      handleError(e, "예약 요청 중 오류가 발생했습니다.")
    }
  }

  // 왕복 예매 시 장바구니에 추가
  const addToCart = async (train: TrainInfo, seatType: SeatType, isOutbound: boolean) => {
    if (!searchData) return

    try {
      // 예약 ID를 세션 스토리지에서 가져오기
      const reservationId = sessionStorage.getItem('tempReservationId')
      if (!reservationId) {
        console.error('예약 ID를 찾을 수 없습니다.')
        return
      }

      // 실제 API 호출
      const response = await addToCartAPI({ reservationId: parseInt(reservationId) })
      
      if (response.result) {
        console.log('장바구니에 추가됨:', response.result)
        
        // localStorage에도 백업 저장 (선택사항)
        const cartItem = {
          trainScheduleId: train.trainScheduleId,
          departureStation: isOutbound ? searchData.departureStation : searchData.arrivalStation,
          arrivalStation: isOutbound ? searchData.arrivalStation : searchData.departureStation,
          operationDate: isOutbound ? searchData.departureDate : searchData.returnDate,
          seatType: seatType,
          passengers: getPassengersForReservation(),
          tripType: 'roundtrip',
          direction: isOutbound ? 'outbound' : 'inbound',
          reservationId: parseInt(reservationId)
        }

        const existingCart = localStorage.getItem('rail-o-cart')
        let cartItems = []
        
        if (existingCart) {
          try {
            cartItems = JSON.parse(existingCart)
          } catch (error) {
            console.error('기존 장바구니 파싱 실패:', error)
          }
        }
        
        cartItems.push(cartItem)
        localStorage.setItem('rail-o-cart', JSON.stringify(cartItems))
      }
    } catch (error) {
      console.error('장바구니 추가 실패:', error)
      throw error
    }
  }

  const closeBookingPanel = () => {
    setShowBookingPanel(false)
    setSelectedTrain(null)
    setSelectedSeats([]) // 좌석 선택 초기화
    setSelectedCar(1) // 호차 선택 초기화
    setCarList([]) // 객차 목록 초기화
    setSeatList([]) // 좌석 목록 초기화
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

  // 객차 조회 함수
  const fetchCars = async (trainScheduleId: number) => {
    if (!searchData) return
    
    setLoadingCars(true)
    try {
      const departureStationId = stationUtils.getStationId(searchData.departureStation)
      const arrivalStationId = stationUtils.getStationId(searchData.arrivalStation)
      
      if (!departureStationId || !arrivalStationId) {
        console.error("역 정보를 찾을 수 없습니다.")
        return
      }
      
      const request = {
        trainScheduleId,
        departureStationId,
        arrivalStationId,
        passengerCount: getTotalPassengers()
      }
      
      const response = await searchCars(request)
      
      if (response.result) {
        setCarList(response.result.carInfos)
      } else {
        console.error("객차 조회 실패:", response.message)
        setCarList([])
      }
    } catch (error) {
      console.error("객차 조회 중 오류 발생:", error)
      setCarList([])
    } finally {
      setLoadingCars(false)
    }
  }

  // 좌석 조회 함수
  const fetchSeats = async (trainCarId: string, trainScheduleId: number) => {
    if (!searchData) return
    
    setLoadingSeats(true)
    try {
      const departureStationId = stationUtils.getStationId(searchData.departureStation)
      const arrivalStationId = stationUtils.getStationId(searchData.arrivalStation)
      
      if (!departureStationId || !arrivalStationId) {
        console.error("역 정보를 찾을 수 없습니다.")
        return
      }
      
      const request = {
        trainCarId,
        trainScheduleId,
        departureStationId,
        arrivalStationId
      }
      
      const response = await searchSeats(request)
      
      if (response.result) {
        setSeatList(response.result.seatList)
      } else {
        console.error("좌석 조회 실패:", response.message)
        setSeatList([])
      }
    } catch (error) {
      console.error("좌석 조회 중 오류 발생:", error)
      setSeatList([])
    } finally {
      setLoadingSeats(false)
    }
  }

  // 좌석 정보 새로고침 함수
  const handleRefreshSeats = () => {
    if (selectedTrain && selectedTrain.trainScheduleId) {
      // 현재 선택된 객차의 좌석 정보를 새로 가져오기
      const currentCar = carList.find(car => parseInt(car.carNumber) === selectedCar)
      if (currentCar) {
        fetchSeats(currentCar.id.toString(), selectedTrain.trainScheduleId)
      }
    }
  }

  const [hasNext, setHasNext] = useState(false)

  // 오는 날짜 변경 핸들러
  const handleReturnDateChange = (newDate: Date) => {
    setReturnDate(newDate)
    setSearchConditionsChanged(true)
    
    // 현재 검색 조건이 있으면 업데이트만 하고 검색은 하지 않음
    if (searchData) {
      const updatedSearchData = {
        ...searchData,
        returnDate: format(newDate, "yyyy-MM-dd"),
        returnHour: newDate.getHours().toString().padStart(2, '0')
      }
      setSearchData(updatedSearchData)
      localStorage.setItem('searchData', JSON.stringify(updatedSearchData))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">열차 정보를 검색하고 있습니다...</p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
          {/* Search Form */}
          <SearchForm
            searchData={searchData}
            departureStation={departureStation}
            arrivalStation={arrivalStation}
            date={date}
            returnDate={returnDate}
            passengerCounts={passengerCounts}
            searchConditionsChanged={searchConditionsChanged}
            onDepartureStationChange={handleDepartureStationChange}
            onArrivalStationChange={handleArrivalStationChange}
            onDateChange={handleDateChange}
            onReturnDateChange={handleReturnDateChange}
            onPassengerChange={handlePassengerChange}
            onSearch={handleUpdateSearch}
            onBothStationsChange={(departure, arrival) => {
              // 두 역을 동시에 변경할 때 searchData도 업데이트
              if (searchData) {
                const updatedSearchData = {
                  ...searchData,
                  departureStation: departure,
                  arrivalStation: arrival
                }
                setSearchData(updatedSearchData)
                localStorage.setItem('searchData', JSON.stringify(updatedSearchData))
              }
              // departureStation과 arrivalStation 상태도 직접 업데이트
              setDepartureStation(departure)
              setArrivalStation(arrival)
              setSearchConditionsChanged(true)
            }}
          />

          {/* Train List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {isRoundtrip ? "왕복 열차 검색 결과" : "검색 결과"}
              </h2>
              <div className="text-sm text-gray-600">* 요금은 어른 기준이며, 어린이(40%)·유아(75%)·경로(30%)·장애인(30~50%)·국가유공자(50%) 할인이 적용됩니다.</div>
            </div>

            {isRoundtrip ? (
              <div className="space-y-6">
                {/* 가는 열차 목록 */}
                {!outboundReserved && (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">가는 열차</h3>
                      <p className="text-sm text-gray-600">
                        {searchData?.departureStation} → {searchData?.arrivalStation} 
                        ({format(new Date(searchData?.departureDate || ''), 'M월 d일 (E)', { locale: ko })})
                      </p>
                    </div>
                    <TrainList
                      displayedTrains={displayedTrains}
                      totalResults={totalResults}
                      selectedTrain={selectedOutboundTrain}
                      loadingMore={loadingMore}
                      hasMoreTrains={hasNext}
                      onSeatSelection={(train, seatType) => {
                        setSelectedOutboundTrain(train)
                        handleSeatSelection(train, seatType)
                      }}
                      onLoadMore={handleLoadMore}
                      getTrainTypeColor={getTrainTypeColor}
                      formatPrice={formatPrice}
                      getSeatTypeName={getSeatTypeName}
                    />
                  </div>
                )}

                {/* 오는 열차 목록 */}
                {outboundReserved && (
                  <div>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">오는 열차</h3>
                      <p className="text-sm text-gray-600">
                        {searchData?.arrivalStation} → {searchData?.departureStation}
                        ({format(new Date(searchData?.returnDate || ''), 'M월 d일 (E)', { locale: ko })})
                      </p>
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          ✓ 가는 열차 예매가 완료되었습니다. 이제 오는 열차를 선택하세요.
                        </p>
                      </div>
                    </div>
                    <TrainList
                      displayedTrains={inboundTrains}
                      totalResults={inboundTrains.length}
                      selectedTrain={selectedInboundTrain}
                      loadingMore={loadingInboundMore}
                      hasMoreTrains={inboundHasNext}
                      onSeatSelection={(train, seatType) => {
                        setSelectedInboundTrain(train)
                        handleSeatSelection(train, seatType)
                      }}
                      onLoadMore={handleInboundLoadMore}
                      getTrainTypeColor={getTrainTypeColor}
                      formatPrice={formatPrice}
                      getSeatTypeName={getSeatTypeName}
                    />
                  </div>
                )}
              </div>
            ) : (
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
            )}
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
        carList={carList}
        seatList={seatList}
        loadingCars={loadingCars}
        loadingSeats={loadingSeats}
        onCarSelect={(carId: string) => {
          if (selectedTrain && selectedTrain.trainScheduleId) {
            fetchSeats(carId, selectedTrain.trainScheduleId)
          }
        }}
        onRefreshSeats={handleRefreshSeats}
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
        carList={carList}
        loadingCars={loadingCars}
        onRefreshSeats={handleRefreshSeats}
      />

      <Footer />
    </div>
  )
}
