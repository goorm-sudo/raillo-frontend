"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Train,
  ChevronLeft,
  ShoppingCart,
  Trash2,
  CreditCard,
  ArrowRight,
  MapPin,
  Clock,
  AlertTriangle,
} from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getCart, deleteReservation } from '@/lib/api/booking'
import { handleError } from '@/lib/utils/errorHandler'
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface CartItem {
  reservationId: number
  reservationCode: string
  trainNumber: string
  trainName: string
  departureStationName: string
  arrivalStationName: string
  departureTime: string
  arrivalTime: string
  operationDate: string
  expiresAt: string
  seats: {
    seatReservationId: number
    passengerType: string
    carNumber: number
    carType: string
    seatNumber: string
    baseFare: number
    fare: number
  }[]
  selected: boolean
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)

  // 장바구니 데이터 로드
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true)
        const response = await getCart()
        console.log('Cart response:', response)
        if (response.result && Array.isArray(response.result)) {
          const itemsWithSelection = (response.result as any[]).map((item: any) => ({
            ...item,
            selected: true // 기본적으로 모든 항목 선택
          }))
          setCartItems(itemsWithSelection)
        } else {
          setError('장바구니를 불러올 수 없습니다.')
        }
      } catch (err) {
        const errorMessage = handleError(err, '장바구니 조회 중 오류가 발생했습니다.', false)
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchCart()
  }, [])



  const getTrainTypeColor = (trainName: string) => {
    switch (trainName) {
      case "KTX":
        return "bg-blue-600 text-white"
      case "ITX-새마을":
        return "bg-green-600 text-white"
      case "무궁화호":
        return "bg-orange-600 text-white"
      case "ITX-청춘":
        return "bg-purple-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString() + "원"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, "yyyy년 MM월 dd일(EEEE)", { locale: ko })
  }

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5) // "HH:mm" 형식으로 변환
  }

  const getTotalPrice = (item: CartItem) => {
    return item.seats.reduce((total, seat) => total + seat.fare, 0)
  }

  const toggleItemSelection = (reservationId: number) => {
    setCartItems((prev) => prev.map((item) => 
      item.reservationId === reservationId ? { ...item, selected: !item.selected } : item
    ))
  }

  const toggleAllSelection = () => {
    const allSelected = cartItems.every((item) => item.selected)
    setCartItems((prev) => prev.map((item) => ({ ...item, selected: !allSelected })))
  }

  const handleDeleteItem = (reservationId: number) => {
    setItemToDelete(reservationId)
    setShowDeleteDialog(true)
  }

  const confirmDeleteItem = async () => {
    if (itemToDelete) {
      try {
        await deleteReservation(itemToDelete)
        setCartItems((prev) => prev.filter((item) => item.reservationId !== itemToDelete))
        setItemToDelete(null)
      } catch (e: any) {
        handleError(e, '장바구니에서 삭제 중 오류가 발생했습니다.')
      }
    }
    setShowDeleteDialog(false)
  }

  const handleDeleteSelected = () => {
    const hasSelected = cartItems.some((item) => item.selected)
    if (!hasSelected) {
      alert("삭제할 항목을 선택해주세요.")
      return
    }
    setShowDeleteAllDialog(true)
  }

  const confirmDeleteSelected = async () => {
    try {
      const selectedItems = cartItems.filter((item) => item.selected)
      // 선택된 모든 항목을 병렬로 삭제
      await Promise.all(selectedItems.map(item => deleteReservation(item.reservationId)))
      setCartItems((prev) => prev.filter((item) => !item.selected))
      setShowDeleteAllDialog(false)
    } catch (e: any) {
      handleError(e, '선택한 항목들을 삭제 중 오류가 발생했습니다.')
    }
  }

  const handlePayment = () => {
    const selectedItems = cartItems.filter((item) => item.selected)
    if (selectedItems.length === 0) {
      alert("결제할 항목을 선택해주세요.")
      return
    }
    router.push("/ticket/payment")
  }

  const selectedItems = cartItems.filter((item) => item.selected)
  const totalPrice = selectedItems.reduce((sum, item) => sum + getTotalPrice(item), 0)
  const allSelected = cartItems.length > 0 && cartItems.every((item) => item.selected)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">장바구니를 불러오고 있습니다...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-red-600 mb-4">
            <p className="text-lg font-semibold">장바구니를 불러올 수 없습니다</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={() => router.push('/')} variant="outline">
            홈으로 돌아가기
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">장바구니</h2>
            <p className="text-gray-600">선택한 승차권을 확인하고 결제하세요</p>
          </div>

          {cartItems.length === 0 ? (
            /* Empty Cart */
            <Card>
              <CardContent className="p-12 text-center">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">장바구니가 비어있습니다</h3>
                <p className="text-gray-600 mb-6">승차권을 예매하고 장바구니에 담아보세요.</p>
                <Link href="/ticket/search">
                  <Button className="bg-blue-600 hover:bg-blue-700">승차권 예매하기</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-3 space-y-4">
                {/* Cart Header */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={toggleAllSelection}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <span className="font-medium">
                          전체선택 ({selectedItems.length}/{cartItems.length})
                        </span>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleDeleteSelected}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        선택삭제
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Cart Items List */}
                {cartItems.map((item) => {
                  const isExpired = new Date(item.expiresAt) < new Date();
                  return (
                    <Card key={item.reservationId} className={`${item.selected ? "ring-2 ring-blue-500 bg-blue-50" : ""} ${isExpired ? "ring-2 ring-red-500 bg-red-50" : ""}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={() => toggleItemSelection(item.reservationId)}
                          className="mt-1 data-[state=checked]:bg-blue-600"
                        />

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <Badge className={`${getTrainTypeColor(item.trainName)} px-3 py-1`}>
                                {item.trainName}
                              </Badge>
                              <span className="text-lg font-bold">{item.trainNumber}</span>
                              <span className="text-gray-600">{formatDate(item.operationDate)}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.reservationId)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Route Info */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                운행 정보
                              </h4>
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">{item.departureStationName}</span>
                                  <ArrowRight className="h-3 w-3 text-gray-400" />
                                  <span className="font-medium">{item.arrivalStationName}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatTime(item.departureTime)} ~ {formatTime(item.arrivalTime)}
                                </div>
                              </div>
                            </div>

                            {/* Seat Info */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">좌석 정보</h4>
                              <div className="text-sm">
                                <div className="font-medium">
                                  {item.seats[0].carType === "FIRST_CLASS" ? "특실" : "일반실"}
                                </div>
                                <div className="text-gray-600">
                                  {item.seats.length}매
                                </div>
                              </div>
                            </div>

                            {/* Price Info */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">요금</h4>
                              <div className="text-xl font-bold text-blue-600">{formatPrice(getTotalPrice(item))}</div>
                            </div>
                          </div>

                          {/* Reservation Number & Expiry */}
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-500">예약번호: {item.reservationCode}</div>
                              <div className="text-right">
                                <div className="text-sm text-red-600 font-semibold">
                                  결제기한: {format(new Date(item.expiresAt), "MM월 dd일 HH:mm", { locale: ko })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              </div>

              {/* Payment Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>결제 정보</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Selected Items Summary */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">선택된 항목</h4>
                      <div className="space-y-2">
                        {selectedItems.length === 0 ? (
                          <p className="text-sm text-gray-500">선택된 항목이 없습니다</p>
                        ) : (
                          selectedItems.map((item) => (
                            <div key={item.reservationId} className="text-sm">
                              <div className="flex justify-between">
                                <span>
                                  {item.trainName} {item.trainNumber}
                                </span>
                                <span>{formatPrice(getTotalPrice(item))}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Price Summary */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>승차권 요금</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>수수료</span>
                        <span>0원</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>총 결제금액</span>
                        <span className="text-blue-600">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Payment Notice */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-yellow-800">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">결제 안내</span>
                      </div>
                      <div className="text-xs text-yellow-700 mt-1">
                        장바구니 항목은 결제 전까지 임시 예약 상태입니다
                      </div>
                    </div>

                    {/* Payment Button */}
                    <Button
                      onClick={handlePayment}
                      disabled={selectedItems.length === 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
                      size="lg"
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      {selectedItems.length > 0 ? `${formatPrice(totalPrice)} 결제하기` : "항목을 선택하세요"}
                    </Button>

                    {/* Continue Shopping */}
                    <Link href="/ticket/search">
                      <Button variant="outline" className="w-full">
                        승차권 추가 예매
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Notice */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2 text-sm text-blue-800">
                  <h3 className="font-semibold">장바구니 이용 안내</h3>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>장바구니에 담긴 승차권은 임시 예약 상태로, 결제 완료 시 정식 예약됩니다.</li>
                    <li>장바구니 항목은 24시간 후 자동으로 삭제됩니다.</li>
                    <li>동일한 열차의 좌석은 선착순으로 배정되므로 빠른 결제를 권장합니다.</li>
                    <li>여러 승차권을 한 번에 결제할 수 있어 편리합니다.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Delete Item Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>항목 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 승차권을 장바구니에서 삭제하시겠습니까?
              <br />
              삭제된 항목은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteItem} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Selected Dialog */}
      <AlertDialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>선택 항목 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 모든 승차권을 장바구니에서 삭제하시겠습니까?
              <br />
              삭제된 항목들은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSelected} className="bg-red-600 hover:bg-red-700">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  )
}
