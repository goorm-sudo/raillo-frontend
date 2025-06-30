"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Zap } from "lucide-react"

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

interface TrainCardProps {
  train: TrainInfo
  isSelected: boolean
  onSeatSelection: (train: TrainInfo, seatType: SeatType) => void
  getTrainTypeColor: (trainType: string) => string
  formatPrice: (price: number) => string
  getSeatTypeName: (seatType: SeatType) => string
}

export function TrainCard({
  train,
  isSelected,
  onSeatSelection,
  getTrainTypeColor,
  formatPrice,
  getSeatTypeName,
}: TrainCardProps) {
  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${
        isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""
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
                  onClick={() => onSeatSelection(train, "generalSeat")}
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
                  onClick={() => onSeatSelection(train, "reservedSeat")}
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
                  onClick={() => onSeatSelection(train, "standingSeat")}
                >
                  {train.standingSeat.available ? "선택" : "없음"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 