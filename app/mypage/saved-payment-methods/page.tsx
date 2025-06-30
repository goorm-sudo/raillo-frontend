"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Building,
  Eye,
  EyeOff,
} from "lucide-react"
import { savedPaymentMethodApi, mileageApi } from "@/lib/api/client"
import { getLoginInfo, isTokenExpired } from "@/lib/utils"

interface SavedPaymentMethod {
  id: number;
  memberId: number;
  paymentMethodType: string;
  alias: string;
  cardNumber?: string;
  cardExpiryMonth?: string;
  cardExpiryYear?: string;
  cardHolderName?: string;
  cardCvc?: string;
  bankCode?: string;
  accountNumber?: string;
  accountHolderName?: string;
  accountPassword?: string;
  isDefault: boolean;
  createdAt: string;
}

interface SavedPaymentMethodsResponse {
  savedPaymentMethods: SavedPaymentMethod[];
  totalCount: number;
}

export default function SavedPaymentMethodsPage() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    ticketInfo: false,
    membershipPerformance: false,
    paymentManagement: true, // 결제관리 섹션을 기본으로 열어둠
    memberInfoManagement: false,
  })

  // 로그인 상태 관리
  const [loginInfo, setLoginInfo] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userMileage, setUserMileage] = useState(0)

  const [savedMethods, setSavedMethods] = useState<SavedPaymentMethodsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMethodType, setNewMethodType] = useState<'CREDIT_CARD' | 'BANK_ACCOUNT'>('CREDIT_CARD')
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // 새 결제 수단 폼 데이터 (카드번호 4자리씩 분할)
  const [newMethodForm, setNewMethodForm] = useState({
    alias: '',
    cardNumber1: '',
    cardNumber2: '',
    cardNumber3: '',
    cardNumber4: '',
    cardExpiryMonth: '',
    cardExpiryYear: '',
    cardHolderName: '',
    cardCvc: '',
    bankCode: '',
    accountNumber: '',
    accountHolderName: '',
    accountPassword: '',
    isDefault: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showCvc, setShowCvc] = useState(false)

  // 로그인 정보 확인
  useEffect(() => {
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
      
      // 마일리지 및 저장된 결제수단 조회
      fetchUserMileage(1)
      fetchSavedPaymentMethods(1)
    }
    
    checkLoginStatus()
  }, [])

  // 사용자 마일리지 조회
  const fetchUserMileage = async (userId: number) => {
    try {
      const token = localStorage.getItem('accessToken')
      
      const response = await fetch(`http://localhost:8080/api/v1/mileage/balance/${userId}/simple`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // API 응답 구조: { message: "...", result: { currentBalance: 10000, ... } }
        const mileageAmount = data.result?.currentBalance || data.currentBalance || 0
        setUserMileage(mileageAmount)
      } else {
        const errorText = await response.text()
        console.error('❌ 마일리지 조회 실패:', response.status, response.statusText, errorText)
        setUserMileage(0)
      }
    } catch (error) {
      console.error('❌ 마일리지 조회 에러:', error)
      setUserMileage(0)
    }
  }

  // 저장된 결제수단 조회
  const fetchSavedPaymentMethods = async (userId: number) => {
    try {
      const token = localStorage.getItem('accessToken')
      
      const response = await fetch(`http://localhost:8080/api/v1/saved-payment-methods?memberId=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // 신용카드와 계좌 분리
        const creditCards = data.filter((item: any) => item.paymentMethodType === 'CREDIT_CARD')
        const bankAccounts = data.filter((item: any) => item.paymentMethodType === 'BANK_ACCOUNT')
        
        setSavedMethods({
          savedPaymentMethods: creditCards.concat(bankAccounts),
          totalCount: creditCards.length + bankAccounts.length,
        })
      } else {
        const errorText = await response.text()
        console.error('❌ 저장된 결제수단 조회 실패:', response.status, response.statusText, errorText)
        setSavedMethods({
          savedPaymentMethods: [],
          totalCount: 0,
        })
      }
    } catch (error) {
      console.error('❌ 저장된 결제수단 조회 에러:', error)
      setSavedMethods({
        savedPaymentMethods: [],
        totalCount: 0,
      })
    }
  }

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // 알림 자동 닫기
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // 카드번호 입력 처리 (4자리씩 자동 이동)
  const handleCardNumberChange = (index: number, value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 4);
    const fieldNames = ['cardNumber1', 'cardNumber2', 'cardNumber3', 'cardNumber4'];
    
    setNewMethodForm(prev => ({
      ...prev,
      [fieldNames[index]]: numericValue
    }));

    // 4자리 입력 완료 시 다음 필드로 자동 포커스
    if (numericValue.length === 4 && index < 3) {
      const nextInput = document.getElementById(`cardNumber${index + 2}`);
      nextInput?.focus();
    }
  }

  // 결제 수단 저장
  const handleSavePaymentMethod = async () => {
    setAlert(null)
    try {
      if (!isLoggedIn || !loginInfo) {
        setAlert({ type: 'error', message: '로그인이 필요합니다.' });
        return;
      }

      // userId 타입 확인 및 변환
      const userId = typeof loginInfo.userId === 'string' ? parseInt(loginInfo.userId) : loginInfo.userId

      // 카드번호 합치기
      const fullCardNumber = newMethodType === 'CREDIT_CARD' 
        ? `${newMethodForm.cardNumber1}${newMethodForm.cardNumber2}${newMethodForm.cardNumber3}${newMethodForm.cardNumber4}`
        : '';

      const requestData = {
        memberId: userId,
        paymentMethodType: newMethodType,
        alias: newMethodForm.alias,
        ...(newMethodType === 'CREDIT_CARD' ? {
          cardNumber: fullCardNumber,
          cardExpiryMonth: newMethodForm.cardExpiryMonth,
          cardExpiryYear: newMethodForm.cardExpiryYear,
          cardHolderName: newMethodForm.cardHolderName,
          cardCvc: newMethodForm.cardCvc,
        } : {
          bankCode: newMethodForm.bankCode,
          accountNumber: newMethodForm.accountNumber,
          accountHolderName: newMethodForm.accountHolderName,
          accountPassword: newMethodForm.accountPassword,
        }),
        isDefault: newMethodForm.isDefault,
      };

      const response = await savedPaymentMethodApi.savePaymentMethod(requestData);

      setAlert({ type: 'success', message: '결제 수단이 성공적으로 저장되었습니다.' });
      setIsDialogOpen(false);
      resetForm();
      
      // 저장 후 즉시 목록 새로고침
      await fetchSavedPaymentMethods(userId);
    } catch (error) {
      console.error('❌ 결제 수단 저장 실패:', error);
      setAlert({ type: 'error', message: '결제 수단 저장에 실패했습니다.' });
    }
  }

  // 결제 수단 삭제
  const handleDeletePaymentMethod = async (methodId: number) => {
    if (!confirm('이 결제 수단을 삭제하시겠습니까?')) return;

    try {
      await savedPaymentMethodApi.deletePaymentMethod(methodId);
      setAlert({ type: 'success', message: '결제 수단이 삭제되었습니다.' });
      fetchSavedPaymentMethods(typeof loginInfo.userId === 'string' ? parseInt(loginInfo.userId) : loginInfo.userId);
    } catch (error) {
      console.error('결제 수단 삭제 실패:', error);
      setAlert({ type: 'error', message: '결제 수단 삭제에 실패했습니다.' });
    }
  }

  // 기본 결제 수단 설정
  const handleSetDefaultPaymentMethod = async (methodId: number) => {
    try {
      if (!isLoggedIn || !loginInfo) {
        setAlert({ type: 'error', message: '로그인이 필요합니다.' });
        return;
      }

      await savedPaymentMethodApi.setDefaultPaymentMethod(methodId, loginInfo.userId);
      setAlert({ type: 'success', message: '기본 결제 수단이 설정되었습니다.' });
      fetchSavedPaymentMethods(typeof loginInfo.userId === 'string' ? parseInt(loginInfo.userId) : loginInfo.userId);
    } catch (error) {
      console.error('기본 결제 수단 설정 실패:', error);
      setAlert({ type: 'error', message: '기본 결제 수단 설정에 실패했습니다.' });
    }
  }

  // 폼 초기화
  const resetForm = () => {
    setNewMethodForm({
      alias: '',
      cardNumber1: '',
      cardNumber2: '',
      cardNumber3: '',
      cardNumber4: '',
      cardExpiryMonth: '',
      cardExpiryYear: '',
      cardHolderName: '',
      cardCvc: '',
      bankCode: '',
      accountNumber: '',
      accountHolderName: '',
      accountPassword: '',
      isDefault: false,
    });
  }

  // 결제 수단 타입 표시명
  const getPaymentMethodTypeDisplay = (type: string) => {
    switch (type) {
      case 'CREDIT_CARD':
        return '신용카드';
      case 'BANK_ACCOUNT':
        return '내 통장결제';
      default:
        return type;
    }
  }

  // 은행 코드 목록
  const bankCodes = [
    { code: '004', name: '국민은행' },
    { code: '088', name: '신한은행' },
    { code: '020', name: '우리은행' },
    { code: '081', name: '하나은행' },
    { code: '011', name: '농협은행' },
    { code: '032', name: '부산은행' },
    { code: '031', name: '대구은행' },
    { code: '034', name: '광주은행' },
    { code: '037', name: '전북은행' },
    { code: '039', name: '경남은행' },
    { code: '035', name: '제주은행' },
    { code: '090', name: '카카오뱅크' },
    { code: '089', name: '케이뱅크' },
    { code: '092', name: '토스뱅크' },
    { code: '003', name: 'IBK기업은행' },
  ];

  const formatCardNumber = (cardNumber?: string) => {
    if (!cardNumber) return ''
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const maskCardNumber = (cardNumber?: string) => {
    if (!cardNumber) return ''
    return `**** **** **** ${cardNumber.slice(-4)}`
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
                <span className="text-blue-600">간편구매정보 등록</span>
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
                  {isLoggedIn && loginInfo ? loginInfo.username + ' 회원님' : '게스트 님'}
                </h3>
                <p className="text-sm text-gray-600">마일리지: {userMileage.toLocaleString()}P</p>
                {isLoggedIn && loginInfo && (
                  <p className="text-xs text-gray-500">
                    멤버십 번호: RAILLO{loginInfo.userId.toString().padStart(6, '0')}
                  </p>
                )}
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
                        className="flex items-center space-x-3 px-8 py-2 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <span>결제 내역</span>
                      </Link>
                      <Link
                        href="/mypage/saved-payment-methods"
                        className="flex items-center space-x-3 px-8 py-2 text-sm text-blue-600 bg-blue-50 border-r-2 border-blue-600"
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
              <h1 className="text-2xl font-bold text-gray-900">간편구매정보 등록</h1>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>결제 수단 추가</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>새 결제 수단 등록</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* 결제 수단 타입 선택 */}
                    <div>
                      <Label>결제 수단 타입</Label>
                      <Select
                        value={newMethodType}
                        onValueChange={(value: 'CREDIT_CARD' | 'BANK_ACCOUNT') => setNewMethodType(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CREDIT_CARD">신용카드</SelectItem>
                          <SelectItem value="BANK_ACCOUNT">내 통장결제</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 표시명 */}
                    <div>
                      <Label htmlFor="alias">별명</Label>
                      <Input
                        id="alias"
                        value={newMethodForm.alias}
                        onChange={(e) => setNewMethodForm(prev => ({ ...prev, alias: e.target.value }))}
                        placeholder="예: 주 사용 카드, 급여 계좌 등"
                      />
                    </div>

                    {/* 신용카드 필드 */}
                    {newMethodType === 'CREDIT_CARD' && (
                      <>
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <Label htmlFor="cardNumber1">카드번호</Label>
                            <Input
                              id="cardNumber1"
                              type="text"
                              value={newMethodForm.cardNumber1}
                              onChange={(e) => handleCardNumberChange(0, e.target.value)}
                              maxLength={4}
                            />
                          </div>
                          <div>
                            <Label htmlFor="cardNumber2" className="sr-only">카드번호 2</Label>
                            <Input
                              id="cardNumber2"
                              type="text"
                              value={newMethodForm.cardNumber2}
                              onChange={(e) => handleCardNumberChange(1, e.target.value)}
                              maxLength={4}
                            />
                          </div>
                          <div>
                            <Label htmlFor="cardNumber3" className="sr-only">카드번호 3</Label>
                            <Input
                              id="cardNumber3"
                              type="text"
                              value={newMethodForm.cardNumber3}
                              onChange={(e) => handleCardNumberChange(2, e.target.value)}
                              maxLength={4}
                            />
                          </div>
                          <div>
                            <Label htmlFor="cardNumber4" className="sr-only">카드번호 4</Label>
                            <Input
                              id="cardNumber4"
                              type="text"
                              value={newMethodForm.cardNumber4}
                              onChange={(e) => handleCardNumberChange(3, e.target.value)}
                              maxLength={4}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cardExpiryMonth">유효기간 (월)</Label>
                            <Select value={newMethodForm.cardExpiryMonth} onValueChange={(value) => setNewMethodForm(prev => ({ ...prev, cardExpiryMonth: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => (
                                  <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                    {String(i + 1).padStart(2, '0')}월
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="cardExpiryYear">유효기간 (년)</Label>
                            <Select value={newMethodForm.cardExpiryYear} onValueChange={(value) => setNewMethodForm(prev => ({ ...prev, cardExpiryYear: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => {
                                  const year = new Date().getFullYear() + i;
                                  return (
                                    <SelectItem key={year} value={String(year)}>
                                      {year}년
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="cardHolderName">카드 소유자명</Label>
                          <Input
                            id="cardHolderName"
                            type="text"
                            value={newMethodForm.cardHolderName}
                            onChange={(e) => setNewMethodForm(prev => ({ ...prev, cardHolderName: e.target.value }))}
                          />
                        </div>

                        <div>
                          <Label htmlFor="cardCvc">CVC</Label>
                          <div className="relative">
                            <Input
                              id="cardCvc"
                              type={showCvc ? "text" : "password"}
                              value={newMethodForm.cardCvc}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                                setNewMethodForm(prev => ({ ...prev, cardCvc: value }));
                              }}
                              maxLength={3}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                              onClick={() => setShowCvc(!showCvc)}
                            >
                              {showCvc ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* 계좌 필드 */}
                    {newMethodType === 'BANK_ACCOUNT' && (
                      <>
                        <div>
                          <Label htmlFor="bankCode">은행</Label>
                          <Select
                            value={newMethodForm.bankCode}
                            onValueChange={(value) => setNewMethodForm(prev => ({ ...prev, bankCode: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="은행 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {bankCodes.map((bank) => (
                                <SelectItem key={bank.code} value={bank.code}>
                                  {bank.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="accountNumber">계좌번호</Label>
                          <Input
                            id="accountNumber"
                            type="text"
                            value={newMethodForm.accountNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              setNewMethodForm(prev => ({ ...prev, accountNumber: value }));
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountHolderName">예금주명</Label>
                          <Input
                            id="accountHolderName"
                            type="text"
                            value={newMethodForm.accountHolderName}
                            onChange={(e) => setNewMethodForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountPassword">계좌 비밀번호 (앞 2자리)</Label>
                          <div className="relative">
                            <Input
                              id="accountPassword"
                              type={showPassword ? "text" : "password"}
                              value={newMethodForm.accountPassword}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                                setNewMethodForm(prev => ({ ...prev, accountPassword: value }));
                              }}
                              maxLength={2}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* 기본 결제 수단 설정 */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={newMethodForm.isDefault}
                        onChange={(e) => setNewMethodForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="isDefault">기본 결제 수단으로 설정</Label>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        취소
                      </Button>
                      <Button onClick={handleSavePaymentMethod}>
                        저장
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* 알림 메시지 */}
            {alert && (
              <Alert className={`mb-4 ${alert.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                {alert.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {alert.message}
                </AlertDescription>
              </Alert>
            )}

            {/* 저장된 결제 수단 목록 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>저장된 결제 수단</span>
                  </div>
                  {savedMethods && (
                    <Badge variant="outline">
                      총 {savedMethods.totalCount}개
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">저장된 결제 수단을 조회하고 있습니다...</p>
                  </div>
                ) : savedMethods && savedMethods.savedPaymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    {savedMethods.savedPaymentMethods.map((method) => (
                      <Card key={method.id} className={`border ${method.isDefault ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                                {method.paymentMethodType === 'CREDIT_CARD' ? (
                                  <CreditCard className="h-6 w-6 text-gray-600" />
                                ) : (
                                  <Building className="h-6 w-6 text-gray-600" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-medium">{method.alias}</h3>
                                  {method.isDefault && (
                                    <Badge variant="default" className="text-xs">
                                      기본
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {getPaymentMethodTypeDisplay(method.paymentMethodType)}
                                </p>
                                {method.paymentMethodType === 'CREDIT_CARD' && method.cardNumber && (
                                  <p className="text-sm text-gray-500">
                                    {maskCardNumber(method.cardNumber)}
                                  </p>
                                )}
                                {method.paymentMethodType === 'BANK_ACCOUNT' && method.accountNumber && (
                                  <p className="text-sm text-gray-500">
                                    {bankCodes.find(bank => bank.code === method.bankCode)?.name}
                                    {method.accountNumber.replace(/(\d{4})(?=\d)/g, '$1-')}
                                  </p>
                                )}
                                <p className="text-xs text-gray-400">
                                  등록일: {new Date(method.createdAt).toLocaleDateString('ko-KR')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {!method.isDefault && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSetDefaultPaymentMethod(method.id)}
                                >
                                  기본 설정
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePaymentMethod(method.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">저장된 결제 수단이 없습니다</h3>
                    <p className="text-gray-600 mb-4">
                      자주 사용하는 결제 수단을 등록하여 빠르게 결제하세요.
                    </p>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      첫 번째 결제 수단 등록
                    </Button>
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