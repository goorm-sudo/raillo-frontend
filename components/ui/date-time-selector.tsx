"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { format, addMonths, startOfDay, isBefore, isSameDay } from "date-fns"
import { ko } from "date-fns/locale"
import { CalendarIcon, X, ChevronLeft, ChevronRight, Clock } from "lucide-react"

interface DateTimeSelectorProps {
  value: Date | undefined
  onValueChange: (date: Date) => void
  placeholder: string
  label: string
}

export function DateTimeSelector({ value, onValueChange, placeholder, label }: DateTimeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tempDate, setTempDate] = useState<Date>(value || new Date())
  const [selectedHour, setSelectedHour] = useState<string>(
    value ? value.getHours().toString().padStart(2, '0') + '시' : new Date().getHours().toString().padStart(2, '0') + '시'
  )

  // 오늘 날짜 (시간 제외)
  const today = startOfDay(new Date())
  
  // 한 달 후 날짜 (오늘부터 정확히 한 달 뒤)
  const oneMonthLater = addMonths(today, 1)

  // 시간 옵션 (00시 ~ 23시)
  const hourOptions = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0') + '시'
  )

  // 현재 시간이 선택된 날짜의 과거인지 확인
  const isPastTime = (date: Date, hour: string) => {
    const selectedDateTime = new Date(date)
    selectedDateTime.setHours(parseInt(hour), 0, 0, 0)
    return isBefore(selectedDateTime, new Date())
  }

  // 날짜 선택 가능 여부 확인
  const isDateSelectable = (date: Date) => {
    return !isBefore(date, today) && !isBefore(oneMonthLater, date)
  }

  // 시간 선택 가능 여부 확인
  const isHourSelectable = (hour: string) => {
    if (isSameDay(tempDate, today)) {
      return !isPastTime(tempDate, hour)
    }
    return true
  }

  // 달력 그리드 생성
  const generateCalendarDays = () => {
    const year = tempDate.getFullYear()
    const month = tempDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)

      const isCurrentMonth = currentDate.getMonth() === month
      const isToday = isSameDay(currentDate, today)
      const isSelected = isSameDay(currentDate, tempDate)
      const isSelectable = isDateSelectable(currentDate)
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6

      days.push(
        <button
          key={i}
          onClick={() => {
            if (isSelectable && isCurrentMonth) {
              setTempDate(new Date(currentDate))
            }
          }}
          disabled={!isSelectable || !isCurrentMonth}
          className={`
            p-2 text-sm transition-colors relative h-9
            ${
              isCurrentMonth
                ? isSelectable
                  ? isSelected
                    ? "bg-blue-600 text-white font-semibold"
                    : isToday
                      ? "bg-blue-100 text-blue-600 font-semibold hover:bg-blue-200"
                      : isWeekend
                        ? currentDate.getDay() === 0
                          ? "text-red-500 hover:bg-red-50"
                          : "text-blue-500 hover:bg-blue-50"
                        : "text-gray-900 hover:bg-gray-100"
                  : "text-gray-300 cursor-not-allowed"
                : "text-gray-300"
            }
          `}
        >
          {currentDate.getDate()}
        </button>
      )
    }

    return days
  }

  const handleApply = () => {
    const selectedDateTime = new Date(tempDate)
    selectedDateTime.setHours(parseInt(selectedHour), 0, 0, 0)
    onValueChange(selectedDateTime)
    setIsOpen(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    // 원래 값으로 복원
    setTempDate(value || new Date())
    setSelectedHour(
      value ? value.getHours().toString().padStart(2, '0') + '시' : new Date().getHours().toString().padStart(2, '0') + '시'
    )
  }

  // value가 변경될 때 tempDate 초기화
  useEffect(() => {
    if (value) {
      setTempDate(value)
      setSelectedHour(value.getHours().toString().padStart(2, '0') + '시')
    }
  }, [value])

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-blue-100 mb-2">{label}</label>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal bg-white text-gray-900 hover:bg-gray-50"
          onClick={() => setIsOpen(true)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "MM/dd HH시", { locale: ko }) : placeholder}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-0 max-h-[90vh] overflow-hidden [&>button]:hidden">
          <div className="p-4 border-b">
            <DialogTitle className="text-xl font-bold flex items-center justify-between">
              <span>날짜 선택</span>
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

          <div className="p-4 max-h-[calc(90vh-140px)] overflow-y-auto">
            {/* 선택된 날짜/시간 표시 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 text-center border border-blue-100">
              <div className="text-lg font-semibold text-gray-800 mb-2">
                {format(tempDate, "yyyy년 MM월 dd일(E)", { locale: ko })}
              </div>
              <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Clock className="h-3 w-3 mr-1" />
                {selectedHour} 출발
              </div>
            </div>

            {/* 달력 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <button
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                  onClick={() => {
                    const prevMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() - 1, 1)
                    setTempDate(prevMonth)
                  }}
                  disabled={tempDate.getMonth() === today.getMonth() && tempDate.getFullYear() === today.getFullYear()}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-bold">{format(tempDate, "yyyy. MM.", { locale: ko })}</h3>
                <button
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                  onClick={() => {
                    const nextMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 1)
                    setTempDate(nextMonth)
                  }}
                  disabled={isBefore(oneMonthLater, new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 1))}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 bg-gray-50">
                {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
                  <div
                    key={day}
                    className={`p-2 text-center text-sm font-medium h-9 flex items-center justify-center ${
                      index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-gray-700"
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 달력 그리드 */}
              <div className="grid grid-cols-7 border rounded-lg overflow-hidden bg-white">
                {generateCalendarDays()}
              </div>
            </div>

            {/* 시간 선택 */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-3">시간 선택</h4>
              <div className="w-full overflow-x-auto">
                <div className="flex gap-2 min-w-max pb-2">
                  {hourOptions.map((hour) => (
                    <Button
                      key={hour}
                      variant={selectedHour === hour ? "default" : "outline"}
                      size="sm"
                      className={`text-sm py-1 px-2 h-8 min-w-[50px] ${
                        selectedHour === hour ? "bg-blue-600" : ""
                      } ${
                        !isHourSelectable(hour) ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      onClick={() => {
                        if (isHourSelectable(hour)) {
                          setSelectedHour(hour)
                        }
                      }}
                      disabled={!isHourSelectable(hour)}
                    >
                      {hour}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex border-t p-4 bg-white">
            <Button variant="outline" onClick={handleClose} className="flex-1 mr-2">
              취소
            </Button>
            <Button
              onClick={handleApply}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              적용
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 