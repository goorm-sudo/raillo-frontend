"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Train, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { TrainCard } from "./train-card"

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

interface TrainListProps {
  displayedTrains: TrainInfo[]
  totalResults: number
  filteredTrains: TrainInfo[]
  selectedTrain: TrainInfo | null
  loadingMore: boolean
  hasMoreTrains: boolean
  onSeatSelection: (train: TrainInfo, seatType: SeatType) => void
  onLoadMore: () => void
  getTrainTypeColor: (trainType: string) => string
  formatPrice: (price: number) => string
  getSeatTypeName: (seatType: SeatType) => string
}

export function TrainList({
  displayedTrains,
  totalResults,
  filteredTrains,
  selectedTrain,
  loadingMore,
  hasMoreTrains,
  onSeatSelection,
  onLoadMore,
  getTrainTypeColor,
  formatPrice,
  getSeatTypeName,
}: TrainListProps) {
  const router = useRouter()

  if (displayedTrains.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Train className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-600 mb-4">선택하신 조건에 맞는 열차가 없습니다.</p>
          <Button onClick={() => router.push("/")} variant="outline">
            다시 검색하기
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {displayedTrains.map((train) => (
        <TrainCard
          key={train.id}
          train={train}
          isSelected={selectedTrain?.id === train.id}
          onSeatSelection={onSeatSelection}
          getTrainTypeColor={getTrainTypeColor}
          formatPrice={formatPrice}
          getSeatTypeName={getSeatTypeName}
        />
      ))}

      {/* Load More Button */}
      {hasMoreTrains && (
        <div className="text-center py-6">
          <Button
            onClick={onLoadMore}
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
                더보기 ({totalResults - displayedTrains.length}개 더)
              </>
            )}
          </Button>
        </div>
      )}
    </>
  )
} 