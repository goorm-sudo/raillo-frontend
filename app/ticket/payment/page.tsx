"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Train, ChevronLeft, ArrowRight, AlertTriangle, ChevronDown, CheckCircle } from "lucide-react"
import apiClient, { savedPaymentMethodApi, mileageApi } from "@/lib/api/client"
import { getLoginInfo, isTokenExpired } from "@/lib/utils"

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

interface BankInfo {
  bankName: string
  accountNumber: string
  accountHolder: string
}

interface SavedPaymentMethod {
  id: number
  memberId: number
  paymentMethodType: string
  alias: string // displayName → alias로 변경
  cardNumber?: string
  cardExpiryMonth?: string
  cardExpiryYear?: string
  cardHolderName?: string
  cardCvc?: string // CVC 필드 추가
  bankCode?: string
  accountNumber?: string
  accountHolderName?: string
  accountPassword?: string // 계좌 비밀번호 필드 추가
  isDefault: boolean
  createdAt: string
}

export default function PaymentPage() {
  const router = useRouter()
  
  // 로그인 정보 상태
  const [loginInfo, setLoginInfo] = useState<any>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  // 결제 방식 상태
  const [paymentMethod, setPaymentMethod] = useState("simple")
  const [simplePaymentType, setSimplePaymentType] = useState("KAKAO_PAY")
  
  // 탭 변경 시 필드 초기화 함수
  const resetFieldsForTab = (newTab: string) => {
    // 공통 필드 초기화
    setErrors({})
    setIsProcessing(false)
    
    // 현금영수증 관련 초기화 (현금성 결제가 아닌 경우)
    if (newTab === "simple" || newTab === "card") {
      setRequestReceipt(false)
    } else {
      // 현금성 결제 (bank, transfer)는 현금영수증 기본 체크
      setRequestReceipt(true)
    }
    setMileageRequestReceipt(false) // 마일리지 현금영수증 초기화
    setReceiptType("personal")
    setBusinessNumber("")
    
    if (newTab === "simple") {
      // 간편결제 초기화
      setSimplePaymentType("KAKAO_PAY")
      setSimplePhonePrefix("010")
      setSimplePhoneNumber("")
    } else if (newTab === "card") {
      // 신용카드 필드 초기화
      setUseSavedCard(false)
      setSelectedSavedCard(null)
      setCardNumber1('')
      setCardNumber2('')
      setCardNumber3('')
      setCardNumber4('')
      setExpiryMonth('')
      setExpiryYear('2025')
      setCvv('')
      setCardPassword('')
      setCardType("personal")
      setInstallment("일시불")
      setCardPhonePrefix("010")
      setCardPhoneNumber("")
    } else if (newTab === "bank") {
      // 내 통장 필드 초기화
      setUseSavedAccount(false)
      setSelectedSavedAccount(null)
      setSelectedBankForAccount('')
      setBankAccountNumber('')
      setBankPassword('')
      setIsAccountVerified(false)
      setSavedAccountInfo(null)
      setBankPhonePrefix("010")
      setBankPhoneNumber("")
    } else if (newTab === "transfer") {
      // 계좌이체 필드 초기화
      setSelectedBankForTransfer('')
      setIsDepositCompleted(false)
      setTransferPhonePrefix("010")
      setTransferPhoneNumber("")
    }
  }
  
  // 탭 변경 핸들러
  const handleTabChange = (newTab: string) => {
    resetFieldsForTab(newTab)
    setPaymentMethod(newTab)
  }
  
  // 신용카드 상태
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
  
  // 내 통장 결제 상태
  const [selectedBankForAccount, setSelectedBankForAccount] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [bankPassword, setBankPassword] = useState("")
  const [isAccountVerified, setIsAccountVerified] = useState(false)
  const [savedAccountInfo, setSavedAccountInfo] = useState<BankInfo | null>(null)
  
  // 계좌이체 상태
  const [selectedBankForTransfer, setSelectedBankForTransfer] = useState("")
  const [isDepositCompleted, setIsDepositCompleted] = useState(false)
  
  // 예약 정보
  const reservationInfo: PaymentInfo = {
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
  
  // 마일리지 상태
  const [mileageToUse, setMileageToUse] = useState(0)
  const [availableMileage, setAvailableMileage] = useState(0)
  const [maxUsableMileage, setMaxUsableMileage] = useState(0)
  const [finalPayableAmount, setFinalPayableAmount] = useState(reservationInfo.price)
  
  // 휴대폰 번호 상태 - 결제수단별 완전 분리
  const [cardPhoneNumber, setCardPhoneNumber] = useState("")
  const [cardPhonePrefix, setCardPhonePrefix] = useState("010")
  const [bankPhoneNumber, setBankPhoneNumber] = useState("")
  const [bankPhonePrefix, setBankPhonePrefix] = useState("010")
  const [simplePhoneNumber, setSimplePhoneNumber] = useState("") // 간편결제용 추가
  const [simplePhonePrefix, setSimplePhonePrefix] = useState("010") // 간편결제용 추가
  const [transferPhoneNumber, setTransferPhoneNumber] = useState("") // 계좌이체용 추가
  const [transferPhonePrefix, setTransferPhonePrefix] = useState("010") // 계좌이체용 추가
  
  // 현금영수증 휴대폰 번호 상태
  const [receiptPhoneNumber, setReceiptPhoneNumber] = useState("")
  const [receiptPhonePrefix, setReceiptPhonePrefix] = useState("010")
  
  // 공통 상태
  const [requestReceipt, setRequestReceipt] = useState(false)
  const [mileageRequestReceipt, setMileageRequestReceipt] = useState(false) // 마일리지 사용 시 현금영수증
  const [receiptType, setReceiptType] = useState("personal")
  const [businessNumber, setBusinessNumber] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreeSavePayment, setAgreeSavePayment] = useState(false)
  const [agreePersonalInfo, setAgreePersonalInfo] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // 에러 상태
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  
  // 저장된 결제 수단 상태 - 탭별로 분리
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<SavedPaymentMethod[]>([])
  const [selectedSavedCard, setSelectedSavedCard] = useState<number | null>(null)
  const [useSavedCard, setUseSavedCard] = useState(false)
  const [selectedSavedAccount, setSelectedSavedAccount] = useState<number | null>(null)
  const [useSavedAccount, setUseSavedAccount] = useState(false)

  // 국내 은행 계좌번호 정보
  const bankAccountInfo: BankInfo[] = [
    { bankName: "국민은행", accountNumber: "123456-78-901234", accountHolder: "주식회사 레일로" },
    { bankName: "신한은행", accountNumber: "110-123-456789", accountHolder: "주식회사 레일로" },
    { bankName: "우리은행", accountNumber: "1002-123-456789", accountHolder: "주식회사 레일로" },
    { bankName: "하나은행", accountNumber: "123-456789-12345", accountHolder: "주식회사 레일로" },
    { bankName: "농협은행", accountNumber: "123456-56-789012", accountHolder: "주식회사 레일로" },
    { bankName: "부산은행", accountNumber: "123-456-789012", accountHolder: "주식회사 레일로" },
    { bankName: "대구은행", accountNumber: "123-12-123456", accountHolder: "주식회사 레일로" },
    { bankName: "광주은행", accountNumber: "123-123-123456", accountHolder: "주식회사 레일로" },
    { bankName: "전북은행", accountNumber: "123456-12-123456", accountHolder: "주식회사 레일로" },
    { bankName: "경남은행", accountNumber: "123-123-123456", accountHolder: "주식회사 레일로" },
    { bankName: "제주은행", accountNumber: "123456-123456", accountHolder: "주식회사 레일로" },
    { bankName: "카카오뱅크", accountNumber: "3333-12-1234567", accountHolder: "주식회사 레일로" },
    { bankName: "케이뱅크", accountNumber: "123456-12-123456", accountHolder: "주식회사 레일로" },
    { bankName: "토스뱅크", accountNumber: "1000-1234-123456", accountHolder: "주식회사 레일로" },
    { bankName: "IBK기업은행", accountNumber: "123-123456-12-123", accountHolder: "주식회사 레일로" },
  ]

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

  // 저장된 결제 수단 조회
  const fetchSavedPaymentMethods = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      
      const response = await fetch(`http://localhost:8080/api/v1/saved-payment-methods?memberId=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSavedPaymentMethods(data)
      } else {
        const errorText = await response.text()
        console.error('❌ 저장된 결제수단 조회 실패:', response.status, response.statusText, errorText)
        setSavedPaymentMethods([])
      }
    } catch (error) {
      console.error('❌ 저장된 결제수단 조회 에러:', error)
      setSavedPaymentMethods([])
    }
  }

  // 마일리지 계산 함수
  const calculateFinalAmount = (usedMileage: number) => {
    const discountAmount = usedMileage; // 1마일리지 = 1원
    const finalAmount = Math.max(0, reservationInfo.price - discountAmount);
    setFinalPayableAmount(finalAmount);
    return finalAmount;
  }

  // 마일리지 사용량 변경 핸들러
  const handleMileageChange = (value: string) => {
    if (value === '') {
      setMileageToUse(0);
      calculateFinalAmount(0);
      return;
    }
    
    // 숫자가 아닌 문자(-, +, e 등) 제거하고 양수만 허용
    const cleanValue = value.replace(/[^0-9]/g, '').replace(/^0+/, '') || '';
    if (cleanValue === '') {
      setMileageToUse(0);
      calculateFinalAmount(0);
      return;
    }
    
    const numValue = parseInt(cleanValue) || 0;
    
    // 음수 방지 - 0보다 작으면 0으로 설정
    if (numValue < 0) {
      setMileageToUse(0);
      calculateFinalAmount(0);
      return;
    }
    
    // 최대 사용 가능 마일리지 제한 (보유 마일리지와 최대 사용 가능 중 작은 값)
    const maxAllowed = Math.min(availableMileage, maxUsableMileage);
    const clampedValue = Math.min(numValue, maxAllowed);
    
    // 사용자가 최대값을 초과하려 할 때 경고 메시지
    if (numValue > maxAllowed) {
      console.warn(`마일리지 최대 사용량 초과: 요청=${numValue}, 최대=${maxAllowed}`);
      // 자동으로 최대값으로 조정
      setMileageToUse(maxAllowed);
      calculateFinalAmount(maxAllowed);
    } else {
      setMileageToUse(clampedValue);
      calculateFinalAmount(clampedValue);
    }
  }

  // 로그인 정보 확인 및 설정
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

  // 마일리지 조회
  const fetchMileageInfo = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      
      const response = await fetch(`http://localhost:8080/api/v1/mileage/balance/1/simple`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // API 응답 구조: { message: "...", result: { currentBalance: 10000, activeBalance: 10000 } }
        const currentBalance = data.result?.currentBalance || data.currentBalance || 0
        const activeBalance = data.result?.activeBalance || data.activeBalance || 0
        
        const maxUsable30Percent = Math.floor(reservationInfo.price * 0.3)
        const maxUsable = Math.floor(maxUsable30Percent / 100) * 100 // 100포인트 단위로 내림
        
        setAvailableMileage(currentBalance)
        setMaxUsableMileage(Math.min(maxUsable, activeBalance))
      } else {
        const errorText = await response.text()
        console.error('❌ 결제페이지 마일리지 조회 실패:', response.status, response.statusText, errorText)
        setAvailableMileage(0)
        setMaxUsableMileage(0)
      }
    } catch (error) {
      console.error('❌ 결제페이지 마일리지 조회 에러:', error)
      setAvailableMileage(0)
      setMaxUsableMileage(0)
    }
  }

  // 컴포넌트 마운트 시 로그인 상태 확인 및 데이터 조회
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // 로그인 상태 변경 시 마일리지 조회
  useEffect(() => {
    if (isLoggedIn && loginInfo) {
      fetchMileageInfo()
      fetchSavedPaymentMethods()
    }
  }, [isLoggedIn, loginInfo])

  // 저장된 결제수단 상태 변경 감지
  useEffect(() => {
    if (savedPaymentMethods && savedPaymentMethods.length > 0) {
      // 기본 결제수단이 있는지 확인하고 설정
      const defaultMethod = savedPaymentMethods.find(method => method.isDefault)
      if (defaultMethod) {
        setPaymentMethod('saved')
        if (defaultMethod.paymentMethodType === 'CREDIT_CARD') {
          setSelectedSavedCard(defaultMethod.id.toString())
        } else if (defaultMethod.paymentMethodType === 'BANK_ACCOUNT') {
          setSelectedSavedAccount(defaultMethod.id.toString())
        }
      }
    }
  }, [savedPaymentMethods])

  // 원본 결제수단 조회 (실제 카드번호 포함)
  const fetchRawPaymentMethod = async (paymentMethodId: number) => {
    try {
      if (!isLoggedIn || !loginInfo) {
        throw new Error('로그인이 필요합니다.')
      }

      const memberId = loginInfo.userId
      const token = localStorage.getItem('accessToken')
      
      const response = await fetch(
        `http://localhost:8080/api/v1/saved-payment-methods/${paymentMethodId}/raw?memberId=${memberId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        return data
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      console.error('원본 결제수단 조회 실패:', error)
      throw error
    }
  }

  // 저장된 카드 선택 핸들러 (신용카드 탭 전용)
  const handleSavedCardChange = async (methodId: string) => {
    if (methodId === 'new') {
      // 새 카드 입력 선택
      setUseSavedCard(false);
      setSelectedSavedCard(null);
      
      // 카드 필드 초기화
      setCardNumber1('');
      setCardNumber2('');
      setCardNumber3('');
      setCardNumber4('');
      setExpiryMonth('');
      setExpiryYear('2025');
      setCvv('');
      setCardPassword('');
    } else {
      // 저장된 카드 선택
      const methodIdNum = parseInt(methodId);
      const method = savedPaymentMethods.find(m => m.id === methodIdNum && m.paymentMethodType === 'CREDIT_CARD');
      if (!method) return;

      setUseSavedCard(true);
      setSelectedSavedCard(methodIdNum);

      // 원본 데이터 조회
      const rawMethod = await fetchRawPaymentMethod(methodIdNum);
      
      if (rawMethod && rawMethod.cardNumber) {
        // 원본 카드 번호를 4자리씩 분할하여 입력
        const cardNumber = rawMethod.cardNumber.replace(/[^0-9]/g, '');
        setCardNumber1(cardNumber.slice(0, 4));
        setCardNumber2(cardNumber.slice(4, 8));
        setCardNumber3(cardNumber.slice(8, 12));
        setCardNumber4(cardNumber.slice(12, 16));
        setExpiryMonth(rawMethod.cardExpiryMonth || '');
        setExpiryYear(rawMethod.cardExpiryYear || '2025');
        // 저장된 카드는 CVC와 비밀번호 재입력 불필요
        setCvv('123'); // 3자리 더미값으로 수정
        setCardPassword('1234'); // 더미값 설정
      } else {
        // 원본 조회 실패 시 마스킹된 데이터 사용
        if (method.cardNumber) {
          const cardNumber = method.cardNumber.replace(/[^0-9]/g, '');
          setCardNumber1(cardNumber.slice(0, 4));
          setCardNumber2(cardNumber.slice(4, 8));
          setCardNumber3(cardNumber.slice(8, 12));
          setCardNumber4(cardNumber.slice(12, 16));
          setExpiryMonth(method.cardExpiryMonth || '');
          setExpiryYear(method.cardExpiryYear || '2025');
          setCvv('123');
          setCardPassword('1234');
        }
      }
    }
  };

  // 저장된 계좌 선택 핸들러 (내 통장 탭 전용)
  const handleSavedAccountChange = (methodId: string) => {
    if (methodId === 'new') {
      // 새 계좌 입력 선택
      setUseSavedAccount(false);
      setSelectedSavedAccount(null);
      
      // 통장 필드 초기화
      setSelectedBankForAccount('');
      setBankAccountNumber('');
      setBankPassword('');
      setIsAccountVerified(false);
    } else {
      // 저장된 계좌 선택
      const methodIdNum = parseInt(methodId);
      const method = savedPaymentMethods.find(m => m.id === methodIdNum && m.paymentMethodType === 'BANK_ACCOUNT');
      if (!method) return;

      setUseSavedAccount(true);
      setSelectedSavedAccount(methodIdNum);

      // 은행 코드를 은행명으로 변환
      const bankCodes: { [key: string]: string } = {
        '004': '국민은행',
        '088': '신한은행',
        '020': '우리은행',
        '081': '하나은행',
        '011': '농협은행',
        '032': '부산은행',
        '031': '대구은행',
        '034': '광주은행',
        '037': '전북은행',
        '039': '경남은행',
        '035': '제주은행',
        '090': '카카오뱅크',
        '089': '케이뱅크',
        '092': '토스뱅크',
        '003': 'IBK기업은행'
      };
      
      const bankName = bankCodes[method.bankCode || ''] || method.bankCode || '';
      setSelectedBankForAccount(bankName);
      setBankAccountNumber(method.accountNumber || '');
      // 저장된 계좌는 비밀번호 재입력 불필요
      setBankPassword('1234'); // 더미값 설정
      setIsAccountVerified(true); // 저장된 계좌는 검증 완료로 처리
      
      // 저장된 계좌 정보를 savedAccountInfo에 설정
      const accountInfo: BankInfo = {
        bankName: bankName,
        accountNumber: (method.accountNumber || '').replace(/(\d{6})(\d{2})(\d+)/, "$1-$2-$3"),
        accountHolder: method.accountHolderName || "홍길동"
      };
      setSavedAccountInfo(accountInfo);
    }
  };

  // 유효성 검사 함수들
  const validateCardNumber = () => {
    const fullCardNumber = cardNumber1 + cardNumber2 + cardNumber3 + cardNumber4
    if (fullCardNumber.length !== 16) {
      setErrors(prev => ({...prev, cardNumber: "카드번호는 16자리를 입력해주세요."}))
      return false
    }
    setErrors(prev => {
      const newErrors = {...prev}
      delete newErrors.cardNumber
      return newErrors
    })
    return true
  }

  const validateExpiryDate = () => {
    if (!expiryMonth || !expiryYear) {
      setErrors(prev => ({...prev, expiry: "유효기간을 선택해주세요."}))
      return false
    }
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const expYear = parseInt(expiryYear)
    const expMonth = parseInt(expiryMonth)
    
    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      setErrors(prev => ({...prev, expiry: "유효한 만료일을 입력해주세요."}))
      return false
    }
    setErrors(prev => {
      const newErrors = {...prev}
      delete newErrors.expiry
      return newErrors
    })
    return true
  }

  const validateCVV = () => {
    if (cvv.length !== 3) {
      setErrors(prev => ({...prev, cvv: "CVC/CVV는 3자리를 입력해주세요."}))
      return false
    }
    setErrors(prev => {
      const newErrors = {...prev}
      delete newErrors.cvv
      return newErrors
    })
    return true
  }

  const validateCardPassword = () => {
    if (cardPassword.length !== 4) {
      setErrors(prev => ({...prev, cardPassword: "카드 비밀번호 4자리를 입력해주세요."}))
      return false
    }
    setErrors(prev => {
      const newErrors = {...prev}
      delete newErrors.cardPassword
      return newErrors
    })
    return true
  }

  const validatePhoneNumber = () => {
    let phoneToCheck = ""
    
    // 결제 방식에 따라 검증할 휴대폰 번호 결정
    if (paymentMethod === "card") {
      phoneToCheck = cardPhoneNumber
    } else if (paymentMethod === "bank") {
      phoneToCheck = bankPhoneNumber
    } else if (paymentMethod === "simple") {
      phoneToCheck = simplePhoneNumber
    } else if (paymentMethod === "transfer") {
      phoneToCheck = transferPhoneNumber
    } else {
      phoneToCheck = receiptPhoneNumber // 기본값으로 현금영수증 번호 사용
    }
    
    if (phoneToCheck.length !== 8) {
      setErrors(prev => ({...prev, phoneNumber: "전화번호 8자리를 입력해주세요."}))
      return false
    }
    setErrors(prev => {
      const newErrors = {...prev}
      delete newErrors.phoneNumber
      return newErrors
    })
    return true
  }

  const validateAgreements = () => {
    if (!agreeTerms) {
      setErrors(prev => ({...prev, agreements: "결제 서비스 이용약관에 동의해주세요."}))
      return false
    }
    if (!agreePersonalInfo) {
      setErrors(prev => ({...prev, agreements: "개인정보 수집 및 이용에 동의해주세요."}))
      return false
    }
    setErrors(prev => {
      const newErrors = {...prev}
      delete newErrors.agreements
      return newErrors
    })
    return true
  }

  const validateBankAccount = () => {
    if (!selectedBankForAccount) {
      setErrors(prev => ({...prev, bankSelection: "은행을 선택해주세요."}))
      return false
    }
    if (bankAccountNumber.length < 10) {
      setErrors(prev => ({...prev, bankAccount: "올바른 계좌번호를 입력해주세요."}))
      return false
    }
    if (bankPassword.length !== 4) {
      setErrors(prev => ({...prev, bankPassword: "계좌 비밀번호 4자리를 입력해주세요."}))
      return false
    }
    setErrors(prev => {
      const newErrors = {...prev}
      delete newErrors.bankSelection
      delete newErrors.bankAccount
      delete newErrors.bankPassword
      return newErrors
    })
    return true
  }

  // 결제 수단 저장 함수
  const savePaymentMethod = async (paymentMethodType: string) => {
    try {
      // 로그인 상태에서만 결제수단 저장 가능
      if (!isLoggedIn || !loginInfo?.userId) {
        throw new Error('로그인이 필요합니다.');
      }

      const memberId = parseInt(loginInfo.userId);
      
      let requestData: any = {
        memberId,
        paymentMethodType,
        alias: `내 ${paymentMethodType === "CREDIT_CARD" ? "신용카드" : paymentMethodType === "BANK_ACCOUNT" ? "계좌" : "결제수단"}`,
        isDefault: false,
      };

      // 결제 방식별 상세 정보 추가
      if (paymentMethodType === "CREDIT_CARD") {
        requestData = {
          ...requestData,
          cardNumber: `${cardNumber1}${cardNumber2}${cardNumber3}${cardNumber4}`,
          cardExpiryMonth: expiryMonth,
          cardExpiryYear: expiryYear,
          cardHolderName: "결제자",
        };
      } else if (paymentMethodType === "BANK_ACCOUNT") {
        // 은행명을 은행 코드로 변환
        const bankNameToCode: { [key: string]: string } = {
          '국민은행': '004',
          '신한은행': '088',
          '우리은행': '020',
          '하나은행': '081',
          '농협은행': '011',
          '부산은행': '032',
          '대구은행': '031',
          '광주은행': '034',
          '전북은행': '037',
          '경남은행': '039',
          '제주은행': '035',
          '카카오뱅크': '090',
          '케이뱅크': '089',
          '토스뱅크': '092',
          'IBK기업은행': '003',
        };
        
        requestData = {
          ...requestData,
          bankCode: bankNameToCode[selectedBankForAccount] || '004',
          accountNumber: bankAccountNumber,
          accountHolderName: "홍길동",
        };
      }

      const response = await savedPaymentMethodApi.savePaymentMethod(requestData);
      
      // 저장 후 목록 새로고침
      await fetchSavedPaymentMethods();
      
      return response;
    } catch (error) {
      console.error("❌ 결제 수단 저장 실패:", error);
      throw error;
    }
  }

  // 계좌 유효성 검증 (Mock Gateway)
  const handleAccountVerification = async () => {
    if (!validateBankAccount()) return

    setIsProcessing(true)
    try {
      // Mock 은행 Gateway 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 선택한 은행에 따른 Mock 계좌 정보 생성
      const mockAccountInfo: BankInfo = {
        bankName: selectedBankForAccount,
        accountNumber: bankAccountNumber.replace(/(\d{6})(\d{2})(\d+)/, "$1-$2-$3"),
        accountHolder: "홍길동"
      }
      
      setSavedAccountInfo(mockAccountInfo)
      setIsAccountVerified(true)
      alert("계좌 인증이 완료되었습니다!")
    } catch (error) {
      alert("계좌 인증에 실패했습니다. 계좌번호와 비밀번호를 확인해주세요.")
    } finally {
      setIsProcessing(false)
    }
  }

  // 결제 처리 함수
  const handlePayment = async () => {
    if (isProcessing) return

    // 공통 유효성 검사
    if (!validatePhoneNumber() || !validateAgreements()) {
      return
    }

    // 결제 방식별 유효성 검사
    if (paymentMethod === "card") {
      // 저장된 카드 사용 시에는 보안 필드 검증 스킵
      if (!useSavedCard) {
        if (!validateCardNumber() || !validateExpiryDate() || !validateCVV() || !validateCardPassword()) {
          return
        }
      } else {
        // 저장된 카드 사용 시 카드번호만 검증
        if (!validateCardNumber()) {
          return
        }
      }
    } else if (paymentMethod === "bank" && !isAccountVerified) {
      setErrors(prev => ({...prev, bankAccount: "계좌 인증을 먼저 완료해주세요."}))
      return
    } else if (paymentMethod === "transfer" && !isDepositCompleted) {
      setErrors(prev => ({...prev, transfer: "입금 완료 확인을 먼저 해주세요."}))
      return
    }

    setIsProcessing(true)

    try {
      // 1단계: 결제 계산 API 호출하여 calculationId 생성
      
      // 로그인 상태에 따른 userId 설정
      const currentUserId = isLoggedIn && loginInfo?.userId ? loginInfo.userId : "guest_user"
      
      const calculationData = {
        externalOrderId: reservationInfo.reservationNumber,
        userId: currentUserId,
        originalAmount: reservationInfo.price,
        mileageToUse: mileageToUse,
        availableMileage: availableMileage,
        requestedPromotions: []
      }
      
      const calculationResponse = await apiClient.post("/api/v1/payments/calculate", calculationData)
      const calculationId = calculationResponse.data.calculationId

      // 2단계: 결제 방식에 따른 처리
      let backendPaymentMethod = ""
      
      if (paymentMethod === "simple") {
        backendPaymentMethod = simplePaymentType
      } else if (paymentMethod === "card") {
        backendPaymentMethod = "CREDIT_CARD"
      } else if (paymentMethod === "bank") {
        backendPaymentMethod = "BANK_ACCOUNT"
      } else if (paymentMethod === "transfer") {
        backendPaymentMethod = "BANK_TRANSFER"
      }

      const paymentData = {
        merchantOrderId: reservationInfo.reservationNumber,
        amount: finalPayableAmount, // 마일리지 할인이 적용된 최종 금액 사용
        paymentMethod: backendPaymentMethod,
        productName: `${reservationInfo.trainType} ${reservationInfo.trainNumber} (${reservationInfo.departureStation}→${reservationInfo.arrivalStation})`,
        buyerName: "결제자",
        buyerEmail: "test@example.com",
        buyerPhone: paymentMethod === "card" ? `${cardPhonePrefix}${cardPhoneNumber}` : 
                    paymentMethod === "bank" ? `${bankPhonePrefix}${bankPhoneNumber}` :
                    paymentMethod === "simple" ? `${simplePhonePrefix}${simplePhoneNumber}` :
                    paymentMethod === "transfer" ? `${transferPhonePrefix}${transferPhoneNumber}` :
                    `${receiptPhonePrefix}${receiptPhoneNumber}`,
        successUrl: `${window.location.origin}/ticket/payment/success`,
        failUrl: `${window.location.origin}/ticket/payment/fail`,
        cancelUrl: `${window.location.origin}/ticket/payment/fail`,
        calculationId: calculationId,
        // 로그인된 회원 정보 추가
        memberId: isLoggedIn && loginInfo?.userId ? parseInt(loginInfo.userId.toString()) : null
      }

      // PG 결제 요청
      const response = await apiClient.post("/api/v1/payments/pg/request", paymentData)

      if (response.data?.result?.paymentUrl) {
        window.location.href = response.data.result.paymentUrl
      } else {
        // Mock 환경에서는 바로 결제 승인 처리
        const approveResponse = await apiClient.post("/api/v1/payments/pg/approve", {
          paymentMethod: backendPaymentMethod,
          pgTransactionId: response.data?.result?.pgTransactionId || "MOCK_TID_" + Date.now(),
          merchantOrderId: reservationInfo.reservationNumber,
          calculationId: calculationId,
          buyerName: "결제자",
          buyerEmail: "test@example.com",
          buyerPhone: paymentMethod === "card" ? `${cardPhonePrefix}${cardPhoneNumber}` : 
                      paymentMethod === "bank" ? `${bankPhonePrefix}${bankPhoneNumber}` :
                      paymentMethod === "simple" ? `${simplePhonePrefix}${simplePhoneNumber}` :
                      paymentMethod === "transfer" ? `${transferPhonePrefix}${transferPhoneNumber}` :
                      `${receiptPhonePrefix}${receiptPhoneNumber}`,
          // 현금영수증 정보 추가
          requestReceipt: requestReceipt,
          receiptType: receiptType,
          receiptPhoneNumber: receiptType === "personal" ? `${receiptPhonePrefix}${receiptPhoneNumber}` : null,
          businessNumber: receiptType === "business" ? businessNumber : null,
          // 로그인된 회원 정보 추가
          memberId: isLoggedIn && loginInfo?.userId ? parseInt(loginInfo.userId.toString()) : null
        })
        
        // 결제 수단 저장 처리 (저장된 결제수단을 사용하지 않은 경우에만)
        if (agreeSavePayment && !useSavedCard && !useSavedAccount) {
          try {
            await savePaymentMethod(backendPaymentMethod)
            
            // 저장 후 목록 새로고침
            await fetchSavedPaymentMethods()
          } catch (error) {
            console.warn("⚠️ 결제 수단 저장 실패:", error)
            // 결제는 성공했으므로 저장 실패는 경고만 표시
          }
        }
        
        alert(`결제가 완료되었습니다!`)
        router.push(`/ticket/payment-complete?reservationId=${reservationInfo.reservationNumber}`)
      }
    } catch (error: any) {
      console.error("❌ 결제 실패:", error)
      const errorMessage = error.response?.data?.message || "결제 처리 중 오류가 발생했습니다."
      alert(errorMessage)
      router.push(`/ticket/payment/fail?error=${encodeURIComponent(errorMessage)}`)
    } finally {
      setIsProcessing(false)
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/ticket/reservation">
              <ChevronLeft className="h-4 w-4" />
              이전
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">결제</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* 예약 정보 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Train className="h-5 w-5" />
                  예약 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={getTrainTypeColor(reservationInfo.trainType)}>
                    {reservationInfo.trainType} {reservationInfo.trainNumber}
                  </Badge>
                  <span className="text-sm text-gray-600">{reservationInfo.date}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{reservationInfo.departureStation}</div>
                    <div className="text-sm text-gray-600">{reservationInfo.departureTime}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className="text-right">
                    <div className="font-medium">{reservationInfo.arrivalStation}</div>
                    <div className="text-sm text-gray-600">{reservationInfo.arrivalTime}</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span>좌석</span>
                    <span>{reservationInfo.seatClass} {reservationInfo.carNumber}호차 {reservationInfo.seatNumber}번</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>예약번호</span>
                    <span>{reservationInfo.reservationNumber}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>결제 금액</span>
                    <span className="text-blue-600">{formatPrice(reservationInfo.price)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 결제 수단 선택 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>결제 수단 선택</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={paymentMethod} onValueChange={handleTabChange}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="simple">간편결제</TabsTrigger>
                    <TabsTrigger value="card">신용카드</TabsTrigger>
                    <TabsTrigger value="bank">내 통장</TabsTrigger>
                    <TabsTrigger value="transfer">계좌이체</TabsTrigger>
                  </TabsList>

                  {/* 간편결제 */}
                  <TabsContent value="simple" className="space-y-4">
                    <RadioGroup value={simplePaymentType} onValueChange={setSimplePaymentType}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="KAKAO_PAY" id="kakao" />
                        <Label htmlFor="kakao" className="flex items-center gap-2 cursor-pointer">
                          <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center text-black font-bold text-xs">
                            Ka
                          </div>
                          카카오페이
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NAVER_PAY" id="naver" />
                        <Label htmlFor="naver" className="flex items-center gap-2 cursor-pointer">
                          <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold text-xs">
                            N
                          </div>
                          네이버페이
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="PAYCO" id="payco" />
                        <Label htmlFor="payco" className="flex items-center gap-2 cursor-pointer">
                          <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold text-xs">
                            PC
                          </div>
                          PAYCO
                        </Label>
                      </div>
                    </RadioGroup>

                    {/* 간편결제 전용 휴대폰 번호 */}
                    <div>
                      <Label>휴대폰 번호 (인증용)</Label>
                      <div className="flex gap-2 mt-2">
                        <Select value={simplePhonePrefix} onValueChange={setSimplePhonePrefix}>
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
                          placeholder="12345678"
                          value={simplePhoneNumber}
                          onChange={(e) => setSimplePhoneNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
                          className="flex-1"
                        />
                      </div>
                      {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                    </div>
                  </TabsContent>

                  {/* 신용카드 */}
                  <TabsContent value="card" className="space-y-4">
                    {/* 저장된 카드 선택 - 접근성 개선 */}
                    {savedPaymentMethods.filter(method => method.paymentMethodType === 'CREDIT_CARD').length > 0 && (
                      <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">💳</span>
                          </div>
                          <Label className="text-lg font-semibold text-blue-800">저장된 카드 사용</Label>
                        </div>
                        <RadioGroup 
                          value={useSavedCard ? selectedSavedCard?.toString() : "new"} 
                          onValueChange={handleSavedCardChange}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value="new" id="new-card" />
                            <Label htmlFor="new-card" className="text-base font-medium cursor-pointer">새 카드 입력</Label>
                          </div>
                          {savedPaymentMethods
                            .filter(method => method.paymentMethodType === 'CREDIT_CARD')
                            .map((method) => (
                              <div key={method.id} 
                                   className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:bg-blue-50 cursor-pointer">
                                <RadioGroupItem 
                                  value={method.id.toString()} 
                                  id={`saved-card-${method.id}`}
                                />
                                <Label htmlFor={`saved-card-${method.id}`} className="flex-1 cursor-pointer">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-base">{method.alias}</div>
                                      <div className="text-gray-600 text-sm">
                                        **** **** **** {method.cardNumber?.slice(-4)}
                                      </div>
                                    </div>
                                    {method.isDefault && (
                                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                        기본카드
                                      </Badge>
                                    )}
                                  </div>
                                </Label>
                              </div>
                            ))}
                        </RadioGroup>
                      </div>
                    )}

                    {/* 카드 입력 폼 */}
                    <div>
                      <Label>카드 구분</Label>
                      <RadioGroup value={cardType} onValueChange={setCardType} className="flex gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="personal" id="personal" disabled={useSavedCard} />
                          <Label htmlFor="personal" className={useSavedCard ? "text-gray-400" : ""}>개인</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="corporate" id="corporate" disabled={useSavedCard} />
                          <Label htmlFor="corporate" className={useSavedCard ? "text-gray-400" : ""}>법인</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>카드번호</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          value={cardNumber1}
                          onChange={(e) => handleCardNumberChange(e.target.value, 1)}
                          maxLength={4}
                          disabled={useSavedCard}
                        />
                        <Input
                          value={cardNumber2}
                          onChange={(e) => handleCardNumberChange(e.target.value, 2)}
                          maxLength={4}
                          disabled={useSavedCard}
                        />
                        <Input
                          value={cardNumber3}
                          onChange={(e) => handleCardNumberChange(e.target.value, 3)}
                          maxLength={4}
                          disabled={useSavedCard}
                        />
                        <Input
                          value={cardNumber4}
                          onChange={(e) => handleCardNumberChange(e.target.value, 4)}
                          maxLength={4}
                          disabled={useSavedCard}
                        />
                      </div>
                      {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>유효기간</Label>
                        <div className="flex gap-2 mt-2">
                          <Select value={expiryMonth} onValueChange={setExpiryMonth} disabled={useSavedCard}>
                            <SelectTrigger>
                              <SelectValue placeholder="월" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                  {String(i + 1).padStart(2, '0')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={expiryYear} onValueChange={setExpiryYear} disabled={useSavedCard}>
                            <SelectTrigger>
                              <SelectValue placeholder="년" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => (
                                <SelectItem key={2025 + i} value={String(2025 + i)}>
                                  {2025 + i}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
                      </div>

                      <div>
                        <Label>CVC/CVV</Label>
                        <Input
                          type="password"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                          maxLength={3}
                          className="mt-2"
                          placeholder={useSavedCard ? "저장된 카드 (입력불필요)" : "3자리"}
                          disabled={useSavedCard}
                        />
                        {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>할부</Label>
                        <Select value={installment} onValueChange={setInstallment}>
                          <SelectTrigger className="mt-2">
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

                      <div>
                        <Label>카드 비밀번호</Label>
                        <Input
                          type="password"
                          value={cardPassword}
                          onChange={(e) => setCardPassword(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                          maxLength={4}
                          placeholder={useSavedCard ? "저장된 카드 (입력불필요)" : "4자리 전체"}
                          className="mt-2"
                          disabled={useSavedCard}
                        />
                        {errors.cardPassword && <p className="text-red-500 text-sm mt-1">{errors.cardPassword}</p>}
                      </div>
                    </div>

                    {/* 신용카드 전용 휴대폰 번호 */}
                    <div>
                      <Label>휴대폰 번호 (본인확인용)</Label>
                      <div className="flex gap-2 mt-2">
                        <Select value={cardPhonePrefix} onValueChange={setCardPhonePrefix}>
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
                          placeholder="12345678"
                          value={cardPhoneNumber}
                          onChange={(e) => setCardPhoneNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
                          className="flex-1"
                        />
                      </div>
                      {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                    </div>
                  </TabsContent>

                  {/* 내 통장 결제 */}
                  <TabsContent value="bank" className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">내 통장 결제 안내</h3>
                      <p className="text-sm text-gray-600">
                        계좌번호와 비밀번호를 입력하여 인증 후 결제가 가능합니다.
                      </p>
                    </div>

                    {/* 저장된 계좌 선택 - 접근성 개선 */}
                    {savedPaymentMethods.filter(method => method.paymentMethodType === 'BANK_ACCOUNT').length > 0 && (
                      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">🏦</span>
                          </div>
                          <Label className="text-lg font-semibold text-green-800">저장된 계좌 사용</Label>
                        </div>
                        <RadioGroup 
                          value={useSavedAccount ? selectedSavedAccount?.toString() : "new"} 
                          onValueChange={handleSavedAccountChange}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer">
                            <RadioGroupItem value="new" id="new-account" />
                            <Label htmlFor="new-account" className="text-base font-medium cursor-pointer">새 계좌 입력</Label>
                          </div>
                          {savedPaymentMethods
                            .filter(method => method.paymentMethodType === 'BANK_ACCOUNT')
                            .map((method) => {
                              const bankCodes: { [key: string]: string } = {
                                '004': '국민은행',
                                '088': '신한은행', 
                                '020': '우리은행',
                                '081': '하나은행',
                                '011': '농협은행',
                                '032': '부산은행',
                                '031': '대구은행',
                                '034': '광주은행',
                                '037': '전북은행',
                                '039': '경남은행',
                                '035': '제주은행',
                                '090': '카카오뱅크',
                                '089': '케이뱅크',
                                '092': '토스뱅크',
                                '003': 'IBK기업은행',
                              };
                              const bankName = bankCodes[method.bankCode || ''] || method.bankCode;
                              
                              return (
                                <div key={method.id} 
                                     className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:bg-green-50 cursor-pointer">
                                  <RadioGroupItem 
                                    value={method.id.toString()} 
                                    id={`saved-account-${method.id}`}
                                  />
                                  <Label htmlFor={`saved-account-${method.id}`} className="flex-1 cursor-pointer">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="font-medium text-base">{method.alias}</div>
                                        <div className="text-gray-600 text-sm">
                                          {bankName} ****{method.accountNumber?.slice(-4)}
                                        </div>
                                      </div>
                                      {method.isDefault && (
                                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                          기본계좌
                                        </Badge>
                                      )}
                                    </div>
                                  </Label>
                                </div>
                              );
                            })}
                        </RadioGroup>
                      </div>
                    )}

                    {!isAccountVerified ? (
                      <div className="space-y-4">
                        <div>
                          <Label>은행 선택</Label>
                          <Select 
                            value={selectedBankForAccount} 
                            onValueChange={setSelectedBankForAccount}
                            disabled={useSavedAccount}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="은행을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              {bankAccountInfo.map((bank, index) => (
                                <SelectItem key={index} value={bank.bankName}>
                                  {bank.bankName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.bankSelection && <p className="text-red-500 text-sm mt-1">{errors.bankSelection}</p>}
                        </div>

                        <div>
                          <Label>계좌번호</Label>
                          <Input
                            placeholder="계좌번호를 입력하세요"
                            value={bankAccountNumber}
                            onChange={(e) => setBankAccountNumber(e.target.value.replace(/[^0-9]/g, ""))}
                            className="mt-2"
                            disabled={useSavedAccount}
                          />
                          {errors.bankAccount && <p className="text-red-500 text-sm mt-1">{errors.bankAccount}</p>}
                        </div>

                        <div>
                          <Label>계좌 비밀번호 4자리</Label>
                          <Input
                            type="password"
                            value={bankPassword}
                            onChange={(e) => setBankPassword(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
                            maxLength={4}
                            className="mt-2"
                            placeholder={useSavedAccount ? "저장된 계좌 (입력불필요)" : "계좌 비밀번호 4자리"}
                            disabled={useSavedAccount}
                          />
                          {errors.bankPassword && <p className="text-red-500 text-sm mt-1">{errors.bankPassword}</p>}
                        </div>

                        {/* 내 통장 전용 휴대폰 번호 */}
                        <div>
                          <Label>휴대폰 번호</Label>
                          <div className="flex gap-2 mt-2">
                            <Select value={bankPhonePrefix} onValueChange={setBankPhonePrefix} disabled={useSavedAccount}>
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
                              placeholder="12345678"
                              value={bankPhoneNumber}
                              onChange={(e) => setBankPhoneNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
                              className="flex-1"
                              disabled={useSavedAccount}
                            />
                          </div>
                          {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                        </div>

                        <Button 
                          onClick={handleAccountVerification}
                          disabled={isProcessing}
                          className="w-full"
                        >
                          {isProcessing ? "인증 중..." : "계좌 인증"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">계좌 인증 완료</p>
                            <p className="text-sm text-green-600">
                              {savedAccountInfo?.bankName} {savedAccountInfo?.accountNumber} ({savedAccountInfo?.accountHolder})
                            </p>
                          </div>
                        </div>
                      </div>
                    )}


                  </TabsContent>

                  {/* 계좌이체 */}
                  <TabsContent value="transfer" className="space-y-4">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">계좌이체 이용안내</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 아래 계좌로 입금 후 결제/발권 버튼을 클릭해주세요</li>
                        <li>• 입금자명은 예약자명과 동일해야 합니다</li>
                        <li>• 입금 확인까지 최대 5분 소요됩니다</li>
                      </ul>
                    </div>

                    <div>
                      <Label>입금 은행 선택</Label>
                      <Select value={selectedBankForTransfer} onValueChange={setSelectedBankForTransfer}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="은행을 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccountInfo.map((bank, index) => (
                            <SelectItem key={index} value={bank.bankName}>
                              {bank.bankName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedBankForTransfer && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        {(() => {
                          const selectedBank = bankAccountInfo.find(bank => bank.bankName === selectedBankForTransfer)
                          return selectedBank ? (
                            <div>
                              <h4 className="font-medium mb-2">입금 계좌 정보</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">은행:</span> {selectedBank.bankName}</p>
                                <p><span className="font-medium">계좌번호:</span> {selectedBank.accountNumber}</p>
                                <p><span className="font-medium">예금주:</span> {selectedBank.accountHolder}</p>
                                <p><span className="font-medium">입금금액:</span> <span className="text-red-600 font-bold">{formatPrice(reservationInfo.price)}</span></p>
                              </div>
                            </div>
                          ) : null
                        })()}
                      </div>
                    )}

                    {selectedBankForTransfer && (
                      <div className="flex items-center space-x-2">
                                                 <Checkbox 
                           id="depositCompleted" 
                           checked={isDepositCompleted} 
                           onCheckedChange={(checked) => setIsDepositCompleted(checked === true)} 
                         />
                        <Label htmlFor="depositCompleted" className="text-sm">
                          위 계좌로 입금을 완료했습니다
                        </Label>
                      </div>
                    )}

                    {/* 계좌이체 전용 휴대폰 번호 */}
                    <div>
                      <Label>휴대폰 번호 (입금자 확인용)</Label>
                      <div className="flex gap-2 mt-2">
                        <Select value={transferPhonePrefix} onValueChange={setTransferPhonePrefix}>
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
                          placeholder="12345678"
                          value={transferPhoneNumber}
                          onChange={(e) => setTransferPhoneNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
                          className="flex-1"
                        />
                      </div>
                      {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                    </div>

                    {errors.transfer && <p className="text-red-500 text-sm">{errors.transfer}</p>}
                  </TabsContent>
                </Tabs>

                {/* 마일리지 사용 */}
                <div className="mt-6">
                  <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-medium">마일리지 사용</Label>
                      <span className="text-sm text-gray-600">
                        보유: {availableMileage.toLocaleString()}P | 최대사용: {maxUsableMileage.toLocaleString()}P
                      </span>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <Input
                        type="number"
                        placeholder="사용할 마일리지 입력"
                        value={mileageToUse === 0 ? '' : mileageToUse}
                        onChange={(e) => handleMileageChange(e.target.value)}
                        min="0"
                        max={Math.min(availableMileage, maxUsableMileage)}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium">P</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleMileageChange(Math.min(availableMileage, maxUsableMileage).toString())}
                      >
                        전액사용
                      </Button>
                    </div>
                    
                    {mileageToUse > 0 && (
                      <div className="bg-white p-3 rounded border">
                        <div className="flex justify-between text-sm">
                          <span>원래 금액:</span>
                          <span>{formatPrice(reservationInfo.price)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-blue-600">
                          <span>마일리지 할인:</span>
                          <span>-{mileageToUse.toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                          <span>최종 결제금액:</span>
                          <span className="text-red-600">{formatPrice(finalPayableAmount)}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* 마일리지 사용 시 현금영수증 선택적 신청 */}
                    {mileageToUse > 0 && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <Checkbox 
                            id="mileageReceipt" 
                            checked={requestReceipt} 
                            onCheckedChange={(checked) => setRequestReceipt(checked === true)}
                          />
                          <Label htmlFor="mileageReceipt" className="text-sm font-medium">
                            현금영수증 신청 (선택사항)
                          </Label>
                        </div>
                        
                        {requestReceipt && (
                          <>
                            <RadioGroup value={receiptType} onValueChange={setReceiptType} className="flex gap-4 mb-3">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="personal" id="mileagePersonalReceipt" />
                                <Label htmlFor="mileagePersonalReceipt">개인 소득공제</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="business" id="mileageBusinessReceipt" />
                                <Label htmlFor="mileageBusinessReceipt">사업자 증빙</Label>
                              </div>
                            </RadioGroup>
                            
                            {receiptType === "personal" && (
                              <div>
                                <Label className="text-sm">휴대폰 번호</Label>
                                <div className="flex gap-2 mt-1">
                                  <Select value={receiptPhonePrefix} onValueChange={setReceiptPhonePrefix}>
                                    <SelectTrigger className="w-20">
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
                                    placeholder="12345678"
                                    value={receiptPhoneNumber}
                                    onChange={(e) => setReceiptPhoneNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
                                    className="flex-1"
                                  />
                                </div>
                              </div>
                            )}
                            
                            {receiptType === "business" && (
                              <div>
                                <Label className="text-sm">사업자등록번호</Label>
                                <Input
                                  placeholder="000-00-00000"
                                  value={businessNumber}
                                  onChange={(e) => setBusinessNumber(e.target.value)}
                                  className="mt-1"
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 현금영수증 (현금성 결제는 항상 표시, 간편결제/신용카드는 마일리지 사용 시에만) */}
                {(mileageToUse === 0 && (paymentMethod === "bank" || paymentMethod === "transfer")) && (
                  <div className="mt-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="receipt" 
                        checked={requestReceipt} 
                        onCheckedChange={(checked) => setRequestReceipt(checked === true)}
                        disabled={paymentMethod === "bank" || paymentMethod === "transfer"} // 현금성 결제는 필수
                      />
                      <Label htmlFor="receipt">
                        현금영수증 신청 {(paymentMethod === "bank" || paymentMethod === "transfer") && <span className="text-red-600">(필수)</span>}
                      </Label>
                    </div>
                    
                    {requestReceipt && (
                      <div className="mt-4 ml-6 space-y-3">
                        <RadioGroup value={receiptType} onValueChange={setReceiptType} className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="personal" id="personalReceipt" />
                            <Label htmlFor="personalReceipt">개인 소득공제</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="business" id="businessReceipt" />
                            <Label htmlFor="businessReceipt">사업자 증빙</Label>
                          </div>
                        </RadioGroup>
                        
                        {receiptType === "personal" && (
                          <div>
                            <Label className="text-sm">휴대폰 번호</Label>
                            <div className="flex gap-2 mt-1">
                              <Select value={receiptPhonePrefix} onValueChange={setReceiptPhonePrefix}>
                                <SelectTrigger className="w-20">
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
                                placeholder="12345678"
                                value={receiptPhoneNumber}
                                onChange={(e) => setReceiptPhoneNumber(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        )}
                        
                        {receiptType === "business" && (
                          <div>
                            <Label className="text-sm">사업자등록번호</Label>
                            <Input
                              placeholder="000-00-00000"
                              value={businessNumber}
                              onChange={(e) => setBusinessNumber(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 약관 동의 */}
                <div className="mt-6 space-y-3">
                  {/* 1. 결제 서비스 이용약관 동의 (필수) */}
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" checked={agreeTerms} onCheckedChange={(checked) => setAgreeTerms(checked === true)} />
                    <Label htmlFor="terms" className="text-sm">
                      <span className="text-red-600">*</span> 결제 서비스 이용약관에 동의합니다
                    </Label>
                  </div>
                  
                  {/* 2. 개인정보 수집 이용 약관 동의 (필수) */}
                  <div className="flex items-center space-x-2">
                    <Checkbox id="personalInfo" checked={agreePersonalInfo} onCheckedChange={(checked) => setAgreePersonalInfo(checked === true)} />
                    <Label htmlFor="personalInfo" className="text-sm">
                      <span className="text-red-600">*</span> 개인정보 수집 및 이용에 동의합니다
                    </Label>
                  </div>
                  
                  {/* 3. 결제 수단 저장 체크박스 (선택사항) - 신용카드와 내 통장 결제에만 표시 */}
                  {(paymentMethod === "card" || paymentMethod === "bank") && !(useSavedCard || useSavedAccount) && (
                    <div className="flex items-center space-x-2">
                      <Checkbox id="savePayment" checked={agreeSavePayment} onCheckedChange={(checked) => setAgreeSavePayment(checked === true)} />
                      <Label htmlFor="savePayment" className="text-sm">
                        결제 수단을 저장하여 다음에도 사용하겠습니다
                      </Label>
                    </div>
                  )}
                  
                  {errors.agreements && <p className="text-red-500 text-sm">{errors.agreements}</p>}
                </div>

                {/* 결제 버튼 */}
                <Button 
                  onClick={handlePayment} 
                  disabled={isProcessing}
                  className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                >
                  {isProcessing ? "결제 처리 중..." : `${formatPrice(finalPayableAmount)} 결제하기`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
