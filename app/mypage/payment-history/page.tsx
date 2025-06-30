"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Train,
  ChevronLeft,
  ChevronDown,
  User,
  CreditCard,
  Ticket,
  ShoppingCart,
  Settings,
  Star,
  Shield,
  Smartphone,
  Mail,
  Lock,
  Award,
  Calendar,
  Search,
  Receipt,
  Eye,
  Download,
} from "lucide-react"
import { paymentApi } from "@/lib/api/client"
import { getLoginInfo, isTokenExpired } from "@/lib/utils"

interface PaymentHistoryItem {
  paymentId: number;
  reservationId: number;
  externalOrderId: string;
  amountOriginalTotal: number;
  totalDiscountAmountApplied: number;
  mileagePointsUsed: number;
  mileageAmountDeducted: number;
  mileageToEarn: number;
  amountPaid: number;
  paymentStatus: string;
  paymentMethod: string;
  pgProvider: string;
  pgApprovalNo: string;
  paidAt: string;
  createdAt: string;
  mileageSummary?: {
    totalUsed: number;
    totalEarned: number;
    currentBalance: number;
  };
}

interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export default function PaymentHistoryPage() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    ticketInfo: false,
    membershipPerformance: false,
    paymentManagement: true, // 결제관리 섹션을 기본으로 열어둠
    memberInfoManagement: false,
  })

  // 로그인 정보 상태
  const [loginInfo, setLoginInfo] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0], // 6개월 전
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], // 내일 (오늘 결제 포함)
    paymentMethod: 'all',
  })

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // 로그인 정보 확인
  const checkLoginStatus = () => {
    // 강제로 개발용 토큰 설정
    const devToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJURVNUMDAxIiwiaWF0IjoxNzM1MzAzNzMzLCJleHAiOjk5OTk5OTk5OTksInVzZXJJZCI6IjEiLCJ1c2VybmFtZSI6IlRFU1QwMDEifQ.test'
    localStorage.setItem('accessToken', devToken)

    // 개발용 로그인 정보 설정
    const mockLoginInfo = {
      isLoggedIn: true,
      userId: 1,
      username: 'TEST001',
      memberNo: 'RAILLO000001',
      email: 'test001@example.com',
      exp: 99999999999
    }
    
    setLoginInfo(mockLoginInfo)
    setIsLoggedIn(true)
  }

  // 결제 내역 조회
  const fetchPaymentHistory = async () => {
    setLoading(true)
    try {
      if (!isLoggedIn || !loginInfo?.userId) {
        setPaymentHistory({
          payments: [],
          totalElements: 0,
          totalPages: 0,
          currentPage: 0,
          pageSize: 20,
        });
        return;
      }

      const memberId = parseInt(loginInfo.userId.toString());
      const token = localStorage.getItem('accessToken');
      
      // URL 파라미터 구성
      let apiUrl = `http://localhost:8080/api/v1/payments/history?memberId=${memberId}&startDate=${searchParams.startDate}T00:00:00&endDate=${searchParams.endDate}T23:59:59`;
      
      // 결제방법이 "all"이 아닌 경우에만 paymentMethod 파라미터 추가
      if (searchParams.paymentMethod !== 'all') {
        apiUrl += `&paymentMethod=${searchParams.paymentMethod}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setPaymentHistory(data);
    } catch (error) {
      console.error('❌ 결제 내역 조회 실패:', error);
      // 에러 시 빈 데이터로 설정
      setPaymentHistory({
        payments: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 20,
      });
    } finally {
      setLoading(false);
    }
  }

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // 로그인 상태 변경 시 결제 내역 조회
  useEffect(() => {
    if (loginInfo) {
      fetchPaymentHistory();
    }
  }, [loginInfo, isLoggedIn]);

  // 결제 상태에 따른 배지 색상
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'default';
      case 'FAILED':
        return 'destructive';
      case 'PENDING':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  // 결제 방법 표시명
  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'KAKAO_PAY':
        return '카카오페이';
      case 'NAVER_PAY':
        return '네이버페이';
      case 'PAYCO':
        return 'PAYCO';
      case 'CREDIT_CARD':
        return '신용카드';
      case 'BANK_ACCOUNT':
        return '내 통장결제';
      case 'BANK_TRANSFER':
        return '계좌이체';
      default:
        return method;
    }
  }

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Train className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-blue-600">RAIL-O</h1>
              </Link>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Link href="/" className="hover:text-blue-600">
                  홈
                </Link>
                <span>{">"}</span>
                <Link href="/mypage" className="hover:text-blue-600">
                  마이페이지
                </Link>
                <span>{">"}</span>
                <span className="text-blue-600">결제 내역</span>
              </div>
            </div>
            <Link href="/mypage">
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <ChevronLeft className="h-4 w-4" />
                <span>마이페이지</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <div className="lg:w-80">
            {/* Profile Header */}
            <Card className="mb-6 bg-blue-600 text-white">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <Train className="h-16 w-16 mx-auto mb-2 text-white" />
                  <h2 className="text-xl font-bold">RAIL-O</h2>
                  <p className="text-blue-100">마이페이지</p>
                </div>
              </CardContent>
            </Card>

            {/* User Info Card */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    비즈니스
                  </Badge>
                </div>
                <h3 className="font-bold text-lg">
                  {isLoggedIn && loginInfo ? `${loginInfo.username} 회원님` : '게스트 님'}
                </h3>
                <p className="text-sm text-gray-600">마일리지: 10,000P</p>
              </CardContent>
            </Card>

            {/* Navigation Menu */}
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {/* 마이 코레일 */}
                  <Link
                    href="/mypage"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <User className="h-5 w-5 text-gray-600" />
                    <span>마이 RAIL-O</span>
                  </Link>

                  {/* 승차권 정보 */}
                  <Collapsible open={openSections.ticketInfo} onOpenChange={() => toggleSection("ticketInfo")}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Ticket className="h-5 w-5 text-gray-600" />
                        <span>승차권 정보</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          openSections.ticketInfo ? "rotate-180" : ""
                        }`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="bg-gray-50">
                      <Link
                        href="/ticket/purchased"
                        className="flex items-center space-x-3 px-8 py-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <span>승차권 확인</span>
                      </Link>
                      <Link
                        href="/ticket/reservations"
                        className="flex items-center space-x-3 px-8 py-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <span>예약승차권 조회/취소</span>
                      </Link>
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>승차권 구입이력</span>
                      </div>
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>이용내역/영수증조회</span>
                      </div>
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>취소/반환 수수료</span>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 멤버십 실적 조회 */}
                  <Collapsible
                    open={openSections.membershipPerformance}
                    onOpenChange={() => toggleSection("membershipPerformance")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-gray-600" />
                        <span>멤버십 실적 조회</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          openSections.membershipPerformance ? "rotate-180" : ""
                        }`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="bg-gray-50">
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>마일리지 내역</span>
                      </div>
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>등급 혜택</span>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 결제관리 */}
                  <Collapsible
                    open={openSections.paymentManagement}
                    onOpenChange={() => toggleSection("paymentManagement")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <span>결제관리</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          openSections.paymentManagement ? "rotate-180" : ""
                        }`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="bg-gray-50">
                      <Link
                        href="/mypage/payment-history"
                        className="flex items-center space-x-3 px-8 py-2 text-sm text-blue-600 bg-blue-50 border-r-2 border-blue-600"
                      >
                        <span>결제 내역</span>
                      </Link>
                      <Link
                        href="/mypage/saved-payment-methods"
                        className="flex items-center space-x-3 px-8 py-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <span>간편구매정보 등록</span>
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 회원정보관리 */}
                  <Collapsible
                    open={openSections.memberInfoManagement}
                    onOpenChange={() => toggleSection("memberInfoManagement")}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Settings className="h-5 w-5 text-gray-600" />
                        <span>회원정보관리</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          openSections.memberInfoManagement ? "rotate-180" : ""
                        }`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="bg-gray-50">
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>나의 정보 수정</span>
                      </div>
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>비밀번호 변경</span>
                      </div>
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>이메일/휴대폰 인증</span>
                      </div>
                      <div className="px-8 py-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer">
                        <span>회원탈퇴</span>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* 장바구니 */}
                  <Link
                    href="/cart"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5 text-gray-600" />
                    <span>장바구니</span>
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">결제 내역</h1>
            </div>

            {/* 검색 필터 */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>조회 조건</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="startDate">시작일</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={searchParams.startDate}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">종료일</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={searchParams.endDate}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">결제 방법</Label>
                    <Select
                      value={searchParams.paymentMethod}
                      onValueChange={(value) => setSearchParams(prev => ({ ...prev, paymentMethod: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="KAKAO_PAY">카카오페이</SelectItem>
                        <SelectItem value="NAVER_PAY">네이버페이</SelectItem>
                        <SelectItem value="PAYCO">PAYCO</SelectItem>
                        <SelectItem value="CREDIT_CARD">신용카드</SelectItem>
                        <SelectItem value="BANK_ACCOUNT">내 통장결제</SelectItem>
                        <SelectItem value="BANK_TRANSFER">계좌이체</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={fetchPaymentHistory} disabled={loading} className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      {loading ? '조회 중...' : '조회'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 결제 내역 테이블 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Receipt className="h-5 w-5" />
                    <span>결제 내역</span>
                  </div>
                  {paymentHistory && (
                    <Badge variant="outline">
                      총 {paymentHistory.totalElements}건
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">결제 내역을 조회하고 있습니다...</p>
                  </div>
                ) : paymentHistory && paymentHistory.payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>결제일시</TableHead>
                          <TableHead>예약번호</TableHead>
                          <TableHead>결제방법</TableHead>
                          <TableHead>결제금액</TableHead>
                          <TableHead>마일리지</TableHead>
                          <TableHead>상태</TableHead>
                          <TableHead>상세</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentHistory.payments.map((payment) => (
                          <TableRow key={payment.paymentId}>
                            <TableCell>
                              <div className="text-sm">
                                <div>{formatDate(payment.paidAt)}</div>
                                <div className="text-gray-500 text-xs">
                                  주문: {payment.externalOrderId}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                R{payment.reservationId.toString().padStart(13, '0')}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{getPaymentMethodDisplay(payment.paymentMethod)}</div>
                                {payment.pgProvider && (
                                  <div className="text-gray-500 text-xs">
                                    {payment.pgProvider}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div className="font-medium">
                                  {formatAmount(payment.amountPaid)}원
                                </div>
                                {payment.totalDiscountAmountApplied > 0 && (
                                  <div className="text-green-600 text-xs">
                                    할인: -{formatAmount(payment.totalDiscountAmountApplied)}원
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {payment.mileagePointsUsed > 0 && (
                                  <div className="text-red-600 text-xs">
                                    사용: -{formatAmount(payment.mileagePointsUsed)}P
                                  </div>
                                )}
                                {payment.mileageToEarn > 0 && (
                                  <div className="text-blue-600 text-xs">
                                    적립: +{formatAmount(payment.mileageToEarn)}P
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(payment.paymentStatus)}>
                                {payment.paymentStatus === 'SUCCESS' ? '결제완료' : 
                                 payment.paymentStatus === 'FAILED' ? '결제실패' : 
                                 payment.paymentStatus === 'PENDING' ? '결제대기' : payment.paymentStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // 결제 상세 정보 조회 로직 추가 예정
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                상세
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Receipt className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">결제 내역이 없습니다</h3>
                    <p className="text-gray-600">
                      선택하신 기간 동안의 결제 내역이 없습니다.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 