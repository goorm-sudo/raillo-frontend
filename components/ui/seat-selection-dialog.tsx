"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

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
}

// 좌석 데이터 생성 함수
const generateSeatData = (seatType: string, carNumber: number) => {
  // 2호차는 특실, 나머지는 일반실
  const isReserved = carNumber === 2 || seatType === "reservedSeat"
  const columns = isReserved ? ["A", "B", "C"] : ["A", "B", "C", "D"]
  const seats = []

  for (let row = 1; row <= 14; row++) {
    for (const col of columns) {
      const seatNumber = `${row}${col}`
      seats.push({
        id: seatNumber,
        row,
        column: col,
        isAvailable: true, // 모든 좌석을 선택 가능하게 설정
        isSelected: false,
        isWindow: col === "A" || (col === "D" && !isReserved)
      })
    }
  }

  return seats
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
}: SeatSelectionDialogProps) {
  // 좌석 타입에 따라 초기 호차 설정
  const getInitialCar = (seatType: string) => {
    if (seatType === "reservedSeat") return 2 // 특실은 2호차
    return 1 // 일반실과 입석은 1호차
  }
  
  const [selectedCar, setSelectedCar] = useState(getInitialCar(selectedSeatType))
  
  // 다이얼로그가 열릴 때마다 좌석 타입에 맞는 호차로 초기화
  useEffect(() => {
    if (isOpen) {
      const initialCar = getInitialCar(selectedSeatType)
      setSelectedCar(initialCar)
    }
  }, [isOpen, selectedSeatType])
  
  // 선택된 호차에 따른 좌석 타입 결정
  const getCarSeatType = (carNumber: number) => {
    if (carNumber === 2) return "특실"
    return "일반실"
  }
  
  const currentCarSeatType = getCarSeatType(selectedCar)
  const isReserved = currentCarSeatType === "특실"
  const columns = isReserved ? ["A", "B", "C"] : ["A", "B", "C", "D"]
  const seatData = generateSeatData(selectedSeatType, selectedCar)

  // 호차 변경 핸들러
  const handleCarChange = (carNumber: number) => {
    setSelectedCar(carNumber)
    // 호차 변경 시 선택된 좌석 초기화
    selectedSeats.forEach(seat => {
      onSeatClick(seat) // 이미 선택된 좌석을 다시 클릭하여 제거
    })
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
            <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {currentCarSeatType}
            </span>
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
              <Select
                value={selectedCar.toString()}
                onValueChange={(value) => {
                  handleCarChange(Number.parseInt(value))
                }}
              >
                <SelectTrigger className="w-48 bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  {[1, 2, 3, 4, 5, 6]
                    .filter(car => {
                      // 선택한 좌석 타입에 따라 호차 필터링
                      if (selectedSeatType === "reservedSeat") {
                        return car === 2 // 특실은 2호차만
                      } else if (selectedSeatType === "generalSeat") {
                        return car !== 2 // 일반실은 2호차 제외
                      }
                      return true // 입석은 모든 호차
                    })
                    .map((car) => {
                      const carSeatType = getCarSeatType(car)
                      const seatCount = carSeatType === "특실" ? 42 : 56
                      
                      return (
                        <SelectItem 
                          key={car} 
                          value={car.toString()}
                        >
                          {car}호차 ({seatCount}석) {carSeatType}
                        </SelectItem>
                      )
                    })}
                </SelectContent>
              </Select>
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
          </div>
        </div>

        {/* Train Seat Map */}
        <div className="p-6 overflow-auto max-h-[60vh]">
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
                  {/* Top Seats */}
                  <div className="flex flex-col space-y-2">
                    {/* A Row */}
                    <div className="flex space-x-2">
                      {Array.from({ length: 14 }, (_, row) => {
                        const seatNumber = `${row + 1}A`
                        const seat = seatData.find(s => s.id === seatNumber) || { isAvailable: true }
                        const isSelected = selectedSeats.includes(seatNumber)
                        
                        return (
                          <button
                            key={row}
                            onClick={() => {
                              const maxSeats = getTotalPassengers()
                              if (!isSelected && selectedSeats.length >= maxSeats) {
                                alert(`최대 ${maxSeats}개의 좌석만 선택할 수 있습니다.`)
                                return
                              }
                              onSeatClick(seatNumber)
                            }}
                            className={`
                              w-10 h-10 text-xs font-medium rounded border-2 transition-all duration-200 hover:scale-105
                              ${isSelected
                                ? "bg-blue-600 text-white border-blue-700 shadow-lg"
                                : "bg-blue-100 border-blue-300 hover:bg-blue-200 text-gray-800"
                              }
                            `}
                            title={`${seatNumber} (창가)`}
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
                      {Array.from({ length: 14 }, (_, row) => {
                        const seatNumber = `${row + 1}B`
                        const seat = seatData.find(s => s.id === seatNumber) || { isAvailable: true }
                        const isSelected = selectedSeats.includes(seatNumber)
                        
                        return (
                          <button
                            key={row}
                            onClick={() => {
                              const maxSeats = getTotalPassengers()
                              if (!isSelected && selectedSeats.length >= maxSeats) {
                                alert(`최대 ${maxSeats}개의 좌석만 선택할 수 있습니다.`)
                                return
                              }
                              onSeatClick(seatNumber)
                            }}
                            className={`
                              w-10 h-10 text-xs font-medium rounded border-2 transition-all duration-200 hover:scale-105
                              ${isSelected
                                ? "bg-blue-600 text-white border-blue-700 shadow-lg"
                                : "bg-blue-100 border-blue-300 hover:bg-blue-200 text-gray-800"
                              }
                            `}
                            title={`${seatNumber} (통로)`}
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
                        {Array.from({ length: 14 }, (_, row) => {
                          const seatNumber = `${row + 1}C`
                          const seat = seatData.find(s => s.id === seatNumber) || { isAvailable: true }
                          const isSelected = selectedSeats.includes(seatNumber)
                          
                          return (
                            <button
                              key={row}
                              onClick={() => {
                                const maxSeats = getTotalPassengers()
                                if (!isSelected && selectedSeats.length >= maxSeats) {
                                  alert(`최대 ${maxSeats}개의 좌석만 선택할 수 있습니다.`)
                                  return
                                }
                                onSeatClick(seatNumber)
                              }}
                              className={`
                                w-10 h-10 text-xs font-medium rounded border-2 transition-all duration-200 hover:scale-105
                                ${isSelected
                                  ? "bg-blue-600 text-white border-blue-700 shadow-lg"
                                  : "bg-blue-100 border-blue-300 hover:bg-blue-200 text-gray-800"
                                }
                              `}
                              title={`${seatNumber} (통로)`}
                            >
                              {seatNumber}
                            </button>
                          )
                        })}
                      </div>
                    )}
                    
                    {/* D Row (general) or C Row (reserved) */}
                    <div className="flex space-x-2">
                      {Array.from({ length: 14 }, (_, row) => {
                        const seatNumber = `${row + 1}${isReserved ? 'C' : 'D'}`
                        const seat = seatData.find(s => s.id === seatNumber) || { isAvailable: true }
                        const isSelected = selectedSeats.includes(seatNumber)
                        
                        return (
                          <button
                            key={row}
                            onClick={() => {
                              const maxSeats = getTotalPassengers()
                              if (!isSelected && selectedSeats.length >= maxSeats) {
                                alert(`최대 ${maxSeats}개의 좌석만 선택할 수 있습니다.`)
                                return
                              }
                              onSeatClick(seatNumber)
                            }}
                            className={`
                              w-10 h-10 text-xs font-medium rounded border-2 transition-all duration-200 hover:scale-105
                              ${isSelected
                                ? "bg-blue-600 text-white border-blue-700 shadow-lg"
                                : "bg-blue-100 border-blue-300 hover:bg-blue-200 text-gray-800"
                              }
                            `}
                            title={`${seatNumber} (창가)`}
                          >
                            {seatNumber}
                          </button>
                        )
                      })}
                    </div>
                  </div>
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
        </div>

        {/* Dialog Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              선택된 좌석: {selectedSeats.length > 0 ? selectedSeats.join(", ") : "없음"}
            </div>
            <Button
              onClick={() => onApply(selectedSeats, selectedCar)}
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

