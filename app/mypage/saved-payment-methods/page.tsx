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
import { savedPaymentMethodApi } from "@/lib/api/client"

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

  const [savedMethods, setSavedMethods] = useState<SavedPaymentMethodsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMethodType, setNewMethodType] = useState<'CREDIT_CARD' | 'BANK_ACCOUNT'>('CREDIT_CARD')
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // 새 결제 수단 폼 데이터
  const [newMethodForm, setNewMethodForm] = useState({
    alias: '',
    cardNumber: '',
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

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // 저장된 결제 수단 조회
  const fetchSavedPaymentMethods = async () => {
    setLoading(true)
    try {
      // 임시로 memberId를 1로 설정 (실제로는 로그인된 사용자 정보에서 가져와야 함)
      const memberId = 1;
      
      const response = await savedPaymentMethodApi.getSavedPaymentMethods(memberId);
      
      // 백엔드에서 배열로 직접 반환하므로 구조 변경
      setSavedMethods({
        savedPaymentMethods: Array.isArray(response) ? response : [],
        totalCount: Array.isArray(response) ? response.length : 0,
      });
    } catch (error) {
      console.error('저장된 결제 수단 조회 실패:', error);
      setSavedMethods({
        savedPaymentMethods: [],
        totalCount: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchSavedPaymentMethods();
  }, []);

  // 알림 자동 닫기
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // 결제 수단 저장
  const handleSavePaymentMethod = async () => {
    setAlert(null)
    try {
      const memberId = 1; // 임시 memberId

      await savedPaymentMethodApi.savePaymentMethod({
        memberId,
        paymentMethodType: newMethodType,
        alias: newMethodForm.alias,
        ...(newMethodType === 'CREDIT_CARD' ? {
          cardNumber: newMethodForm.cardNumber,
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
      });

      setAlert({ type: 'success', message: '결제 수단이 성공적으로 저장되었습니다.' });
      setIsDialogOpen(false);
      resetForm();
      fetchSavedPaymentMethods();
    } catch (error) {
      console.error('결제 수단 저장 실패:', error);
      setAlert({ type: 'error', message: '결제 수단 저장에 실패했습니다.' });
    }
  }

  // 결제 수단 삭제
  const handleDeletePaymentMethod = async (methodId: number) => {
    if (!confirm('이 결제 수단을 삭제하시겠습니까?')) return;

    try {
      await savedPaymentMethodApi.deletePaymentMethod(methodId);
      setAlert({ type: 'success', message: '결제 수단이 삭제되었습니다.' });
      fetchSavedPaymentMethods();
    } catch (error) {
      console.error('결제 수단 삭제 실패:', error);
      setAlert({ type: 'error', message: '결제 수단 삭제에 실패했습니다.' });
    }
  }

  // 기본 결제 수단 설정
  const handleSetDefaultPaymentMethod = async (methodId: number) => {
    try {
      const memberId = 1; // 임시 memberId
      await savedPaymentMethodApi.setDefaultPaymentMethod(methodId, memberId);
      setAlert({ type: 'success', message: '기본 결제 수단이 설정되었습니다.' });
      fetchSavedPaymentMethods();
    } catch (error) {
      console.error('기본 결제 수단 설정 실패:', error);
      setAlert({ type: 'error', message: '기본 결제 수단 설정에 실패했습니다.' });
    }
  }

  // 폼 초기화
  const resetForm = () => {
    setNewMethodForm({
      alias: '',
      cardNumber: '',
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
                <h3 className="font-bold text-lg">김구름 회원님</h3>
                <p className="text-sm text-gray-600">마일리지: 0P</p>
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
                        <div>
                          <Label htmlFor="cardNumber">카드 번호</Label>
                          <Input
                            id="cardNumber"
                            value={newMethodForm.cardNumber}
                            onChange={(e) => setNewMethodForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                            placeholder="1234-5678-9012-3456"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cardExpiryMonth">만료월</Label>
                            <Select
                              value={newMethodForm.cardExpiryMonth}
                              onValueChange={(value) => setNewMethodForm(prev => ({ ...prev, cardExpiryMonth: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="월" />
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
                            <Label htmlFor="cardExpiryYear">만료년</Label>
                            <Select
                              value={newMethodForm.cardExpiryYear}
                              onValueChange={(value) => setNewMethodForm(prev => ({ ...prev, cardExpiryYear: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="년" />
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
                            value={newMethodForm.cardHolderName}
                            onChange={(e) => setNewMethodForm(prev => ({ ...prev, cardHolderName: e.target.value }))}
                            placeholder="홍길동"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardCvc">CVC</Label>
                          <div className="relative">
                            <Input
                              type={showCvc ? "text" : "password"}
                              value={newMethodForm.cardCvc}
                              onChange={(e) => setNewMethodForm(prev => ({ ...prev, cardCvc: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                              maxLength={3}
                              placeholder="123"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
                          <Label htmlFor="accountNumber">계좌 번호</Label>
                          <Input
                            id="accountNumber"
                            value={newMethodForm.accountNumber}
                            onChange={(e) => setNewMethodForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                            placeholder="123-456-789012"
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountHolderName">예금주명</Label>
                          <Input
                            id="accountHolderName"
                            value={newMethodForm.accountHolderName}
                            onChange={(e) => setNewMethodForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                            placeholder="홍길동"
                          />
                        </div>
                        <div>
                          <Label htmlFor="accountPassword">계좌 비밀번호</Label>
                          <div className="relative">
                            <Input
                              id="accountPassword"
                              type={showPassword ? "text" : "password"}
                              value={newMethodForm.accountPassword}
                              onChange={(e) => setNewMethodForm(prev => ({ ...prev, accountPassword: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                              maxLength={4}
                              placeholder="4자리 숫자"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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