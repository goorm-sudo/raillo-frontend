"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

// 객차 정보 타입
interface CarInfo {
  id: number;
  carNumber: string;
  carType: 'STANDARD' | 'FIRST_CLASS';
  totalSeats: number;
  remainingSeats: number;
  seatArrangement: string;
}

// 좌석 정보 타입
interface SeatDetail {
  seatId: number;
  seatNumber: string;
  isAvailable: boolean;
  seatDirection: 'FORWARD' | 'BACKWARD';
  seatType: 'WINDOW' | 'AISLE';
  remarks: string;
}

interface SeatSelectionDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedTrain: {
    trainType: string
    trainNumber: string
    departureStation?: string
    arrivalStation?: string
  } | null
  selectedSeatType: string
  selectedSeats: string[]
  onSeatClick: (seatNumber: string) => void
  onApply: (selectedSeats: string[], selectedCar: number) => void
  getSeatTypeName: (seatType: string) => string
  getTotalPassengers: () => number
  // 새로운 props 추가
  carList: CarInfo[]
  seatList: SeatDetail[]
  loadingCars: boolean
  loadingSeats: boolean
  onCarSelect: (carId: string) => void
  // 좌석 정보 새로고침 함수 추가
  onRefreshSeats: () => void
}

export function SeatSelectionDialog({
  isOpen,
  onClose,
  selectedTrain,
  selectedSeatType,
  selectedSeats,
  onSeatClick,
  onApply,
  getSeatTypeName,
  getTotalPassengers,
  carList,
  seatList,
  loadingCars,
  loadingSeats,
  onCarSelect,
  onRefreshSeats,
}: SeatSelectionDialogProps) {
  const [selectedCar, setSelectedCar] = useState<CarInfo | null>(null)
  const onCarSelectRef = useRef(onCarSelect)
  
  // onCarSelect 함수를 ref에 저장
  useEffect(() => {
    onCarSelectRef.current = onCarSelect
  }, [onCarSelect])
  
  // 다이얼로그가 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen && carList.length > 0) {
      // 선택된 좌석 타입에 맞는 첫 번째 객차 선택
      const suitableCar = carList.find(car => {
        if (selectedSeatType === "reservedSeat") {
          return car.carType === "FIRST_CLASS"
        } else if (selectedSeatType === "generalSeat") {
          return car.carType === "STANDARD"
        }
        return true // 입석은 모든 객차
      }) || carList[0]
      
      setSelectedCar(suitableCar)
      
      // 다이얼로그가 열릴 때만 좌석 정보 새로고침
      if (isOpen) {
        onRefreshSeats()
      }
    }
  }, [isOpen, carList, selectedSeatType]) // onRefreshSeats 제거

  // selectedCar가 변경될 때만 onCarSelect 호출
  useEffect(() => {
    if (selectedCar) {
      onCarSelectRef.current(selectedCar.id.toString())
    }
  }, [selectedCar])
  
  // 객차 변경 핸들러
  const handleCarChange = (carId: string) => {
    const car = carList.find(c => c.id.toString() === carId)
    if (car) {
      setSelectedCar(car)
      // 객차 변경 시 선택된 좌석 초기화
      selectedSeats.forEach(seat => {
        onSeatClick(seat)
      })
    }
  }

  // 좌석 타입에 따른 객차 필터링
  const getFilteredCars = () => {
    return carList.filter(car => {
      if (selectedSeatType === "reservedSeat") {
        return car.carType === "FIRST_CLASS"
      } else if (selectedSeatType === "generalSeat") {
        return car.carType === "STANDARD"
      }
      return true // 입석은 모든 객차
    })
  }

  // 좌석 배열 생성 (API 데이터 기반)
  const generateSeatGrid = () => {
    if (!seatList.length) return []
    
    // 좌석 번호별로 그룹화
    const seatMap = new Map<string, SeatDetail>()
    seatList.forEach(seat => {
      seatMap.set(seat.seatNumber, seat)
    })
    
    // 좌석 번호에서 행과 열 추출
    const seats = []
    for (const seat of seatList) {
      const match = seat.seatNumber.match(/^(\d+)([A-Z])$/)
      if (match) {
        const [, row, col] = match
        seats.push({
          ...seat,
          row: parseInt(row),
          column: col,
          isWindow: seat.seatType === "WINDOW"
        })
      }
    }
    
    // 행과 열로 정렬
    return seats.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row
      return a.column.localeCompare(b.column)
    })
  }

  const seatGrid = generateSeatGrid()
  const filteredCars = getFilteredCars()

  // 좌석 버튼 스타일링 함수
  const getSeatButtonStyle = (seat: any, isSelected: boolean) => {
    if (!seat.isAvailable) {
      return "bg-gray-400 border-gray-500 text-gray-600 cursor-not-allowed"
    }
    
    if (isSelected) {
      return "bg-blue-600 text-white border-blue-700 shadow-lg"
    }
    
    // 방향에 따른 기본 색상
    if (seat.seatDirection === "FORWARD") {
      return "bg-orange-100 border-orange-300 hover:bg-orange-200 text-gray-800"
    } else if (seat.seatDirection === "BACKWARD") {
      return "bg-purple-100 border-purple-300 hover:bg-purple-200 text-gray-800"
    }
    return "bg-blue-100 border-blue-300 hover:bg-blue-200 text-gray-800"
  }

  if (!isOpen || !selectedTrain) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Dialog Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-800">
              좌석선택 - {selectedTrain.trainType} {selectedTrain.trainNumber}
            </h2>
            {selectedCar && (
              <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                {selectedCar.carNumber}호차 ({selectedCar.carType === "FIRST_CLASS" ? "특실" : "일반실"})
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Car Selection */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">호차 선택:</span>
              {loadingCars ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">객차 정보 로딩 중...</span>
                </div>
              ) : (
                <Select
                  value={selectedCar?.id.toString() || ""}
                  onValueChange={handleCarChange}
                >
                  <SelectTrigger className="w-64 bg-white border-gray-300">
                    <SelectValue placeholder="객차를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {filteredCars.map((car) => (
                      <SelectItem 
                        key={car.id} 
                        value={car.id.toString()}
                      >
                        {car.carNumber}호차 ({car.remainingSeats}/{car.totalSeats}석) 
                        {car.carType === "FIRST_CLASS" ? " 특실" : " 일반실"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>

        {/* Seat Legend */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-gray-700">선택 가능</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-blue-600 border border-blue-700 rounded"></div>
              <span className="text-gray-700">선택됨</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gray-400 border border-gray-500 rounded"></div>
              <span className="text-gray-700">매진</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-orange-100 border-orange-300 rounded flex items-center justify-center">
                <span className="text-xs text-orange-600">→</span>
              </div>
              <span className="text-gray-700">순방향</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-purple-100 border-purple-300 rounded flex items-center justify-center">
                <span className="text-xs text-purple-600">←</span>
              </div>
              <span className="text-gray-700">역방향</span>
            </div>
          </div>
        </div>

        {/* Train Seat Map */}
        <div className="p-6 overflow-auto max-h-[60vh]">
          {loadingSeats ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">좌석 정보 로딩 중...</span>
              </div>
            </div>
          ) : seatGrid.length > 0 ? (
            <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50 min-w-[800px]">
              {/* Train Layout */}
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-6">
                  {/* Left Restrooms */}
                  <div className="flex flex-col space-y-3">
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center border-2 border-gray-300">
                      <span className="text-lg">🚻</span>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center border-2 border-gray-300">
                      <span className="text-lg">🚻</span>
                    </div>
                  </div>

                  {/* Seat Grid */}
                  <div className="flex flex-col space-y-2">
                    {/* 좌석 배치에 따라 동적으로 생성 */}
                    {(() => {
                      const rows = Math.max(...seatGrid.map(s => s.row))
                      const columns = [...new Set(seatGrid.map(s => s.column))].sort()
                      const isReserved = selectedCar?.carType === "FIRST_CLASS"
                      
                      return (
                        <>
                          {/* Top Seats */}
                          <div className="flex flex-col space-y-2">
                            {/* A Row */}
                            <div className="flex space-x-2">
                              {Array.from({ length: rows }, (_, rowIndex) => {
                                const row = rowIndex + 1
                                const seatNumber = `${row}A`
                                const seat = seatGrid.find(s => s.seatNumber === seatNumber)
                                const isSelected = selectedSeats.includes(seatNumber)
                                
                                if (!seat) return <div key={row} className="w-10 h-10"></div>
                                
                                return (
                                  <button
                                    key={row}
                                    onClick={() => {
                                      if (!seat.isAvailable) return
                                      
                                      const maxSeats = getTotalPassengers()
                                      if (!isSelected && selectedSeats.length >= maxSeats) {
                                        alert(`최대 ${maxSeats}개의 좌석만 선택할 수 있습니다.`)
                                        return
                                      }
                                      onSeatClick(seatNumber)
                                    }}
                                    disabled={!seat.isAvailable}
                                    className={`
                                      w-10 h-10 text-xs font-medium rounded border-2 transition-all duration-200 hover:scale-105
                                      ${getSeatButtonStyle(seat, isSelected)}
                                    `}
                                    title={`${seatNumber} (${seat.seatType === "WINDOW" ? "창가" : "통로"}) ${seat.remarks || ""}`}
                                  >
                                    {seatNumber}
                                  </button>
                                )
                              })}
                            </div>
                            
                            {/* Aisle for Reserved (A-B 사이) */}
                            {isReserved && (
                              <div className="flex justify-between items-center px-2 py-1">
                                <span className="font-semibold text-blue-700 text-sm">
                                  {selectedTrain.departureStation || "출발역"}
                                </span>
                                <div className="flex items-center space-x-1">
                                  {Array.from({ length: 6 }, (_, i) => (
                                    <span key={i} className="text-blue-500 text-lg font-bold">→</span>
                                  ))}
                                </div>
                                <span className="font-semibold text-blue-700 text-sm">
                                  {selectedTrain.arrivalStation || "도착역"}
                                </span>
                              </div>
                            )}
                            
                            {/* B Row */}
                            <div className="flex space-x-2">
                              {Array.from({ length: rows }, (_, rowIndex) => {
                                const row = rowIndex + 1
                                const seatNumber = `${row}B`
                                const seat = seatGrid.find(s => s.seatNumber === seatNumber)
                                const isSelected = selectedSeats.includes(seatNumber)
                                
                                if (!seat) return <div key={row} className="w-10 h-10"></div>
                                
                                return (
                                  <button
                                    key={row}
                                    onClick={() => {
                                      if (!seat.isAvailable) return
                                      
                                      const maxSeats = getTotalPassengers()
                                      if (!isSelected && selectedSeats.length >= maxSeats) {
                                        alert(`최대 ${maxSeats}개의 좌석만 선택할 수 있습니다.`)
                                        return
                                      }
                                      onSeatClick(seatNumber)
                                    }}
                                    disabled={!seat.isAvailable}
                                    className={`
                                      w-10 h-10 text-xs font-medium rounded border-2 transition-all duration-200 hover:scale-105
                                      ${getSeatButtonStyle(seat, isSelected)}
                                    `}
                                    title={`${seatNumber} (${seat.seatType === "WINDOW" ? "창가" : "통로"}) ${seat.remarks || ""}`}
                                  >
                                    {seatNumber}
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Aisle for General (B-C 사이) */}
                          {!isReserved && (
                            <div className="flex justify-between items-center px-2 py-1">
                              <span className="font-semibold text-blue-700 text-sm">
                                {selectedTrain.departureStation || "출발역"}
                              </span>
                              <div className="flex items-center space-x-1">
                                {Array.from({ length: 6 }, (_, i) => (
                                  <span key={i} className="text-blue-500 text-lg font-bold">→</span>
                                ))}
                              </div>
                              <span className="font-semibold text-blue-700 text-sm">
                                {selectedTrain.arrivalStation || "도착역"}
                              </span>
                            </div>
                          )}

                          {/* Bottom Seats */}
                          <div className="flex flex-col space-y-2">
                            {/* C Row (for general) */}
                            {!isReserved && (
                              <div className="flex space-x-2">
                                {Array.from({ length: rows }, (_, rowIndex) => {
                                  const row = rowIndex + 1
                                  const seatNumber = `${row}C`
                                  const seat = seatGrid.find(s => s.seatNumber === seatNumber)
                                  const isSelected = selectedSeats.includes(seatNumber)
                                  
                                  if (!seat) return <div key={row} className="w-10 h-10"></div>
                                  
                                  return (
                                    <button
                                      key={row}
                                      onClick={() => {
                                        if (!seat.isAvailable) return
                                        
                                        const maxSeats = getTotalPassengers()
                                        if (!isSelected && selectedSeats.length >= maxSeats) {
                                          alert(`최대 ${maxSeats}개의 좌석만 선택할 수 있습니다.`)
                                          return
                                        }
                                        onSeatClick(seatNumber)
                                      }}
                                      disabled={!seat.isAvailable}
                                      className={`
                                        w-10 h-10 text-xs font-medium rounded border-2 transition-all duration-200 hover:scale-105
                                        ${getSeatButtonStyle(seat, isSelected)}
                                      `}
                                      title={`${seatNumber} (${seat.seatType === "WINDOW" ? "창가" : "통로"}) ${seat.remarks || ""}`}
                                    >
                                      {seatNumber}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                            
                            {/* D Row (general) or C Row (reserved) */}
                            <div className="flex space-x-2">
                              {Array.from({ length: rows }, (_, rowIndex) => {
                                const row = rowIndex + 1
                                const seatNumber = `${row}${isReserved ? 'C' : 'D'}`
                                const seat = seatGrid.find(s => s.seatNumber === seatNumber)
                                const isSelected = selectedSeats.includes(seatNumber)
                                
                                if (!seat) return <div key={row} className="w-10 h-10"></div>
                                
                                return (
                                  <button
                                    key={row}
                                    onClick={() => {
                                      if (!seat.isAvailable) return
                                      
                                      const maxSeats = getTotalPassengers()
                                      if (!isSelected && selectedSeats.length >= maxSeats) {
                                        alert(`최대 ${maxSeats}개의 좌석만 선택할 수 있습니다.`)
                                        return
                                      }
                                      onSeatClick(seatNumber)
                                    }}
                                    disabled={!seat.isAvailable}
                                    className={`
                                      w-10 h-10 text-xs font-medium rounded border-2 transition-all duration-200 hover:scale-105
                                      ${getSeatButtonStyle(seat, isSelected)}
                                    `}
                                    title={`${seatNumber} (${seat.seatType === "WINDOW" ? "창가" : "통로"}) ${seat.remarks || ""}`}
                                  >
                                    {seatNumber}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  {/* Right Restrooms */}
                  <div className="flex flex-col space-y-3">
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center border-2 border-gray-300">
                      <span className="text-lg">🚻</span>
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center border-2 border-gray-300">
                      <span className="text-lg">🚻</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">🚂</div>
                <p className="text-gray-600">좌석 정보를 불러올 수 없습니다.</p>
                <p className="text-sm text-gray-500">객차를 선택해주세요.</p>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              선택된 좌석: {selectedSeats.length > 0 ? selectedSeats.join(", ") : "없음"}
            </div>
            <Button
              onClick={() => onApply(selectedSeats, selectedCar ? parseInt(selectedCar.carNumber) : 1)}
              disabled={selectedSeats.length !== getTotalPassengers()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-medium"
            >
              선택적용 ({selectedSeats.length}명 좌석 선택/총 {getTotalPassengers()}명)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 

