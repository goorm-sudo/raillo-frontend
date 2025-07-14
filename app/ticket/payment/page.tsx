"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label as UILabel } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Train, ChevronLeft, ArrowRight, AlertTriangle, ChevronDown, CreditCard, Lock, Calendar, MapPin, Clock, User } from "lucide-react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { useAuth } from '@/hooks/use-auth'

interface PaymentInfo {
  trainType: string
  trainNumber: string
  date: string
  departureStation: string
  arrivalStation: string
  departureTime: string
  arrivalTime: string
  seatClass: string
  carNumber: number
  seatNumber: string
  price: number
  reservationNumber: string
}

export default function PaymentPage() {
  const router = useRouter()
  const { isAuthenticated, isChecking } = useAuth({ redirectPath: '/ticket/payment' })
  const [paymentMethod, setPaymentMethod] = useState("simple")
  const [simplePaymentType, setSimplePaymentType] = useState("간편현금결제")
  const [cardType, setCardType] = useState("personal")
  const [cardNumber1, setCardNumber1] = useState("")
  const [cardNumber2, setCardNumber2] = useState("")
  const [cardNumber3, setCardNumber3] = useState("")
  const [cardNumber4, setCardNumber4] = useState("")
  const [expiryMonth, setExpiryMonth] = useState("")
  const [expiryYear, setExpiryYear] = useState("2025")
  const [cvv, setCvv] = useState("")
  const [installment, setInstallment] = useState("일시불")
  const [cardPassword, setCardPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phonePrefix, setPhonePrefix] = useState("010")
  const [requestReceipt, setRequestReceipt] = useState(false)
  const [receiptType, setReceiptType] = useState("personal")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeSavePayment, setAgreeSavePayment] = useState(false)
  const [agreePersonalInfo, setAgreePersonalInfo] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)



  // 예약 정보 (실제로는 props나 상태에서 가져옴)
  const paymentInfo: PaymentInfo = {
    trainType: "무궁화호",
    trainNumber: "1304",
    date: "2025년 06월 02일(월)",
    departureStation: "대구",
    arrivalStation: "서울",
    departureTime: "07:14",
    arrivalTime: "11:15",
    seatClass: "일반실",
    carNumber: 2,
    seatNumber: "8",
    price: 20900,
    reservationNumber: "R2025060100001",
  }

  const getTrainTypeColor = (trainType: string) => {
    switch (trainType) {
      case "KTX":
        return "bg-blue-600 text-white"
      case "ITX-새마을":
        return "bg-green-600 text-white"
      case "무궁화호":
        return "bg-red-600 text-white"
      case "ITX-청춘":
        return "bg-purple-600 text-white"
      default:
        return "bg-gray-600 text-white"
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString() + "원"
  }

  // 로그인 상태 확인 중
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로그인 상태를 확인하고 있습니다...</p>
        </div>
        <Footer />
      </div>
    )
  }

  // 로그인되지 않은 경우 (리다이렉트 중)
  if (!isAuthenticated) {
    return null
  }

  const handlePayment = async () => {
    if (!agreeTerms) {
      alert("이용약관에 동의해주세요.")
      return
    }

    if (paymentMethod === "card" && !agreePersonalInfo) {
      alert("개인정보 수집 및 이용동의에 동의해주세요.")
      return
    }

    setIsProcessing(true)

    // 결제 처리 시뮬레이션
    setTimeout(() => {
      setIsProcessing(false)
      alert("결제가 완료되었습니다!")
      router.push("/ticket/complete")
    }, 2000)
  }

  const handleCardNumberChange = (value: string, field: number) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 4)
    switch (field) {
      case 1:
        setCardNumber1(numericValue)
        break
      case 2:
        setCardNumber2(numericValue)
        break
      case 3:
        setCardNumber3(numericValue)
        break
      case 4:
        setCardNumber4(numericValue)
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">승차권 결제</h2>
            <p className="text-gray-600">안전한 결제를 위해 정확한 정보를 입력해주세요</p>
          </div>

          {/* Ticket Information Card */}
          <Card className="mb-6 border-l-4 border-blue-600">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div className="flex items-center space-x-3 mb-2 md:mb-0">
                  <Badge className={`${getTrainTypeColor(paymentInfo.trainType)} px-3 py-1`}>
                    {paymentInfo.trainType}
                  </Badge>
                  <span className="font-bold">{paymentInfo.trainNumber}</span>
                  <span className="text-gray-600">{paymentInfo.date}</span>
                </div>
                <div className="text-xl font-bold text-red-600">{formatPrice(paymentInfo.price)}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{paymentInfo.departureStation}</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{paymentInfo.arrivalStation}</span>
                  <span className="text-gray-600 ml-2">
                    ({paymentInfo.departureTime} ~ {paymentInfo.arrivalTime})
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {paymentInfo.seatClass} | 순방향 | {paymentInfo.carNumber}호차 | {paymentInfo.seatNumber} | 어른
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex flex-col space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">운임:</span>
                    <span className="font-medium text-red-600">{formatPrice(paymentInfo.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">요금:</span>
                    <span>0원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">운임할인:</span>
                    <span>0원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">요금할인:</span>
                    <span>0원</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>합계(1건):</span>
                    <span className="text-red-600">{formatPrice(paymentInfo.price)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Point Usage Section */}
          <Accordion type="single" collapsible className="mb-6">
            <AccordionItem value="points">
              <AccordionTrigger className="bg-white rounded-lg border px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center">
                  <span className="font-bold">포인트 사용</span>
                  <span className="text-sm text-gray-500 ml-2">(한가지만 사용가능)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-white border border-t-0 rounded-b-lg p-6">
                <div className="space-y-4">
                  {/* KTX 마일리지 */}
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="font-medium">KTX 마일리지</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>

                  {/* 레일포인트 */}
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="font-medium">레일포인트</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>

                  {/* 씨티포인트 */}
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="font-medium">씨티포인트</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>

                  {/* OK캐쉬백포인트 */}
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="font-medium">OK캐쉬백포인트</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>

                  {/* L.POINT */}
                  <div className="flex items-center justify-between py-3 border-b">
                    <span className="font-medium">L.POINT</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>

                  <div className="flex justify-end mt-4">
                    <span className="text-sm">
                      포인트 차감(-): <span className="text-red-600 font-medium">0원</span>
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Payment Method Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">결제수단 선택</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger
                    value="simple"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    간편결제
                  </TabsTrigger>
                  <TabsTrigger value="card" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    카드결제
                  </TabsTrigger>
                  <TabsTrigger
                    value="account"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    계좌이체
                  </TabsTrigger>
                </TabsList>

                {/* 간편결제 탭 */}
                <TabsContent value="simple">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
                    <Button
                      variant={simplePaymentType === "간편현금결제" ? "default" : "outline"}
                      onClick={() => setSimplePaymentType("간편현금결제")}
                      className={`${
                        simplePaymentType === "간편현금결제" ? "bg-blue-600 text-white" : ""
                      } justify-center`}
                    >
                      간편현금결제
                    </Button>
                    <Button
                      variant={simplePaymentType === "네이버 페이" ? "default" : "outline"}
                      onClick={() => setSimplePaymentType("네이버 페이")}
                      className={`${simplePaymentType === "네이버 페이" ? "bg-blue-600 text-white" : ""} justify-center`}
                    >
                      네이버 페이
                    </Button>
                    <Button
                      variant={simplePaymentType === "카카오 페이" ? "default" : "outline"}
                      onClick={() => setSimplePaymentType("카카오 페이")}
                      className={`${simplePaymentType === "카카오 페이" ? "bg-blue-600 text-white" : ""} justify-center`}
                    >
                      카카오 페이
                    </Button>
                    <Button
                      variant={simplePaymentType === "PAYCO" ? "default" : "outline"}
                      onClick={() => setSimplePaymentType("PAYCO")}
                      className={`${simplePaymentType === "PAYCO" ? "bg-blue-600 text-white" : ""} justify-center`}
                    >
                      PAYCO
                    </Button>
                    <Button
                      variant={simplePaymentType === "내통장결제" ? "default" : "outline"}
                      onClick={() => setSimplePaymentType("내통장결제")}
                      className={`${simplePaymentType === "내통장결제" ? "bg-blue-600 text-white" : ""} justify-center`}
                    >
                      내통장결제
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="requestReceipt"
                        checked={requestReceipt}
                        onCheckedChange={(checked) => setRequestReceipt(checked === true)}
                        className="data-[state=checked]:bg-blue-600"
                      />
                      <UILabel htmlFor="requestReceipt">현금영수증 신청</UILabel>
                    </div>

                    {requestReceipt && (
                      <>
                        <div className="flex items-center space-x-4">
                          <RadioGroup value={receiptType} onValueChange={setReceiptType} className="flex space-x-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="personal" id="personal" />
                              <UILabel htmlFor="personal">개인</UILabel>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="business" id="business" />
                              <UILabel htmlFor="business">사업자지출증빙</UILabel>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="flex space-x-2">
                          <Select value={phonePrefix} onValueChange={setPhonePrefix}>
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="010">010</SelectItem>
                              <SelectItem value="011">011</SelectItem>
                              <SelectItem value="016">016</SelectItem>
                              <SelectItem value="017">017</SelectItem>
                              <SelectItem value="018">018</SelectItem>
                              <SelectItem value="019">019</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="휴대폰 번호 입력"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                            maxLength={8}
                            className="flex-1"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>

                {/* 카드결제 탭 */}
                <TabsContent value="card">
                  <div className="space-y-6">
                    {/* 카드종류 */}
                    <div className="space-y-3">
                      <UILabel className="text-base font-medium">카드종류</UILabel>
                      <div className="flex space-x-4">
                        <Button
                          variant={cardType === "personal" ? "default" : "outline"}
                          onClick={() => setCardType("personal")}
                          className={`${cardType === "personal" ? "bg-blue-600 text-white" : ""} rounded-full px-6`}
                        >
                          개인카드
                        </Button>
                        <Button
                          variant={cardType === "business" ? "default" : "outline"}
                          onClick={() => setCardType("business")}
                          className={`${cardType === "business" ? "bg-blue-600 text-white" : ""} rounded-full px-6`}
                        >
                          법인카드
                        </Button>
                        <Button
                          variant={cardType === "retry" ? "default" : "outline"}
                          onClick={() => setCardType("retry")}
                          className={`${cardType === "retry" ? "bg-blue-600 text-white" : ""} rounded-full px-6`}
                        >
                          다시입력
                        </Button>
                      </div>
                    </div>

                    {/* 신용카드 번호 */}
                    <div className="space-y-3">
                      <UILabel className="text-base font-medium">신용카드 번호</UILabel>
                      <div className="flex space-x-2">
                        <Input
                          value={cardNumber1}
                          onChange={(e) => handleCardNumberChange(e.target.value, 1)}
                          maxLength={4}
                          className="w-20 text-center bg-blue-50"
                        />
                        <span className="flex items-center">-</span>
                        <Input
                          value={cardNumber2}
                          onChange={(e) => handleCardNumberChange(e.target.value, 2)}
                          maxLength={4}
                          className="w-20 text-center bg-blue-50"
                        />
                        <span className="flex items-center">-</span>
                        <Input
                          value={cardNumber3}
                          onChange={(e) => handleCardNumberChange(e.target.value, 3)}
                          maxLength={4}
                          className="w-20 text-center bg-blue-50"
                        />
                        <span className="flex items-center">-</span>
                        <Input
                          value={cardNumber4}
                          onChange={(e) => handleCardNumberChange(e.target.value, 4)}
                          maxLength={4}
                          className="w-20 text-center bg-blue-50"
                        />
                      </div>
                    </div>

                    {/* 유효기간 */}
                    <div className="space-y-3">
                      <UILabel className="text-base font-medium">유효기간</UILabel>
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="MM"
                          value={expiryMonth}
                          onChange={(e) => setExpiryMonth(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
                          maxLength={2}
                          className="w-20 text-center bg-blue-50"
                        />
                        <span>월</span>
                        <Select value={expiryYear} onValueChange={setExpiryYear}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2027">2027</SelectItem>
                            <SelectItem value="2028">2028</SelectItem>
                            <SelectItem value="2029">2029</SelectItem>
                            <SelectItem value="2030">2030</SelectItem>
                          </SelectContent>
                        </Select>
                        <span>년</span>
                      </div>
                    </div>

                    {/* 인증번호 */}
                    <div className="space-y-3">
                      <UILabel className="text-base font-medium">인증번호</UILabel>
                      <div className="flex space-x-4">
                        <Input
                          placeholder="인증번호를 입력하세요."
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ""))}
                          maxLength={3}
                          className="bg-blue-50"
                        />
                        <span className="text-sm text-gray-600 flex items-center">주민번호 앞 6자리 입력</span>
                      </div>
                    </div>

                    {/* 할부개월 */}
                    <div className="space-y-3">
                      <UILabel className="text-base font-medium">할부개월</UILabel>
                      <Select value={installment} onValueChange={setInstallment}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="일시불">일시불</SelectItem>
                          <SelectItem value="2개월">2개월</SelectItem>
                          <SelectItem value="3개월">3개월</SelectItem>
                          <SelectItem value="6개월">6개월</SelectItem>
                          <SelectItem value="12개월">12개월</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 신용카드 비밀번호 */}
                    <div className="space-y-3">
                      <UILabel className="text-base font-medium">신용카드 비밀번호</UILabel>
                      <div className="flex space-x-4">
                        <Input
                          value={cardPassword}
                          onChange={(e) => setCardPassword(e.target.value.replace(/[^0-9]/g, ""))}
                          maxLength={2}
                          type="password"
                          className="w-20 text-center bg-blue-50"
                        />
                        <span className="text-sm text-gray-600 flex items-center">**(앞 2자리 입력)</span>
                      </div>
                    </div>

                    {/* 개인정보 수집 및 이용동의 */}
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <UILabel className="text-base font-medium">[필수] 개인정보 수집 및 이용동의</UILabel>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="agreePersonalInfo"
                            checked={agreePersonalInfo}
                            onCheckedChange={(checked) => setAgreePersonalInfo(checked === true)}
                          />
                          <UILabel htmlFor="agreePersonalInfo">동의함</UILabel>
                        </div>
                      </div>

                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left border-r">목적</th>
                              <th className="px-4 py-2 text-left border-r">항목</th>
                              <th className="px-4 py-2 text-left">보유기간</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t">
                              <td className="px-4 py-2 border-r">승차권 예매 시</td>
                              <td className="px-4 py-2 border-r">카드번호, 유효기간, 비밀번호, 카드종류</td>
                              <td className="px-4 py-2">사용목적 달성 후 즉시 폐기</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* 계좌이체 탭 */}
                <TabsContent value="account">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">계좌이체 이용안내</h3>
                      <p className="text-gray-600">
                        아래 결제 버튼 클릭 시 팝업으로 오픈된 결제창에 결제정보를 입력하여 진행하시기 바랍니다.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Terms and Payment Button */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="terms" 
                  checked={agreeTerms} 
                  onCheckedChange={(checked) => setAgreeTerms(checked === true)} 
                />
                <UILabel htmlFor="terms" className="text-sm">
                  스마트티켓 발권(RAIL-O톡 어플 이용 시 체크) <span className="text-red-500">*</span>
                </UILabel>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="savePayment" 
                  checked={agreeSavePayment} 
                  onCheckedChange={(checked) => setAgreeSavePayment(checked === true)} 
                />
                <UILabel htmlFor="savePayment" className="text-sm">
                  결제수단 저장(개인정보 및 카드번호, 비밀번호 등은 저장하지 않습니다)
                </UILabel>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <span className="text-lg font-bold">결제하실 금액: </span>
                <span className="text-xl font-bold text-red-600">{formatPrice(paymentInfo.price)}</span>
              </div>
              <Button
                onClick={handlePayment}
                disabled={isProcessing || !agreeTerms}
                className="w-40 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    처리중...
                  </>
                ) : (
                  "결제/발권"
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>결제 진행 중 문제가 발생하면 고객센터(1544-7788)로 문의해주세요.</p>
            </div>
          </div>

          {/* Important Notice */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2 text-sm text-blue-800">
                  <h3 className="font-semibold">결제 시 주의사항</h3>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>결제 완료 후 승차권 변경 및 환불은 출발시간 20분 전까지 가능합니다.</li>
                    <li>결제 제한시간(10분) 내에 결제를 완료하지 않으면 예약이 자동 취소됩니다.</li>
                    <li>카드 정보는 안전하게 암호화되어 전송됩니다.</li>
                    <li>결제 완료 후 승차권은 모바일로 발급됩니다.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
