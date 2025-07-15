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
  TestTube,
  Clock,
} from "lucide-react"
import { paymentHistoryApi } from "@/lib/api/client"
import { getLoginInfo, isTokenExpired } from "@/lib/utils"
import { useRouter } from "next/navigation"
import UserInfoCard from "@/components/mypage/UserInfoCard"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

interface PaymentHistoryItem {
  paymentId: number;
  reservationId: number;
  externalOrderId: string;
  trainScheduleId?: number;
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
  hasRefund: boolean;
  refundStatus?: string;
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
  const router = useRouter()
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    ticketInfo: false,
    membershipPerformance: false,
    paymentManagement: true, // 결제관리 섹션을 기본으로 열어둠
    memberInfoManagement: false,
  })

  // 로그인 정보 상태
  const [loginInfo, setLoginInfo] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  // 마일리지 상태 추가
  const [currentMileage, setCurrentMileage] = useState(0)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchParams, setSearchParams] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0], // 6개월 전
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], // 내일 (오늘 결제 포함)
    paymentMethod: 'all',
  })

  // 테스트 모달 상태
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentHistoryItem | null>(null)
  const [testMode, setTestMode] = useState<'ontime' | 'delay'>('ontime')
  const [delayMinutes, setDelayMinutes] = useState(0)
  const [trainScheduleId, setTrainScheduleId] = useState('')
  const [testLoading, setTestLoading] = useState(false)

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // 로그인 정보 확인
  const checkLoginStatus = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      
      if (!accessToken) {
        setIsLoggedIn(false)
        setLoginInfo(null)
        return
      }

      // JWT 토큰에서 사용자 정보 추출
      try {
        const tokenParts = accessToken.split('.')
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]))
          
          // 토큰이 만료되지 않았는지 확인
          const currentTime = Math.floor(Date.now() / 1000)
          if (payload.exp && payload.exp > currentTime) {
            // 실제 JWT 토큰에서 사용자 정보 설정
            const loginData = {
              isLoggedIn: true,
              userId: payload.sub || "guest_user", // memberNo를 userId로 사용
              username: payload.sub || "Unknown",
              memberNo: payload.sub || "Unknown",
              email: payload.email || "unknown@raillo.com",
              role: payload.auth || payload.role || "MEMBER",
              exp: payload.exp
            }
            
            // 디버깅용 로그
            console.log('Login Info:', loginData)
            console.log('User Role:', loginData.role)
            console.log('JWT Payload:', payload)
            
            setLoginInfo(loginData)
            setIsLoggedIn(true)
          } else {
            // 토큰이 만료되었으면 전역 로그아웃
            const { handleSessionExpiry } = await import('@/lib/auth')
            handleSessionExpiry()
          }
        } else {
          throw new Error("잘못된 토큰 형식")
        }
      } catch (error) {
        // JWT 토큰 파싱 에러
        const { handleSessionExpiry } = await import('@/lib/auth')
        handleSessionExpiry()
      }
    } catch (error) {
      // 로그인 상태 확인 에러
      setIsLoggedIn(false)
      setLoginInfo(null)
    }
  }

  // 컴포넌트 마운트 시 로그인 상태 확인
  useEffect(() => {
    const initializeAuth = async () => {
      // localStorage에서 바로 사용자 정보 읽기 (깜빡임 방지)
      const storedToken = localStorage.getItem('accessToken')
      if (storedToken) {
        try {
          const tokenParts = storedToken.split('.')
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]))
            const currentTime = Math.floor(Date.now() / 1000)
            if (payload.exp && payload.exp > currentTime) {
              const tempLoginData = {
                isLoggedIn: true,
                userId: payload.sub || "guest_user", // memberNo를 userId로 사용
                username: payload.sub || "Unknown",
                memberNo: payload.sub || "Unknown",
                email: payload.email || "unknown@raillo.com",
                role: payload.auth || payload.role || "MEMBER",
                exp: payload.exp
              }
              setLoginInfo(tempLoginData)
              setIsLoggedIn(true)
            }
          }
        } catch (error) {
          // Token parsing error
        }
      }
      
      // 전역 토큰 검증 함수 사용
      const checkAuth = async () => {
        const { tokenManager } = await import('@/lib/auth')
        
        if (!tokenManager.isAuthenticated()) {
          // 토큰이 없거나 만료된 경우 로그인 페이지로 리다이렉트
          router.push('/login')
          return
        }
        
        // 토큰이 유효하면 로그인 상태 설정
        await checkLoginStatus()
      }
      
      await checkAuth()
      
      // 초기 로딩 종료
      setTimeout(() => {
        setIsInitialLoading(false)
      }, 300)
    }
    
    initializeAuth()
  }, [])

  // 로그인 상태 변경 시 결제 내역 조회
  useEffect(() => {
    if (isLoggedIn && !isInitialLoading) {
      fetchPaymentHistory()
      fetchMileageInfo() // 마일리지 정보도 함께 조회
    }
  }, [isLoggedIn, searchParams, isInitialLoading])

  // 결제 내역 조회
  const fetchPaymentHistory = async () => {
    setLoading(true)
    try {
      if (!isLoggedIn) {
        setPaymentHistory({
          payments: [],
          totalElements: 0,
          totalPages: 0,
          currentPage: 0,
          pageSize: 20,
        });
        return;
      }

      // 올바른 API 호출 (JWT에서 memberId 자동 추출)
      let response;
      
      if (searchParams.paymentMethod === 'all') {
        // 전체 결제 내역 조회
        response = await paymentHistoryApi.getMemberPaymentHistory(0, 20);
      } else {
        // 기간별 조회 (결제방법 필터 포함)
        const startDateTime = `${searchParams.startDate}T00:00:00`;
        const endDateTime = `${searchParams.endDate}T23:59:59`;
        
        response = await paymentHistoryApi.getMemberPaymentHistoryByDateRange(
          startDateTime,
          endDateTime,
          searchParams.paymentMethod,
          0,
          20
        );
      }
      
      setPaymentHistory(response.result || response);
      
    } catch (error) {
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

  // 마일리지 정보 조회 함수 추가
  const fetchMileageInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        console.warn('토큰이 없어 마일리지 조회를 건너뜁니다')
        return
      }

      const { mileageApi } = await import('@/lib/api/client')
      const response = await mileageApi.getMileageBalance()
      
      if (response && response.result) {
        const { currentBalance } = response.result
        setCurrentMileage(currentBalance)
        
      } else {
        setCurrentMileage(0)
      }
    } catch (error) {
      setCurrentMileage(0)
    }
  }

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

  // 환불 가능 여부 확인
  const isRefundable = (payment: PaymentHistoryItem) => {
    // 결제 상태가 성공이고, 아직 환불되지 않은 경우만 환불 가능
    const isPaymentSuccess = payment.paymentStatus === 'SUCCESS' || payment.paymentStatus === 'COMPLETED'
    const isNotRefunded = !payment.hasRefund || (payment.refundStatus && payment.refundStatus === 'FAILED')
    
    return isPaymentSuccess && isNotRefunded
  }

  // 환불 신청 버튼 클릭
  const handleRefundClick = (paymentId: number) => {
    router.push(`/ticket/refund?paymentId=${paymentId}`)
  }

  // 테스트 버튼 클릭
  const handleTestArrival = async (payment: PaymentHistoryItem) => {
    setSelectedPayment(payment)
    setTestModalOpen(true)
    
    // Payment 데이터에서 직접 trainScheduleId 사용
    if (payment.trainScheduleId) {
      setTrainScheduleId(payment.trainScheduleId.toString())
    } else {
      // trainScheduleId가 없는 경우 경고
      toast({
        title: "주의",
        description: "이 결제 건에는 열차 스케줄 ID가 없습니다. 수동으로 입력해주세요.",
        variant: "destructive"
      })
      setTrainScheduleId('')
    }
  }

  // 테스트 실행
  const executeTest = async () => {
    if (!selectedPayment || !trainScheduleId) return

    setTestLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다.",
          variant: "destructive",
        })
        return
      }

      const actualArrivalTime = new Date().toISOString()
      const url = testMode === 'ontime' 
        ? `/api/v1/mileage/admin/train/${trainScheduleId}/arrival`
        : `/api/v1/mileage/admin/train/${trainScheduleId}/delay`

      const params = new URLSearchParams({
        actualArrivalTime: actualArrivalTime,
        ...(testMode === 'delay' && { delayMinutes: delayMinutes.toString() })
      })

      const response = await fetch(`http://localhost:8080${url}?${params}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "테스트 성공",
          description: data.result || "열차 도착 이벤트가 성공적으로 전송되었습니다.",
        })
        setTestModalOpen(false)
        // 마일리지 정보 새로고침
        fetchMileageInfo()
      } else {
        // 403 에러에 대한 특별한 처리
        if (response.status === 403) {
          throw new Error('권한 오류: 백엔드의 MileageEarningController에서 @PreAuthorize("hasRole(\'ADMIN\')")을 @PreAuthorize("hasAuthority(\'ADMIN\')")로 변경해주세요.')
        } else {
          throw new Error(data.message || '테스트 실행 실패')
        }
      }
    } catch (error) {
      console.error('테스트 실행 오류:', error)
      toast({
        title: "테스트 실패",
        description: error instanceof Error ? error.message : "테스트 실행 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setTestLoading(false)
    }
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
            <UserInfoCard 
              loginInfo={loginInfo}
              isLoggedIn={isLoggedIn}
              currentMileage={currentMileage}
              isInitialLoading={isInitialLoading}
            />

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
                          <TableHead>관리</TableHead>
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
                              <div className="flex flex-col gap-1">
                                <Badge variant={getStatusBadgeVariant(payment.paymentStatus)}>
                                  {payment.paymentStatus === 'SUCCESS' ? '결제완료' : 
                                   payment.paymentStatus === 'FAILED' ? '결제실패' : 
                                   payment.paymentStatus === 'PENDING' ? '결제대기' : payment.paymentStatus}
                                </Badge>
                                {payment.hasRefund && payment.refundStatus && (
                                  <Badge 
                                    variant={
                                      payment.refundStatus === 'COMPLETED' ? 'outline' :
                                      payment.refundStatus === 'PROCESSING' ? 'secondary' :
                                      payment.refundStatus === 'FAILED' ? 'destructive' : 'default'
                                    }
                                    className="text-xs"
                                  >
                                    {payment.refundStatus === 'COMPLETED' ? '환불완료' :
                                     payment.refundStatus === 'PROCESSING' ? '환불처리중' :
                                     payment.refundStatus === 'PENDING' ? '환불대기' :
                                     payment.refundStatus === 'FAILED' ? '환불실패' : payment.refundStatus}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
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
                                {isRefundable(payment) ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRefundClick(payment.paymentId)}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    환불신청
                                  </Button>
                                ) : payment.hasRefund && payment.refundStatus === 'PENDING' ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRefundClick(payment.paymentId)}
                                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                  >
                                    환불진행
                                  </Button>
                                ) : payment.hasRefund && payment.refundStatus === 'COMPLETED' ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled
                                    className="text-gray-400"
                                  >
                                    환불완료
                                  </Button>
                                ) : null}
                                {/* 테스트 버튼 - ADMIN 권한 사용자만 표시 */}
                                {loginInfo?.role === 'ADMIN' && payment.paymentStatus === 'SUCCESS' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleTestArrival(payment)}
                                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                  >
                                    테스트
                                  </Button>
                                )}
                              </div>
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

      {/* 테스트 모달 */}
      <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-purple-600" />
              열차 도착 이벤트 테스트
            </DialogTitle>
            <DialogDescription>
              마일리지 적립을 테스트하기 위한 열차 도착 이벤트를 시뮬레이션합니다.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {selectedPayment && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">결제 ID:</span>
                  <span className="font-medium">{selectedPayment.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">예약 ID:</span>
                  <span className="font-medium">R{selectedPayment.reservationId.toString().padStart(13, '0')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">적립 예정 마일리지:</span>
                  <span className="font-medium text-blue-600">+{formatAmount(selectedPayment.mileageToEarn)}P</span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="trainScheduleId">열차 스케줄 ID</Label>
              <Input
                id="trainScheduleId"
                type="text"
                value={trainScheduleId}
                onChange={(e) => setTrainScheduleId(e.target.value)}
                placeholder="열차 스케줄 ID를 입력하세요"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                * 실제 TrainSchedule ID를 입력해주세요. (예약 ID와 다릅니다)
              </p>
            </div>

            <div>
              <Label>도착 시뮬레이션 모드</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => setTestMode('ontime')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    testMode === 'ontime'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Clock className="h-5 w-5 mx-auto mb-1" />
                  <div className="font-medium">정시 도착</div>
                  <div className="text-xs mt-1">기본 마일리지만 적립</div>
                </button>
                <button
                  onClick={() => setTestMode('delay')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    testMode === 'delay'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Clock className="h-5 w-5 mx-auto mb-1" />
                  <div className="font-medium">지연 도착</div>
                  <div className="text-xs mt-1">지연 보상 추가 적립</div>
                </button>
              </div>
            </div>

            {testMode === 'delay' && (
              <div>
                <Label htmlFor="delayMinutes">지연 시간 (분)</Label>
                <Input
                  id="delayMinutes"
                  type="number"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 0)}
                  min="0"
                  max="180"
                  className="mt-1"
                />
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  <p>• 20분 이상: 결제금액의 12.5% 보상</p>
                  <p>• 40분 이상: 결제금액의 25% 보상</p>
                  <p>• 60분 이상: 결제금액의 50% 보상</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTestModalOpen(false)}
              disabled={testLoading}
            >
              취소
            </Button>
            <Button
              onClick={executeTest}
              disabled={testLoading || !trainScheduleId}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {testLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  전송 중...
                </>
              ) : (
                '테스트 실행'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 