"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Search, MapPin, X } from "lucide-react"
import { STATIONS, stationUtils, Station } from "@/lib/api/train"

interface StationSelectorProps {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  label: string
}

export function StationSelector({ value, onValueChange, placeholder, label }: StationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStations, setFilteredStations] = useState<Station[]>(STATIONS)

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStations(STATIONS)
    } else {
      const filtered = stationUtils.searchStations(searchTerm)
      setFilteredStations(filtered)
    }
  }, [searchTerm])

  const handleStationSelect = (station: Station) => {
    onValueChange(station.name)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleClose = () => {
    setIsOpen(false)
    setSearchTerm("")
  }

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-blue-100 mb-2">{label}</label>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal bg-white text-gray-900 hover:bg-gray-50"
          onClick={() => setIsOpen(true)}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {value || placeholder}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-0 max-h-[80vh] overflow-hidden [&>button]:hidden">
          <div className="p-4 border-b">
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>{label} 선택</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-10 w-10 p-0 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </DialogTitle>
          </div>

          <div className="p-4">
            {/* 검색 입력 */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="역명을 입력하세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            {/* 역 목록 */}
            <div className="h-[400px] overflow-y-auto">
              {filteredStations.length > 0 ? (
                <div className="space-y-1">
                  {filteredStations.map((station) => (
                    <button
                      key={station.id}
                      onClick={() => handleStationSelect(station)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center space-x-3"
                    >
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900">{station.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 