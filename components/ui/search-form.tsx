"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight } from "lucide-react"
import { DateTimeSelector } from "@/components/ui/date-time-selector"
import { PassengerSelector } from "@/components/ui/passenger-selector"
import { StationSelector } from "@/components/ui/station-selector"
import { format } from "date-fns"

interface PassengerCounts {
  adult: number
  child: number
  infant: number
  senior: number
  severelydisabled: number
  mildlydisabled: number
  veteran: number
}

interface SearchData {
  departureStation: string
  arrivalStation: string
  departureDate: string
  departureHour: string
  passengers: PassengerCounts
}

interface SearchFormProps {
  searchData: SearchData | null
  departureStation: string
  arrivalStation: string
  date: Date | undefined
  passengerCounts: PassengerCounts
  searchConditionsChanged: boolean
  onDepartureStationChange: (station: string) => void
  onArrivalStationChange: (station: string) => void
  onDateChange: (date: Date) => void
  onPassengerChange: (passengers: PassengerCounts) => void
  onSearch: () => void
  onBothStationsChange?: (departure: string, arrival: string) => void
}

export function SearchForm({
  searchData,
  departureStation,
  arrivalStation,
  date,
  passengerCounts,
  searchConditionsChanged,
  onDepartureStationChange,
  onArrivalStationChange,
  onDateChange,
  onPassengerChange,
  onSearch,
  onBothStationsChange,
}: SearchFormProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* 출발역 선택 */}
            <div className="flex items-center">
              <StationSelector
                value={searchData?.departureStation || departureStation}
                onValueChange={onDepartureStationChange}
                placeholder="출발역 선택"
                label=""
                otherStation={searchData?.arrivalStation || arrivalStation}
                onBothStationsChange={onBothStationsChange || ((departure, arrival) => {
                  onDepartureStationChange(departure)
                  onArrivalStationChange(arrival)
                })}
              />
            </div>

            <ArrowRight className="h-4 w-4 text-gray-400" />

            {/* 도착역 선택 */}
            <div className="flex items-center">
              <StationSelector
                value={searchData?.arrivalStation || arrivalStation}
                onValueChange={onArrivalStationChange}
                placeholder="도착역 선택"
                label=""
                otherStation={searchData?.departureStation || departureStation}
                onBothStationsChange={onBothStationsChange || ((departure, arrival) => {
                  onDepartureStationChange(departure)
                  onArrivalStationChange(arrival)
                })}
              />
            </div>

            <Separator orientation="vertical" className="hidden md:block h-6" />

            {/* Date Selection */}
            <div className="flex items-center">
              <DateTimeSelector
                value={
                  searchData?.departureDate 
                    ? (() => {
                        const dateWithTime = new Date(searchData.departureDate)
                        if (searchData.departureHour) {
                          dateWithTime.setHours(parseInt(searchData.departureHour), 0, 0, 0)
                        }
                        return dateWithTime
                      })()
                    : date
                }
                onValueChange={onDateChange}
                placeholder="날짜 선택"
                label=""
              />
            </div>

            <Separator orientation="vertical" className="hidden md:block h-6" />

            {/* Passenger Selection */}
            <div className="flex items-center">
              <PassengerSelector
                value={searchData?.passengers || passengerCounts}
                onValueChange={onPassengerChange}
                placeholder="인원 선택"
                label=""
                simple={false}
              />
            </div>
          </div>

          <Button 
            onClick={onSearch} 
            variant={searchConditionsChanged ? "default" : "outline"}
            className={searchConditionsChanged ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
          >
            {searchConditionsChanged ? "검색 조건 적용" : "검색하기"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 