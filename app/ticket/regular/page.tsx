"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Train, Calendar, MapPin, Clock, ArrowRight, ChevronLeft, CreditCard, Users, Home, ChevronRight, Printer } from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

export default function RegularTicketPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("commuter")
  const [ticketType, setTicketType] = useState("30days")
  const [departureStation, setDepartureStation] = useState("")
  const [arrivalStation, setArrivalStation] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [passengerType, setPassengerType] = useState("adult")
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [email, setEmail] = useState("")

  // 주요 기차역 목록
  const stations = [
    "서울",
    "용산",
    "영등포",
    "수원",
    "천안아산",
    "대전",
    "김천구미",
    "동대구",
    "신경주",
    "울산",
    "부산",
    "광주송정",
    "목포",
    "여수엑스포",
    "강릉",
    "정동진",
    "춘천",
    "원주",
    "제천",
    "안동",
    "포항",
    "경주",
    "마산",
    "진주",
    "순천",
    "여수",
  ]

  const handleSearch = () => {
    if (!departureStation || !arrivalStation || !startDate) {
      alert("출발역, 도착역, 시작일을 모두 선택해주세요.")
      return
    }

    // 실제로는 API 호출 후 결과 처리
    alert("정기승차권 조회를 시작합니다.")
  }

  const handlePurchase = () => {
    if (!departureStation || !arrivalStation || !startDate || !name || !phoneNumber) {
      alert("필수 정보를 모두 입력해주세요.")
      return
    }

    // 실제로는 API 호출 후 결과 처리
    alert("정기승차권 구매가 완료되었습니다.")
  }

  const getTicketTypePrice = () => {
    switch (ticketType) {
      case "30days":
        return activeTab === "commuter" ? "180,000원" : "144,000원"
      case "60days":
        return activeTab === "commuter" ? "342,000원" : "273,600원"
      case "90days":
        return activeTab === "commuter" ? "486,000원" : "388,800원"
      default:
        return "180,000원"
    }
  }

  const getTicketTypeDiscount = () => {
    switch (ticketType) {
      case "30days":
        return "0%"
      case "60days":
        return "5%"
      case "90days":
        return "10%"
      default:
        return "0%"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Blue Header Section */}
      <div className="bg-blue-500 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold">정기승차권</h1>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Home className="h-4 w-4" />
              <Link href="/" className="hover:text-blue-600">
                홈
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span>예매</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-blue-600">정기승차권</span>
            </div>
            <Button variant="ghost" size="sm">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Section Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-8">정기권</h2>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 기간자유형 정기권 */}
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">기간자유형 정기권</h3>
                    <p className="text-red-600 font-semibold text-lg mb-6">40% ~ 60%</p>

                    <div className="flex space-x-3">
                      <Button variant="outline" className="rounded-full px-6">
                        상품안내
                      </Button>
                      <Link href="/ticket/regular/booking">
                        <Button variant="outline" className="rounded-full px-6">
                          승차권 예매
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="ml-6">
                    <div className="w-32 h-24 bg-blue-100 rounded-lg flex items-center justify-center">
                      <div className="w-20 h-16 bg-blue-200 rounded border-2 border-blue-300 relative">
                        <div className="absolute top-1 left-1 right-1 h-2 bg-blue-400 rounded-sm"></div>
                        <div className="absolute bottom-2 left-2 right-2 space-y-1">
                          <div className="h-1 bg-blue-300 rounded"></div>
                          <div className="h-1 bg-blue-300 rounded w-3/4"></div>
                          <div className="h-1 bg-blue-300 rounded w-1/2"></div>
                        </div>
                        <div className="absolute -top-1 right-2 w-2 h-3 bg-yellow-400 rounded-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 일반정기권 */}
            <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">일반정기권</h3>
                    <p className="text-red-600 font-semibold text-lg mb-6">최대 할인 60%</p>

                    <div className="flex space-x-3">
                      <Button variant="outline" className="rounded-full px-6">
                        상품안내
                      </Button>
                      <Link href="/ticket/regular/general">
                        <Button variant="outline" className="rounded-full px-6">
                          승차권 예매
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="ml-6">
                    <div className="w-32 h-24 bg-purple-100 rounded-lg flex items-center justify-center">
                      <div className="relative">
                        {/* Train body */}
                        <div className="w-20 h-12 bg-white rounded-lg border-2 border-gray-300 relative">
                          {/* Train stripes */}
                          <div className="absolute top-2 left-1 right-1 h-1 bg-blue-600 rounded"></div>
                          <div className="absolute bottom-2 left-1 right-1 h-1 bg-blue-600 rounded"></div>
                          {/* Windows */}
                          <div className="absolute top-3 left-2 w-3 h-2 bg-blue-200 rounded-sm"></div>
                          <div className="absolute top-3 right-2 w-3 h-2 bg-blue-200 rounded-sm"></div>
                          {/* Front */}
                          <div className="absolute -left-1 top-1 bottom-1 w-2 bg-gray-400 rounded-l-lg"></div>
                          {/* Yellow circle */}
                          <div className="absolute left-0 top-4 w-2 h-2 bg-yellow-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
