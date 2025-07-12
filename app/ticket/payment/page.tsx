"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Train,
  ChevronLeft,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
  CheckCircle,
  User,
  Lock,
  Phone,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import apiClient, {
  savedPaymentMethodApi,
  mileageApi,
  paymentApi,
  bankAccountApi,
} from "@/lib/api/client";
import { getLoginInfo, isTokenExpired } from "@/lib/utils";

interface PaymentInfo {
  trainType: string;
  trainNumber: string;
  date: string;
  departureStation: string;
  arrivalStation: string;
  departureTime: string;
  arrivalTime: string;
  seatClass: string;
  carNumber: number;
  seatNumber: string;
  price: number;
  reservationNumber: string;
}

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

interface SavedPaymentMethod {
  id: number;
  memberId: number;
  paymentMethodType: string;
  alias: string; // displayName → alias로 변경
  cardNumber?: string;
  cardExpiryMonth?: string;
  cardExpiryYear?: string;
  cardHolderName?: string;
  cardCvc?: string; // CVC 필드 추가
  bankCode?: string;
  accountNumber?: string;
  accountHolderName?: string;
  accountPassword?: string; // 계좌 비밀번호 필드 추가
  isDefault: boolean;
  createdAt: string;
}

export default function PaymentPage() {
  const router = useRouter();

  // 로그인 정보 상태
  const [loginInfo, setLoginInfo] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true); // 초기 로딩 상태

  // 비회원 정보 상태 추가
  const [nonMemberInfo, setNonMemberInfo] = useState({
    name: "",
    password: "",
    phone: "",
    confirmPassword: "",
  });

  // 비회원 안내 모달 상태
  const [showGuestNotice, setShowGuestNotice] = useState(false);

  // 결제 방식 상태
  const [paymentMethod, setPaymentMethod] = useState("simple");
  const [simplePaymentType, setSimplePaymentType] = useState("KAKAO_PAY");

  // 탭 변경 시 필드 초기화 함수
  const resetFieldsForTab = (newTab: string) => {
    // 공통 필드 초기화
    setErrors({});
    setIsProcessing(false);

    // 현금영수증 관련 초기화 (현금성 결제가 아닌 경우)
    if (newTab === "simple" || newTab === "card") {
      setRequestReceipt(false);
    } else {
      // 현금성 결제 (bank, transfer)는 현금영수증 기본 체크
      setRequestReceipt(true);
    }
    setMileageRequestReceipt(false); // 마일리지 현금영수증 초기화
    setReceiptType("personal");
    setBusinessNumber("");

    if (newTab === "simple") {
      // 간편결제 초기화
      setSimplePaymentType("KAKAO_PAY");
      setSimplePhonePrefix("010");
      setSimplePhoneNumber("");
    } else if (newTab === "card") {
      // 신용카드 필드 초기화
      setUseSavedCard(false);
      setSelectedSavedCard(null);
      setCardNumber1("");
      setCardNumber2("");
      setCardNumber3("");
      setCardNumber4("");
      setExpiryMonth("");
      setExpiryYear("2025");
      setCvv("");
      setCardPassword("");
      setCardType("personal");
      setInstallment("일시불");
      setCardPhonePrefix("010");
      setCardPhoneNumber("");
      setCardHolderName(""); // 카드 소유자명 초기화
      setCardAlias(""); // 카드 별칭 초기화
    } else if (newTab === "bank") {
      // 내 통장 필드 초기화
      setUseSavedAccount(false);
      setSelectedSavedAccount(null);
      setSelectedBankForAccount("");
      setBankAccountNumber("");
      setBankPassword("");
      setIsAccountVerified(false);
      setSavedAccountInfo(null);
      setBankPhonePrefix("010");
      setBankPhoneNumber("");
      setBankAlias(""); // 계좌 별칭 초기화
    } else if (newTab === "transfer") {
      // 계좌이체 필드 초기화
      setSelectedBankForTransfer("");
      setIsDepositCompleted(false);
      setTransferPhonePrefix("010");
      setTransferPhoneNumber("");
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (newTab: string) => {
    resetFieldsForTab(newTab);
    setPaymentMethod(newTab);
  };

  // 신용카드 상태
  const [cardType, setCardType] = useState("personal");
  const [cardNumber1, setCardNumber1] = useState("");
  const [cardNumber2, setCardNumber2] = useState("");
  const [cardNumber3, setCardNumber3] = useState("");
  const [cardNumber4, setCardNumber4] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("2025");
  const [cvv, setCvv] = useState("");
  const [installment, setInstallment] = useState("일시불");
  const [cardPassword, setCardPassword] = useState("");
  const [cardHolderName, setCardHolderName] = useState(""); // 추가
  const [cardAlias, setCardAlias] = useState(""); // 추가

  // 내 통장 결제 상태
  const [selectedBankForAccount, setSelectedBankForAccount] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankPassword, setBankPassword] = useState("");
  const [isAccountVerified, setIsAccountVerified] = useState(false);
  const [savedAccountInfo, setSavedAccountInfo] = useState<BankInfo | null>(
    null,
  );
  const [bankAlias, setBankAlias] = useState(""); // 추가

  // 계좌이체 상태
  const [selectedBankForTransfer, setSelectedBankForTransfer] = useState("");
  const [isDepositCompleted, setIsDepositCompleted] = useState(false);

  // URL 파라미터에서 예약 정보 가져오기
  const searchParams = useSearchParams();
  
  // 예약 정보 - URL 파라미터 또는 sessionStorage에서 가져오기
  const getReservationInfo = (): PaymentInfo => {
    // URL 파라미터 우선 확인
    const urlReservationId = searchParams?.get('reservationId') || null;
    const urlReservationNumber = searchParams?.get('reservationNumber') || null;
    
    if (urlReservationId) {
      // sessionStorage 업데이트
      sessionStorage.setItem('currentReservationId', urlReservationId);
      if (urlReservationNumber) {
        sessionStorage.setItem('currentReservationNumber', urlReservationNumber);
      }
    }
    
    // sessionStorage에서 예약 정보 가져오기 (실제 구현 시 API 호출로 대체)
    if (typeof window !== 'undefined') {
      const storedReservationInfo = sessionStorage.getItem('reservationInfo');
      if (storedReservationInfo) {
        try {
          return JSON.parse(storedReservationInfo);
        } catch (e) {
          // 예약 정보 파싱 실패
        }
      }
    }
    
    // 기본값 (개발용 - 실제로는 에러 처리 필요)
    return {
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
    };
  };
  
  const reservationInfo: PaymentInfo = getReservationInfo();

  // 마일리지 상태
  const [mileageToUse, setMileageToUse] = useState(0);
  const [availableMileage, setAvailableMileage] = useState(0);
  const [maxUsableMileage, setMaxUsableMileage] = useState(0);
  const [finalPayableAmount, setFinalPayableAmount] = useState(
    reservationInfo.price,
  );
  const [mileageInputValue, setMileageInputValue] = useState(""); // 입력 필드 값
  const [showMileageWarning, setShowMileageWarning] = useState(false); // 50% 제한 경고
  const [mileageDebounceTimer, setMileageDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // 휴대폰 번호 상태 - 결제수단별 완전 분리
  const [cardPhoneNumber, setCardPhoneNumber] = useState("");
  const [cardPhonePrefix, setCardPhonePrefix] = useState("010");
  const [bankPhoneNumber, setBankPhoneNumber] = useState("");
  const [bankPhonePrefix, setBankPhonePrefix] = useState("010");
  const [simplePhoneNumber, setSimplePhoneNumber] = useState(""); // 간편결제용 추가
  const [simplePhonePrefix, setSimplePhonePrefix] = useState("010"); // 간편결제용 추가
  const [transferPhoneNumber, setTransferPhoneNumber] = useState(""); // 계좌이체용 추가
  const [transferPhonePrefix, setTransferPhonePrefix] = useState("010"); // 계좌이체용 추가

  // 현금영수증 휴대폰 번호 상태
  const [receiptPhoneNumber, setReceiptPhoneNumber] = useState("");
  const [receiptPhonePrefix, setReceiptPhonePrefix] = useState("010");

  // 공통 상태
  const [requestReceipt, setRequestReceipt] = useState(false);
  const [mileageRequestReceipt, setMileageRequestReceipt] = useState(false); // 마일리지 사용 시 현금영수증
  const [receiptType, setReceiptType] = useState("personal");
  const [businessNumber, setBusinessNumber] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeSavePayment, setAgreeSavePayment] = useState(false);
  const [agreePersonalInfo, setAgreePersonalInfo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 에러 상태
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 마일리지 정책 표시 상태
  const [showMileagePolicy, setShowMileagePolicy] = useState(false);

  // 저장된 결제 수단 상태 - 탭별로 분리
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<
    SavedPaymentMethod[]
  >([]);
  const [selectedSavedCard, setSelectedSavedCard] = useState<number | null>(
    null,
  );
  const [useSavedCard, setUseSavedCard] = useState(false);
  const [selectedSavedAccount, setSelectedSavedAccount] = useState<
    number | null
  >(null);
  const [useSavedAccount, setUseSavedAccount] = useState(false);

  // 국내 은행 계좌번호 정보
  const bankAccountInfo: BankInfo[] = [
    {
      bankName: "국민은행",
      accountNumber: "123456-78-901234",
      accountHolder: "주식회사 레일로",
    },
    {
      bankName: "신한은행",
      accountNumber: "110-123-456789",
      accountHolder: "주식회사 레일로",
    },
    {
      bankName: "우리은행",
      accountNumber: "1002-123-456789",
      accountHolder: "주식회사 레일로",
    },
    {
      bankName: "하나은행",
      accountNumber: "123-456789-12345",
      accountHolder: "주식회사 레일로",
    },
    {
      bankName: "농협은행",
      accountNumber: "123456-56-789012",
      accountHolder: "주식회사 레일로",
    },
    {
      bankName: "부산은행",
      accountNumber: "123-456-789012",
      accountHolder: "주식회사 레일로",
    },
    {
      bankName: "대구은행",
      accountNumber: "123-12-123456",
      accountHolder: "주식회사 레일로",
    },
    {
      bankName: "광주은행",
      accountNumber: "123-123-123456",
      accountHolder: "주식회사 레일로",
    },
    {
      bankName: "전북은행",
      accountNumber: "123456-12-123456",
      accountHolder: "주식회사 레일로",
    },
    {
      bankName: "경남은행",
      accountNumber: "123-123-123456",
      accountHolder: "주식회사 레일로",
    },
    {
      bankName: "제주은행",
      accountNumber: "123456-123456",
      accountHolder: "주식회사 레일로",
    },
    {
      bankName: "카카오뱅크",
      accountNumber: "3333-12-1234567",
      accountHolder: "주식회사 레일로",
    },
    {
      bankName: "케이뱅크",
      accountNumber: "123456-12-123456",
      accountHolder: "주식회사 레일로",
    },
    {
      bankName: "토스뱅크",
      accountNumber: "1000-1234-123456",
      accountHolder: "주식회사 레일로",
    },
    {
      bankName: "IBK기업은행",
      accountNumber: "123-123456-12-123",
      accountHolder: "주식회사 레일로",
    },
  ];

  const getTrainTypeColor = (trainType: string) => {
    switch (trainType) {
      case "KTX":
        return "bg-blue-600 text-white";
      case "ITX-새마을":
        return "bg-green-600 text-white";
      case "무궁화호":
        return "bg-red-600 text-white";
      case "ITX-청춘":
        return "bg-purple-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString() + "원";
  };

  // 은행명을 은행코드로 변환하는 함수
  const getBankCode = (bankName: string): string => {
    const bankNameToCode: { [key: string]: string } = {
      국민은행: "004",
      신한은행: "088",
      우리은행: "020",
      하나은행: "081",
      농협은행: "011",
      부산은행: "032",
      대구은행: "031",
      광주은행: "034",
      전북은행: "037",
      경남은행: "039",
      제주은행: "035",
      카카오뱅크: "090",
      케이뱅크: "089",
      토스뱅크: "092",
      IBK기업은행: "003",
    };
    return bankNameToCode[bankName] || "004"; // 기본값: 국민은행
  };

  // 저장된 결제 수단 조회
  const fetchSavedPaymentMethods = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!isLoggedIn || !token || !loginInfo) {
        // 비회원이거나 로그인 정보가 없어 저장된 결제수단 조회를 건너뜁니다
        setSavedPaymentMethods([]);
        return;
      }


      // 올바른 API 호출 (JWT에서 memberId 자동 추출)
      const response = await savedPaymentMethodApi.getSavedPaymentMethods();


      // API 응답 구조에 따라 데이터 추출
      const methods = response.result || response.data || response || [];
      setSavedPaymentMethods(Array.isArray(methods) ? methods : []);
    } catch (error) {
      // 저장된 결제수단 조회 에러
      setSavedPaymentMethods([]);
    }
  };

  // 마일리지 계산 함수
  const calculateFinalAmount = (usedMileage: number) => {
    const discountAmount = usedMileage; // 1마일리지 = 1원
    const finalAmount = Math.max(0, reservationInfo.price - discountAmount);
    setFinalPayableAmount(finalAmount);
    return finalAmount;
  };

  // 마일리지 사용량 변경 핸들러 (디바운싱 포함)
  const handleMileageChange = (value: string, immediate = false) => {
    // 입력 필드 값은 즉시 업데이트
    setMileageInputValue(value);

    // 디바운스 타이머 초기화
    if (mileageDebounceTimer) {
      clearTimeout(mileageDebounceTimer);
    }

    // 즉시 실행 또는 디바운싱
    const applyMileageChange = () => {
      if (value === "") {
        setMileageToUse(0);
        calculateFinalAmount(0);
        setShowMileageWarning(false);
        return;
      }

      // 숫자가 아닌 문자(-, +, e 등) 제거하고 양수만 허용
      const cleanValue = value.replace(/[^0-9]/g, "").replace(/^0+/, "") || "";
      if (cleanValue === "") {
        setMileageToUse(0);
        calculateFinalAmount(0);
        setShowMileageWarning(false);
        return;
      }

      const numValue = parseInt(cleanValue) || 0;

      // 음수 방지 - 0보다 작으면 0으로 설정
      if (numValue < 0) {
        setMileageToUse(0);
        calculateFinalAmount(0);
        setShowMileageWarning(false);
        return;
      }

      // 최대 사용 가능 마일리지 제한 (보유 마일리지와 최대 사용 가능 중 작은 값)
      const maxAllowed = Math.min(availableMileage, maxUsableMileage);
      const clampedValue = Math.min(numValue, maxAllowed);

      // 100% 사용 가능하므로 경고 표시하지 않음
      setShowMileageWarning(false);

      // 사용자가 최대값을 초과하려 할 때 경고 메시지
      if (numValue > maxAllowed) {
        console.warn(
          `마일리지 최대 사용량 초과: 요청=${numValue}, 최대=${maxAllowed}`,
        );
        // 자동으로 최대값으로 조정
        setMileageToUse(maxAllowed);
        setMileageInputValue(maxAllowed.toString());
        calculateFinalAmount(maxAllowed);
      } else {
        setMileageToUse(clampedValue);
        calculateFinalAmount(clampedValue);
      }
    };

    if (immediate) {
      applyMileageChange();
    } else {
      // 300ms 디바운싱
      const timer = setTimeout(applyMileageChange, 300);
      setMileageDebounceTimer(timer);
    }
  };

  // 로그인 정보 확인 및 설정
  const checkLoginStatus = () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setIsLoggedIn(false);
        setLoginInfo(null);
        return;
      }

      // JWT 토큰에서 사용자 정보 추출
      try {
        const tokenParts = accessToken.split(".");
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));

          // 토큰이 만료되지 않았는지 확인
          const currentTime = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp > currentTime) {
            // 실제 JWT 토큰에서 사용자 정보 설정
            const loginData = {
              isLoggedIn: true,
              userId:
                parseInt(payload.memberId) || parseInt(payload.userId) || 1,
              username: payload.sub || "Unknown",
              memberNo: payload.sub || "Unknown",
              email: payload.email || "unknown@raillo.com",
              exp: payload.exp,
            };

            setLoginInfo(loginData);
            setIsLoggedIn(true);
          } else {
            // 토큰이 만료되었으면 로그아웃
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setIsLoggedIn(false);
            setLoginInfo(null);
          }
        } else {
          throw new Error("잘못된 토큰 형식");
        }
      } catch (error) {
        console.error("JWT 토큰 파싱 에러:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setIsLoggedIn(false);
        setLoginInfo(null);
      }
    } catch (error) {
      console.error("로그인 상태 확인 에러:", error);
      setIsLoggedIn(false);
      setLoginInfo(null);
    }
  };

  // mileageToUse가 변경될 때 입력 필드 값도 업데이트
  useEffect(() => {
    if (mileageToUse === 0) {
      setMileageInputValue("");
    } else {
      setMileageInputValue(mileageToUse.toString());
    }
  }, [mileageToUse]);

  // 마일리지 정보 조회
  const fetchMileageInfo = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token || !isLoggedIn) {
        console.warn("비회원이거나 토큰이 없어 마일리지 조회를 건너뜁니다");
        setAvailableMileage(0);
        setMaxUsableMileage(0);
        return;
      }

      const response = await mileageApi.getMileageBalance();

      // 마일리지 API 응답

      if (response && response.result) {
        // getMileageBalance는 상세 정보 반환
        const { currentBalance = 0, activeBalance = 0 } = response.result;

        // NaN 체크를 위한 추가 로깅
        // 마일리지 원본 값 확인

        const safeCurrentBalance = isNaN(currentBalance)
          ? 0
          : currentBalance || 0;
        const safeActiveBalance = isNaN(activeBalance) ? 0 : activeBalance || 0;
        
        // 100% 결제 가능 - 결제 금액과 보유 마일리지 중 작은 값
        const maxUsableByPrice = reservationInfo.price;
        const maxUsableByBalance = safeCurrentBalance;
        const maxUsable = Math.min(maxUsableByPrice, maxUsableByBalance);

        setAvailableMileage(safeCurrentBalance);
        setMaxUsableMileage(maxUsable);

        // 마일리지 정보 조회 성공
      } else {
        // 마일리지 응답 데이터가 예상과 다릅니다
      }
    } catch (error) {
      // 마일리지 조회 실패
      setAvailableMileage(0);
      setMaxUsableMileage(0);
    }
  };

  // URL 파라미터 감지 및 sessionStorage 업데이트
  useEffect(() => {
    if (searchParams) {
      const urlReservationId = searchParams.get('reservationId');
      const urlReservationNumber = searchParams.get('reservationNumber');
      
      if (urlReservationId) {
        // URL에서 reservationId 감지
        sessionStorage.setItem('currentReservationId', urlReservationId);
      }
      
      if (urlReservationNumber) {
        // URL에서 reservationNumber 감지
        sessionStorage.setItem('currentReservationNumber', urlReservationNumber);
      }
    }
  }, [searchParams]);

  // 컴포넌트 마운트 시 로그인 상태 확인 및 데이터 조회
  useEffect(() => {
    // localStorage에서 토큰을 먼저 확인
    const token = localStorage.getItem("accessToken");
    if (token) {
      // 토큰이 있으면 로그인 상태로 간주
      checkLoginStatus();
    } else {
      // 토큰이 없으면 비로그인 상태로 즉시 설정
      setIsLoggedIn(false);
      setLoginInfo(null);
      setIsInitialLoading(false);
    }
  }, []);

  // 로그인 상태 확인 후 비회원 안내 표시
  useEffect(() => {
    // 초기 로딩이 완료된 후에만 팝업 표시
    const timer = setTimeout(() => {
      if (!isInitialLoading && !isLoggedIn) {
        setShowGuestNotice(true);
      } else {
        setShowGuestNotice(false);
      }
      setIsInitialLoading(false); // 초기 로딩 완료
    }, 300); // 스켈레톤 표시를 위한 최소 시간

    return () => clearTimeout(timer);
  }, [isLoggedIn, isInitialLoading]);

  // 로그인 상태 변경 시 마일리지 조회
  useEffect(() => {
    if (isLoggedIn && loginInfo) {
      fetchMileageInfo();
      fetchSavedPaymentMethods();
    }
  }, [isLoggedIn, loginInfo]);

  // 저장된 결제수단 상태 변경 감지
  useEffect(() => {
    if (savedPaymentMethods && savedPaymentMethods.length > 0) {
      // 기본 결제수단이 있는지 확인하고 설정
      const defaultMethod = savedPaymentMethods.find(
        (method) => method.isDefault,
      );
      if (defaultMethod) {
        setPaymentMethod("saved");
        if (defaultMethod.paymentMethodType === "CREDIT_CARD") {
          setSelectedSavedCard(defaultMethod.id);
        } else if (defaultMethod.paymentMethodType === "BANK_ACCOUNT") {
          setSelectedSavedAccount(defaultMethod.id);
        }
      }
    }
  }, [savedPaymentMethods]);

  // 원본 결제수단 조회 (실제 카드번호 포함)
  const fetchRawPaymentMethod = async (paymentMethodId: number) => {
    try {
      if (!isLoggedIn || !loginInfo) {
        throw new Error("로그인이 필요합니다.");
      }

      const token = localStorage.getItem("accessToken");

      // JWT 토큰에서 memberId를 자동으로 추출하므로 파라미터 제거
      const response = await fetch(
        `http://localhost:8080/api/v1/saved-payment-methods/${paymentMethodId}/raw`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("원본 결제수단 조회 실패:", error);
      throw error;
    }
  };

  // 저장된 카드 선택 핸들러 (신용카드 탭 전용)
  const handleSavedCardChange = async (methodId: string) => {
    if (methodId === "new") {
      // 새 카드 입력 선택
      setUseSavedCard(false);
      setSelectedSavedCard(null);

      // 카드 필드 초기화
      setCardNumber1("");
      setCardNumber2("");
      setCardNumber3("");
      setCardNumber4("");
      setExpiryMonth("");
      setExpiryYear("2025");
      setCvv("");
      setCardPassword("");
    } else {
      // 저장된 카드 선택
      const methodIdNum = parseInt(methodId);
      const method = savedPaymentMethods.find(
        (m) => m.id === methodIdNum && m.paymentMethodType === "CREDIT_CARD",
      );
      if (!method) return;

      setUseSavedCard(true);
      setSelectedSavedCard(methodIdNum);

      // 원본 데이터 조회
      const rawMethod = await fetchRawPaymentMethod(methodIdNum);

      if (rawMethod && rawMethod.cardNumber) {
        // 원본 카드 번호를 4자리씩 분할하여 입력
        const cardNumber = rawMethod.cardNumber.replace(/[^0-9]/g, "");
        setCardNumber1(cardNumber.slice(0, 4));
        setCardNumber2(cardNumber.slice(4, 8));
        setCardNumber3(cardNumber.slice(8, 12));
        setCardNumber4(cardNumber.slice(12, 16));
        setExpiryMonth(rawMethod.cardExpiryMonth || "");
        setExpiryYear(rawMethod.cardExpiryYear || "2025");
        // 저장된 카드는 CVC와 비밀번호 재입력 불필요
        setCvv("123"); // 3자리 더미값으로 수정
        setCardPassword("1234"); // 더미값 설정
      } else {
        // 원본 조회 실패 시 마스킹된 데이터 사용
        if (method.cardNumber) {
          const cardNumber = method.cardNumber.replace(/[^0-9]/g, "");
          setCardNumber1(cardNumber.slice(0, 4));
          setCardNumber2(cardNumber.slice(4, 8));
          setCardNumber3(cardNumber.slice(8, 12));
          setCardNumber4(cardNumber.slice(12, 16));
          setExpiryMonth(method.cardExpiryMonth || "");
          setExpiryYear(method.cardExpiryYear || "2025");
          setCvv("123");
          setCardPassword("1234");
        }
      }
    }
  };

  // 저장된 계좌 선택 핸들러 (내 통장 탭 전용)
  const handleSavedAccountChange = (methodId: string) => {
    if (methodId === "new") {
      // 새 계좌 입력 선택
      setUseSavedAccount(false);
      setSelectedSavedAccount(null);

      // 통장 필드 초기화
      setSelectedBankForAccount("");
      setBankAccountNumber("");
      setBankPassword("");
      setIsAccountVerified(false);
    } else {
      // 저장된 계좌 선택
      const methodIdNum = parseInt(methodId);
      const method = savedPaymentMethods.find(
        (m) => m.id === methodIdNum && m.paymentMethodType === "BANK_ACCOUNT",
      );
      if (!method) return;

      setUseSavedAccount(true);
      setSelectedSavedAccount(methodIdNum);

      // 은행 코드를 은행명으로 변환
      const bankCodes: { [key: string]: string } = {
        "004": "국민은행",
        "088": "신한은행",
        "020": "우리은행",
        "081": "하나은행",
        "011": "농협은행",
        "032": "부산은행",
        "031": "대구은행",
        "034": "광주은행",
        "037": "전북은행",
        "039": "경남은행",
        "035": "제주은행",
        "090": "카카오뱅크",
        "089": "케이뱅크",
        "092": "토스뱅크",
        "003": "IBK기업은행",
      };

      const bankName =
        bankCodes[method.bankCode || ""] || method.bankCode || "";
      setSelectedBankForAccount(bankName);
      setBankAccountNumber(method.accountNumber || "");
      // 저장된 계좌는 비밀번호 재입력 불필요
      setBankPassword("1234"); // 더미값 설정
      setIsAccountVerified(true); // 저장된 계좌는 검증 완료로 처리

      // 저장된 계좌 정보를 savedAccountInfo에 설정
      const accountInfo: BankInfo = {
        bankName: bankName,
        accountNumber: (method.accountNumber || "").replace(
          /(\d{6})(\d{2})(\d+)/,
          "$1-$2-$3",
        ),
        accountHolder: method.accountHolderName || "홍길동",
      };
      setSavedAccountInfo(accountInfo);
    }
  };

  // 유효성 검사 함수들
  const validateCardNumber = () => {
    const fullCardNumber =
      cardNumber1 + cardNumber2 + cardNumber3 + cardNumber4;
    if (fullCardNumber.length !== 16) {
      setErrors((prev) => ({
        ...prev,
        cardNumber: "카드번호는 16자리를 입력해주세요.",
      }));
      return false;
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.cardNumber;
      return newErrors;
    });
    return true;
  };

  const validateExpiryDate = () => {
    if (!expiryMonth || !expiryYear) {
      setErrors((prev) => ({ ...prev, expiry: "유효기간을 선택해주세요." }));
      return false;
    }
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const expYear = parseInt(expiryYear);
    const expMonth = parseInt(expiryMonth);

    if (
      expYear < currentYear ||
      (expYear === currentYear && expMonth < currentMonth)
    ) {
      setErrors((prev) => ({
        ...prev,
        expiry: "유효한 만료일을 입력해주세요.",
      }));
      return false;
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.expiry;
      return newErrors;
    });
    return true;
  };

  const validateCVV = () => {
    if (cvv.length !== 3) {
      setErrors((prev) => ({
        ...prev,
        cvv: "CVC/CVV는 3자리를 입력해주세요.",
      }));
      return false;
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.cvv;
      return newErrors;
    });
    return true;
  };

  const validateCardPassword = () => {
    if (cardPassword.length !== 4) {
      setErrors((prev) => ({
        ...prev,
        cardPassword: "카드 비밀번호 4자리를 입력해주세요.",
      }));
      return false;
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.cardPassword;
      return newErrors;
    });
    return true;
  };

  const validatePhoneNumber = () => {
    let phoneToCheck = "";

    // 결제 방식에 따라 검증할 휴대폰 번호 결정
    if (paymentMethod === "card") {
      phoneToCheck = cardPhoneNumber;
    } else if (paymentMethod === "bank") {
      phoneToCheck = bankPhoneNumber;
    } else if (paymentMethod === "simple") {
      phoneToCheck = simplePhoneNumber;
    } else if (paymentMethod === "transfer") {
      phoneToCheck = transferPhoneNumber;
    } else {
      phoneToCheck = receiptPhoneNumber; // 기본값으로 현금영수증 번호 사용
    }

    if (phoneToCheck.length !== 8) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: "전화번호 8자리를 입력해주세요.",
      }));
      return false;
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.phoneNumber;
      return newErrors;
    });
    return true;
  };

  const validateAgreements = () => {
    if (!agreeTerms) {
      setErrors((prev) => ({
        ...prev,
        agreements: "결제 서비스 이용약관에 동의해주세요.",
      }));
      return false;
    }
    if (!agreePersonalInfo) {
      setErrors((prev) => ({
        ...prev,
        agreements: "개인정보 수집 및 이용에 동의해주세요.",
      }));
      return false;
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.agreements;
      return newErrors;
    });
    return true;
  };

  const validateBankAccount = () => {
    if (!selectedBankForAccount) {
      setErrors((prev) => ({ ...prev, bankSelection: "은행을 선택해주세요." }));
      return false;
    }
    if (bankAccountNumber.length < 10) {
      setErrors((prev) => ({
        ...prev,
        bankAccount: "올바른 계좌번호를 입력해주세요.",
      }));
      return false;
    }
    if (bankPassword.length !== 4) {
      setErrors((prev) => ({
        ...prev,
        bankPassword: "계좌 비밀번호 4자리를 입력해주세요.",
      }));
      return false;
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.bankSelection;
      delete newErrors.bankAccount;
      delete newErrors.bankPassword;
      return newErrors;
    });
    return true;
  };

  // 비회원 정보 유효성 검사
  const validateNonMemberInfo = () => {
    if (isLoggedIn) return true; // 로그인 상태면 검증 스킵

    const newErrors: any = {};

    if (!nonMemberInfo.name.trim()) {
      newErrors.nonMemberName = "예약자명을 입력해주세요.";
    }

    if (!nonMemberInfo.password) {
      newErrors.nonMemberPassword = "비회원 비밀번호를 입력해주세요.";
    } else if (nonMemberInfo.password.length < 4) {
      newErrors.nonMemberPassword = "비밀번호는 4자리 이상 입력해주세요.";
    }

    if (nonMemberInfo.password !== nonMemberInfo.confirmPassword) {
      newErrors.nonMemberConfirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    if (!nonMemberInfo.phone) {
      newErrors.nonMemberPhone = "휴대폰 번호를 입력해주세요.";
    } else if (!/^01[0-9]{9}$/.test(nonMemberInfo.phone)) {
      newErrors.nonMemberPhone =
        "올바른 휴대폰 번호를 입력해주세요. (01012345678)";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // 결제수단 저장 함수
  const savePaymentMethod = async (paymentMethodType: string) => {
    try {
      let paymentMethodData;

      if (paymentMethodType === "CREDIT_CARD") {
        paymentMethodData = {
          // memberId 제거 - JWT에서 자동 추출
          paymentMethodType: "CREDIT_CARD",
          alias: cardAlias || `${cardHolderName}의 카드`,
          cardNumber: `${cardNumber1}${cardNumber2}${cardNumber3}${cardNumber4}`,
          cardHolderName: cardHolderName,
          cardExpiryMonth: expiryMonth,
          cardExpiryYear: expiryYear,
          cardCvc: cvv, // CVC 추가
          isDefault: false,
        };
      } else if (paymentMethodType === "BANK_ACCOUNT") {
        paymentMethodData = {
          // memberId 제거 - JWT에서 자동 추출
          paymentMethodType: "BANK_ACCOUNT",
          alias: bankAlias || `${selectedBankForAccount} 계좌`,
          bankCode: getBankCode(selectedBankForAccount),
          accountNumber: bankAccountNumber,
          accountHolderName: savedAccountInfo?.accountHolder || "계좌주",
          accountPassword: bankPassword, // 계좌 비밀번호 추가
          isDefault: false,
        };
      } else {
        throw new Error("지원하지 않는 결제수단 타입입니다.");
      }

      console.log("저장할 결제수단 데이터:", paymentMethodData);

      // JWT 토큰 확인
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("로그인이 필요합니다.");
        return;
      }

      // 개선된 savedPaymentMethodApi 사용 - JWT에서 memberId 자동 추출
      const response =
        await savedPaymentMethodApi.addSavedPaymentMethod(paymentMethodData);

      if (response) {
        alert("결제수단이 성공적으로 저장되었습니다!");
        // 저장된 결제수단 목록 새로고침
        await fetchSavedPaymentMethods();
      }
    } catch (error: any) {
      console.error("결제수단 저장 에러:", error);

      // 🔄 401/403 에러는 이미 자동 토큰 갱신 처리됨
      let errorMessage = "결제수단 저장에 실패했습니다.";

      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = "인증이 필요합니다. 다시 로그인해주세요.";
      } else if (error.response?.data?.message) {
        errorMessage = `저장 실패: ${error.response.data.message}`;
      }

      alert(errorMessage);
    }
  };

  // 계좌 유효성 검증 - 검증 전용 API 사용 (저장하지 않음)
  const handleAccountVerification = async () => {
    if (!validateBankAccount()) return;

    setIsProcessing(true);
    try {
      // 계좌 검증 전용 API 사용 (저장하지 않음)
      const verificationData = {
        bankCode: selectedBankForAccount,
        accountNumber: bankAccountNumber,
        accountPassword: bankPassword,
      };

      console.log("🏦 계좌 인증 요청:", {
        bankCode: selectedBankForAccount,
        accountNumber: bankAccountNumber.replace(/(\d{4})(\d+)(\d{4})/, "$1****$3"),
        hasPassword: !!bankPassword,
      });

      // 계좌 검증 전용 API 호출
      const response = await bankAccountApi.verifyBankAccount(verificationData);

      if (response?.verified) {
        const accountInfo: BankInfo = {
          bankName: response.bankName || selectedBankForAccount,
          accountNumber: response.maskedAccountNumber || 
            bankAccountNumber.replace(/(\d{6})(\d{2})(\d+)/, "$1-$2-$3"),
          accountHolder: response.accountHolderName || "홍길동",
        };

        setSavedAccountInfo(accountInfo);
        setIsAccountVerified(true);
        alert("계좌 인증이 완료되었습니다!");
        
        // 검증만 하고 저장하지 않으므로 목록 새로고침 불필요
      } else {
        throw new Error(response?.message || "계좌 인증 실패");
      }
    } catch (error: any) {
      console.error("계좌 인증 에러:", error);

      let errorMessage =
        "계좌 인증에 실패했습니다. 계좌번호와 비밀번호를 확인해주세요.";

      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = "인증이 필요합니다. 다시 로그인해주세요.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // 결제 처리 함수
  const handlePayment = async () => {
    // 최신 로그인 정보 확인
    const currentLoginInfo = getLoginInfo();
    // 최신 로그인 정보 확인

    // 로그인 상태이지만 로그인 정보가 없는 경우 처리
    if (isLoggedIn && !currentLoginInfo) {
      alert("로그인 정보를 확인할 수 없습니다. 다시 로그인해주세요.");
      router.push("/login?redirect=/ticket/payment");
      return;
    }

    // 필수 검증
    if (!validateAgreements()) {
      // 약관 동의 검증 실패
      alert("필수 약관에 동의해주세요.");
      // 약관 동의 섹션으로 스크롤
      const agreementSection = document.querySelector('#agreement-section');
      if (agreementSection) {
        agreementSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // 비회원 정보 검증
    if (!validateNonMemberInfo()) {
      // 비회원 정보 검증 실패
      alert("비회원 정보를 올바르게 입력해주세요.");
      return;
    }

    // 결제 방식별 검증
    if (paymentMethod === "simple") {
      // 간편결제 전화번호 검증
      if (!simplePhoneNumber || simplePhoneNumber.length < 7) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: "휴대폰 번호를 정확히 입력해주세요.",
        }));
        return;
      }
      // 간편결제 전화번호
    } else if (paymentMethod === "card") {
      if (useSavedCard) {
        if (!selectedSavedCard) {
          setErrors((prev) => ({
            ...prev,
            cardNumber: "저장된 카드를 선택해주세요.",
          }));
          return;
        }
      } else {
        if (
          !validateCardNumber() ||
          !validateExpiryDate() ||
          !validateCVV() ||
          !validateCardPassword()
        )
          return;
      }
    } else if (paymentMethod === "bank" && !isAccountVerified) {
      setErrors((prev) => ({
        ...prev,
        bankAccount: "계좌 인증을 먼저 완료해주세요.",
      }));
      return;
    } else if (paymentMethod === "transfer" && !isDepositCompleted) {
      setErrors((prev) => ({
        ...prev,
        transfer: "입금 완료 확인을 먼저 해주세요.",
      }));
      return;
    }

    setIsProcessing(true);

    try {
      // 1단계: 결제 계산 API 호출하여 calculationId 생성

      // 로그인 상태에 따른 userId 설정
      const currentUserId =
        isLoggedIn && loginInfo?.userId ? loginInfo.userId : "guest_user";

      // sessionStorage에서 예약번호 가져오기
      const currentReservationNumber = sessionStorage.getItem('currentReservationNumber') || reservationInfo.reservationNumber;
      const currentReservationId = sessionStorage.getItem('currentReservationId');
      
      // URL에서 reservationId 확인 (재결제 시 새로운 예약번호)
      const urlReservationId = searchParams?.get('reservationId') || null;
      const finalReservationId = urlReservationId || currentReservationId;
      
      console.log('📋 결제 계산 준비:', {
        urlReservationId,
        currentReservationId,
        finalReservationId,
        currentReservationNumber
      });
      
      if (!finalReservationId || finalReservationId === '0') {
        // 유효하지 않은 reservationId
        alert('예약 정보가 올바르지 않습니다. 다시 시도해주세요.');
        return;
      }
      
      // sessionStorage에서 열차 정보 가져오기
      const storedTrainInfo = sessionStorage.getItem('trainInfo');
      let trainInfo = null;
      if (storedTrainInfo) {
        try {
          trainInfo = JSON.parse(storedTrainInfo);
          // 저장된 열차 정보 사용
        } catch (e) {
          // 열차 정보 파싱 실패
        }
      }
      
      const calculationData = {
        reservationId: finalReservationId ? parseInt(finalReservationId) : undefined, // Optional로 변경
        externalOrderId: currentReservationNumber,
        userId: currentUserId,
        originalAmount: reservationInfo.price,
        mileageToUse: mileageToUse, // BigDecimal로 백엔드에서 처리
        availableMileage: availableMileage, // BigDecimal로 백엔드에서 처리
        requestedPromotions: [],
        // 열차 정보 추가 (예약 삭제 시에도 결제 가능하도록)
        trainScheduleId: trainInfo?.trainScheduleId,
        trainDepartureTime: trainInfo?.trainDepartureTime ? trainInfo.trainDepartureTime.replace(' ', 'T') : undefined, // ISO 8601 형식으로 변환
        trainArrivalTime: trainInfo?.trainArrivalTime ? trainInfo.trainArrivalTime.replace(' ', 'T') : undefined, // ISO 8601 형식으로 변환
        trainOperator: trainInfo?.trainOperator,
        routeInfo: trainInfo?.routeInfo
      };

      console.log("💰 결제 계산 요청:", {
        ...calculationData,
        mileageInfo: {
          toUse: mileageToUse,
          available: availableMileage,
          finalAmount: finalPayableAmount,
        },
      });

      // 디버깅: 요청 직전 데이터 확인
      // 결제 계산 요청 직전 데이터 검증

      // 개선된 paymentApi 사용 - JWT에서 memberId 자동 추출
      const calculationResponse =
        await paymentApi.calculatePayment(calculationData);
      
      console.log("📥 결제 계산 API 응답:", calculationResponse);
      
      // API 응답이 SuccessResponse 형식이므로 result에서 데이터 추출
      const calculationResult = calculationResponse?.result;
      if (!calculationResult) {
        // calculationResponse.result가 없습니다
        alert("결제 계산 중 오류가 발생했습니다. 다시 시도해주세요.");
        return;
      }
      
      const calculationId = calculationResult.calculationId || calculationResult.id;
      if (!calculationId) {
        // calculationId를 찾을 수 없습니다
        alert("결제 계산 ID를 생성할 수 없습니다. 다시 시도해주세요.");
        return;
      }

      // 결제 계산 응답

      // 2단계: 결제 방식에 따른 처리
      let backendPaymentMethod = "";
      let paymentMethodInfo: any = {};

      if (paymentMethod === "simple") {
        backendPaymentMethod = simplePaymentType;
        // Simple payment type selected
      } else if (paymentMethod === "card") {
        backendPaymentMethod = "CREDIT_CARD";
        // Credit card payment selected
        // 신용카드 정보 추가
        if (!useSavedCard) {
          paymentMethodInfo = {
            cardNumber: cardNumber1 + cardNumber2 + cardNumber3 + cardNumber4,
            cardExpiryMonth: expiryMonth,
            cardExpiryYear: expiryYear,
            cardCvc: cvv,
            cardHolderName: cardHolderName,
            cardPassword: cardPassword
          };
        } else {
          // 저장된 카드 사용 시
          const savedCard = savedPaymentMethods.find(m => m.id === selectedSavedCard);
          if (savedCard) {
            paymentMethodInfo = {
              savedPaymentMethodId: savedCard.id,
              cardPassword: cardPassword // 저장된 카드도 비밀번호는 필요
            };
          }
        }
      } else if (paymentMethod === "bank") {
        backendPaymentMethod = "BANK_ACCOUNT";
        // Bank account payment selected
        // 계좌이체 정보 추가
        if (!useSavedAccount) {
          const bankCode = bankAccountInfo.find(b => b.bankName === selectedBankForAccount)?.bankCode || "";
          paymentMethodInfo = {
            bankCode: bankCode,
            accountNumber: bankAccountNumber,
            accountPassword: bankPassword,
            accountHolderName: loginInfo?.username || nonMemberInfo.name || "홍길동"
          };
        } else {
          // 저장된 계좌 사용 시
          const savedAccount = savedPaymentMethods.find(m => m.id === selectedSavedAccount);
          if (savedAccount) {
            paymentMethodInfo = {
              savedPaymentMethodId: savedAccount.id,
              accountPassword: bankPassword
            };
          }
        }
      } else if (paymentMethod === "transfer") {
        backendPaymentMethod = "BANK_TRANSFER";
        // Bank transfer payment selected
        // 계좌이체(가상계좌) 정보
        paymentMethodInfo = {
          depositorName: loginInfo?.username || nonMemberInfo.name || "입금자"
        };
      }

      // 구매자 정보 설정
      let buyerName = "구매자";
      let buyerEmail = "buyer@raillo.com";
      let buyerPhone = "";

      if (isLoggedIn && loginInfo) {
        buyerName = loginInfo.username || loginInfo.memberNo || "구매자";
        // email이 없거나 "unknown@raillo.com"인 경우 기본값 사용
        if (loginInfo.email && loginInfo.email !== "unknown@raillo.com") {
          buyerEmail = loginInfo.email;
        }
      } else if (!isLoggedIn && nonMemberInfo.name) {
        buyerName = nonMemberInfo.name;
        buyerEmail = "buyer@raillo.com"; // 비회원은 기본 이메일 사용
      }

      // 전화번호 결정 (결제 수단별 전화번호 우선 사용)
      if (paymentMethod === "card" && cardPhoneNumber) {
        buyerPhone = `${cardPhonePrefix}${cardPhoneNumber}`;
      } else if (paymentMethod === "bank" && bankPhoneNumber) {
        buyerPhone = `${bankPhonePrefix}${bankPhoneNumber}`;
      } else if (paymentMethod === "simple" && simplePhoneNumber) {
        buyerPhone = `${simplePhonePrefix}${simplePhoneNumber}`;
      } else if (paymentMethod === "transfer" && transferPhoneNumber) {
        buyerPhone = `${transferPhonePrefix}${transferPhoneNumber}`;
      } else if (!isLoggedIn && nonMemberInfo.phone) {
        buyerPhone = nonMemberInfo.phone;
      }

      // 기본 전화번호가 없으면 설정
      if (!buyerPhone) {
        buyerPhone = "010-0000-0000";
      }

      const paymentData = {
        merchantOrderId: currentReservationNumber,
        amount: finalPayableAmount, // 마일리지 할인이 적용된 최종 금액 사용
        paymentMethod: backendPaymentMethod,
        productName: `${reservationInfo.trainType} ${reservationInfo.trainNumber} (${reservationInfo.departureStation}→${reservationInfo.arrivalStation})`,
        buyerName: buyerName,
        buyerEmail: buyerEmail,
        buyerPhone: buyerPhone,
        successUrl: `${window.location.origin}/ticket/payment/success`,
        failUrl: `${window.location.origin}/ticket/payment/fail`,
        cancelUrl: `${window.location.origin}/ticket/payment/fail`,
        calculationId: calculationId,
        // 결제 수단별 추가 정보
        ...paymentMethodInfo,
        // memberId 제거 - JWT에서 자동 추출
      };

      console.log("📤 PG 결제 요청 데이터:", {
        ...paymentData,
        buyerInfo: {
          name: buyerName,
          email: buyerEmail,
          phone: buyerPhone,
          isLoggedIn: isLoggedIn,
          hasLoginInfo: !!loginInfo,
          loginInfoEmail: loginInfo?.email,
          loginInfoUsername: loginInfo?.username,
          loginInfoMemberNo: loginInfo?.memberNo,
        },
        paymentMethodInfo: {
          selected: paymentMethod,
          backend: backendPaymentMethod,
        },
      });

      // PG 결제 요청 - 개선된 paymentApi 사용
      const response = await paymentApi.requestPgPayment(paymentData);

      if (response?.result?.paymentUrl) {
        // 실제 PG사 결제 페이지로 리다이렉트
        window.location.href = response.result.paymentUrl;
      } else {
        // PG 결제 URL이 없는 경우 승인 처리
        // 구매자 정보 설정
        let buyerName = "구매자";
        let buyerEmail = "buyer@raillo.com";
        let buyerPhone = "";

        if (isLoggedIn && loginInfo) {
          buyerName = loginInfo.username || loginInfo.memberNo || "구매자";
          // email이 없거나 "unknown@raillo.com"인 경우 기본값 사용
          if (loginInfo.email && loginInfo.email !== "unknown@raillo.com") {
            buyerEmail = loginInfo.email;
          }
        } else if (!isLoggedIn && nonMemberInfo.name) {
          buyerName = nonMemberInfo.name;
          buyerPhone = nonMemberInfo.phone;
        }

        // 전화번호 결정 (결제 수단별 전화번호 우선 사용)
        if (paymentMethod === "card" && cardPhoneNumber) {
          buyerPhone = `${cardPhonePrefix}${cardPhoneNumber}`;
        } else if (paymentMethod === "bank" && bankPhoneNumber) {
          buyerPhone = `${bankPhonePrefix}${bankPhoneNumber}`;
        } else if (paymentMethod === "simple" && simplePhoneNumber) {
          buyerPhone = `${simplePhonePrefix}${simplePhoneNumber}`;
        } else if (paymentMethod === "transfer" && transferPhoneNumber) {
          buyerPhone = `${transferPhonePrefix}${transferPhoneNumber}`;
        } else if (!buyerPhone && receiptPhoneNumber) {
          buyerPhone = `${receiptPhonePrefix}${receiptPhoneNumber}`;
        }

        // 기본 전화번호가 없으면 설정
        if (!buyerPhone) {
          buyerPhone = "010-0000-0000";
        }

        // 백엔드 DTO에 맞는 데이터
        const approveData: PgPaymentApprovalRequest = {
          paymentMethod: backendPaymentMethod, // String으로 전송 (백엔드에서 enum 변환)
          pgTransactionId:
            response?.result?.pgTransactionId || "TID_" + Date.now(),
          merchantOrderId: currentReservationNumber,
          calculationId: calculationId, // 결제 계산 ID 포함 - 중요!
          // 회원/비회원 정보 (백엔드 API 스펙에 맞게 수정)
          ...(isLoggedIn && currentLoginInfo
            ? { 
                // 회원인 경우 - userId를 memberId로 사용 (Long 타입으로 변환)
                memberId: currentLoginInfo.userId ? Number(currentLoginInfo.userId) : null
              }
            : {
                // 비회원인 경우 - memberId를 null로 설정
                memberId: null,
                nonMemberName: nonMemberInfo.name || buyerName,
                nonMemberPhone: nonMemberInfo.phone || buyerPhone.replace(/-/g, ''),
                nonMemberPassword: nonMemberInfo.password ? 
                  nonMemberInfo.password.substring(0, 5).padEnd(5, '0') : "12345"
              }
          ),
          // 현금영수증 정보 추가
          requestReceipt: requestReceipt,
          receiptType: receiptType,
          receiptPhoneNumber:
            receiptType === "personal" && receiptPhoneNumber
              ? `${receiptPhonePrefix}${receiptPhoneNumber}`
              : null,
          businessNumber:
            receiptType === "business" && businessNumber
              ? businessNumber
              : null,
        };

        // 결제 수단별 추가 정보는 별도로 처리 (백엔드 DTO에 없는 필드들은 제외)
        // paymentMethodInfo는 프론트엔드에서만 사용하고 백엔드로는 전송하지 않음

        console.log("📤 PG 승인 요청 데이터:", {
          approveData,
          paymentMethodInfo: paymentMethodInfo, // 디버깅용으로만 출력
          debugInfo: {
            isLoggedIn: isLoggedIn,
            hasNonMemberInfo: !isLoggedIn && !!nonMemberInfo.name,
            buyerName: buyerName,
            buyerEmail: buyerEmail,
            buyerPhone: buyerPhone,
            loginInfo: {
              email: loginInfo?.email,
              username: loginInfo?.username,
              memberNo: loginInfo?.memberNo,
            },
            currentLoginInfo: {
              email: currentLoginInfo?.email,
              username: currentLoginInfo?.username,
              userId: currentLoginInfo?.userId,
              memberNo: currentLoginInfo?.memberNo,
            },
            memberId: approveData.memberId,
            isMemberPayment: !!approveData.memberId,
            paymentMethodType: typeof backendPaymentMethod,
            paymentMethodValue: backendPaymentMethod,
          },
        });
        
        // 실제 전송 데이터 확인
        // 실제 전송 데이터 (JSON) 확인

        // PG 승인 처리 - 개선된 paymentApi 사용
        // 최종 전송 데이터 타입 확인
        
        const approveResponse = await paymentApi.approvePgPayment(approveData);

        // 결제 수단 저장 처리 (저장된 결제수단을 사용하지 않은 경우에만)
        if (agreeSavePayment && !useSavedCard && !useSavedAccount) {
          try {
            await savePaymentMethod(backendPaymentMethod);

            // 저장 후 목록 새로고침
            await fetchSavedPaymentMethods();
          } catch (error) {
            // 결제 수단 저장 실패
            // 결제는 성공했으므로 저장 실패는 경고만 표시
          }
        }

        // 비회원인 경우 정보를 sessionStorage에 저장
        if (!isLoggedIn && nonMemberInfo.name) {
          sessionStorage.setItem('nonMemberInfo', JSON.stringify({
            name: nonMemberInfo.name,
            phone: nonMemberInfo.phone,
            password: nonMemberInfo.password
          }));
        }

        alert(`결제가 완료되었습니다!`);
        
        // 결제 완료 후 정확한 reservationId로 리다이렉트
        // URL의 reservationId를 최우선으로 사용
        const redirectReservationId = urlReservationId || finalReservationId || currentReservationNumber;
        const isGuestPayment = !isLoggedIn || !currentLoginInfo;
        
        // 결제 완료 리다이렉트
        
        // 이전 예약 정보 정리
        sessionStorage.removeItem('currentReservationId');
        sessionStorage.removeItem('currentReservationNumber');
        sessionStorage.removeItem('currentSeatReservationId');
        
        router.push(
          `/ticket/payment-complete?reservationId=${redirectReservationId}&isGuest=${isGuestPayment}`,
        );
      }
    } catch (error: any) {
      // 결제 실패
      console.error("결제 에러 상세:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      // 🔄 401/403 에러는 이미 자동 토큰 갱신 처리됨
      let errorMessage = "결제 처리 중 오류가 발생했습니다.";

      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = "인증이 필요합니다. 다시 로그인해주세요.";
      } else if (error.response?.data?.errorCode === "G_001") {
        errorMessage =
          "결제 정보가 올바르지 않습니다. 구매자 정보를 확인해주세요.";
      } else if (error.response?.data?.errorMessage) {
        errorMessage = error.response.data.errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(errorMessage);

      // 결제 실패 페이지로 이동하지 않고 현재 페이지에 머물기
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardNumberChange = (value: string, field: number) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 4);

    switch (field) {
      case 1:
        setCardNumber1(numericValue);
        break;
      case 2:
        setCardNumber2(numericValue);
        break;
      case 3:
        setCardNumber3(numericValue);
        break;
      case 4:
        setCardNumber4(numericValue);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 비회원 안내 모달 */}
      <Dialog open={showGuestNotice} onOpenChange={setShowGuestNotice}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              결제 방법 선택
            </DialogTitle>
            <DialogDescription>
              현재 로그인하지 않은 상태입니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="font-medium text-blue-800 mb-2">
                💡 회원 로그인 시 혜택:
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 마일리지 적립 및 사용</li>
                <li>• 결제수단 저장으로 간편결제</li>
                <li>• 예약 내역 자동 관리</li>
              </ul>
            </div>
            <div className="text-sm text-gray-600">
              비회원으로 결제하시겠습니까?
              <br />
              <span className="text-red-600">
                ※ 비회원 결제 시 마일리지 적립/사용이 불가합니다.
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={() => {
                setShowGuestNotice(false);
                router.push("/login?redirect=/ticket/payment");
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              로그인하고 결제하기
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowGuestNotice(false)}
              className="w-full"
            >
              비회원으로 계속하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
        {/* 초기 로딩 스켈레톤 */}
        {isInitialLoading ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 예약 정보 스켈레톤 */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            </div>

            {/* 결제 정보 스켈레톤 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <Skeleton className="h-10 w-full" />
                  <div className="space-y-3">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
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
                    <Badge
                      className={getTrainTypeColor(reservationInfo.trainType)}
                    >
                      {reservationInfo.trainType} {reservationInfo.trainNumber}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {reservationInfo.date}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {reservationInfo.departureStation}
                      </div>
                      <div className="text-sm text-gray-600">
                        {reservationInfo.departureTime}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <div className="text-right">
                      <div className="font-medium">
                        {reservationInfo.arrivalStation}
                      </div>
                      <div className="text-sm text-gray-600">
                        {reservationInfo.arrivalTime}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>좌석</span>
                      <span>
                        {reservationInfo.seatClass} {reservationInfo.carNumber}
                        호차 {reservationInfo.seatNumber}번
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>예약번호</span>
                      <span>{reservationInfo.reservationNumber}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>결제 금액</span>
                      <span className="text-blue-600">
                        {formatPrice(reservationInfo.price)}
                      </span>
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
                      <RadioGroup
                        value={simplePaymentType}
                        onValueChange={setSimplePaymentType}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="KAKAO_PAY" id="kakao" />
                          <Label
                            htmlFor="kakao"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center text-black font-bold text-xs">
                              Ka
                            </div>
                            카카오페이
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="NAVER_PAY" id="naver" />
                          <Label
                            htmlFor="naver"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white font-bold text-xs">
                              N
                            </div>
                            네이버페이
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="PAYCO" id="payco" />
                          <Label
                            htmlFor="payco"
                            className="flex items-center gap-2 cursor-pointer"
                          >
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
                          <Select
                            value={simplePhonePrefix}
                            onValueChange={setSimplePhonePrefix}
                          >
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
                            onChange={(e) =>
                              setSimplePhoneNumber(
                                e.target.value
                                  .replace(/[^0-9]/g, "")
                                  .slice(0, 8),
                              )
                            }
                            className="flex-1"
                          />
                        </div>
                        {errors.phoneNumber && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.phoneNumber}
                          </p>
                        )}
                      </div>
                    </TabsContent>

                    {/* 신용카드 */}
                    <TabsContent value="card" className="space-y-4">
                      {/* 저장된 카드 선택 - 회원 전용 */}
                      {isLoggedIn &&
                        savedPaymentMethods.filter(
                          (method) =>
                            method.paymentMethodType === "CREDIT_CARD",
                        ).length > 0 && (
                          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  💳
                                </span>
                              </div>
                              <Label className="text-lg font-semibold text-blue-800">
                                저장된 카드 사용
                              </Label>
                            </div>
                            <RadioGroup
                              value={
                                useSavedCard
                                  ? selectedSavedCard?.toString()
                                  : "new"
                              }
                              onValueChange={handleSavedCardChange}
                              className="space-y-3"
                            >
                              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem value="new" id="new-card" />
                                <Label
                                  htmlFor="new-card"
                                  className="text-base font-medium cursor-pointer"
                                >
                                  새 카드 입력
                                </Label>
                              </div>
                              {savedPaymentMethods
                                .filter(
                                  (method) =>
                                    method.paymentMethodType === "CREDIT_CARD",
                                )
                                .map((method) => (
                                  <div
                                    key={method.id}
                                    className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:bg-blue-50 cursor-pointer"
                                  >
                                    <RadioGroupItem
                                      value={method.id.toString()}
                                      id={`saved-card-${method.id}`}
                                    />
                                    <Label
                                      htmlFor={`saved-card-${method.id}`}
                                      className="flex-1 cursor-pointer"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <div className="font-medium text-base">
                                            {method.alias}
                                          </div>
                                          <div className="text-gray-600 text-sm">
                                            **** **** ****{" "}
                                            {method.cardNumber?.slice(-4)}
                                          </div>
                                        </div>
                                        {method.isDefault && (
                                          <Badge
                                            variant="outline"
                                            className="bg-blue-100 text-blue-800 border-blue-300"
                                          >
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
                        <RadioGroup
                          value={cardType}
                          onValueChange={setCardType}
                          className="flex gap-4 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="personal"
                              id="personal"
                              disabled={useSavedCard}
                            />
                            <Label
                              htmlFor="personal"
                              className={useSavedCard ? "text-gray-400" : ""}
                            >
                              개인
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="corporate"
                              id="corporate"
                              disabled={useSavedCard}
                            />
                            <Label
                              htmlFor="corporate"
                              className={useSavedCard ? "text-gray-400" : ""}
                            >
                              법인
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label>카드번호</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          <Input
                            value={cardNumber1}
                            onChange={(e) =>
                              handleCardNumberChange(e.target.value, 1)
                            }
                            maxLength={4}
                            placeholder="1234"
                            className="text-center h-10"
                            disabled={useSavedCard}
                          />
                          <Input
                            value={cardNumber2}
                            onChange={(e) =>
                              handleCardNumberChange(e.target.value, 2)
                            }
                            maxLength={4}
                            placeholder="5678"
                            className="text-center h-10"
                            disabled={useSavedCard}
                          />
                          <Input
                            value={cardNumber3}
                            onChange={(e) =>
                              handleCardNumberChange(e.target.value, 3)
                            }
                            maxLength={4}
                            placeholder="9012"
                            className="text-center h-10"
                            disabled={useSavedCard}
                          />
                          <Input
                            value={cardNumber4}
                            onChange={(e) =>
                              handleCardNumberChange(e.target.value, 4)
                            }
                            maxLength={4}
                            placeholder="3456"
                            className="text-center h-10"
                            disabled={useSavedCard}
                          />
                        </div>
                        {errors.cardNumber && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.cardNumber}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>유효기간</Label>
                          <div className="flex gap-2 mt-2">
                            <Select
                              value={expiryMonth}
                              onValueChange={setExpiryMonth}
                              disabled={useSavedCard}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="월" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => (
                                  <SelectItem
                                    key={i + 1}
                                    value={String(i + 1).padStart(2, "0")}
                                  >
                                    {String(i + 1).padStart(2, "0")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={expiryYear}
                              onValueChange={setExpiryYear}
                              disabled={useSavedCard}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="년" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => (
                                  <SelectItem
                                    key={2025 + i}
                                    value={String(2025 + i)}
                                  >
                                    {2025 + i}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {errors.expiry && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.expiry}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label>CVC/CVV</Label>
                          <Input
                            type="password"
                            value={cvv}
                            onChange={(e) =>
                              setCvv(
                                e.target.value
                                  .replace(/[^0-9]/g, "")
                                  .slice(0, 3),
                              )
                            }
                            maxLength={3}
                            className="mt-2"
                            placeholder={
                              useSavedCard
                                ? "저장된 카드 (입력불필요)"
                                : "3자리"
                            }
                            disabled={useSavedCard}
                          />
                          {errors.cvv && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.cvv}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>할부</Label>
                          <Select
                            value={installment}
                            onValueChange={setInstallment}
                          >
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
                            onChange={(e) =>
                              setCardPassword(
                                e.target.value
                                  .replace(/[^0-9]/g, "")
                                  .slice(0, 4),
                              )
                            }
                            maxLength={4}
                            placeholder={
                              useSavedCard
                                ? "저장된 카드 (입력불필요)"
                                : "4자리 전체"
                            }
                            className="mt-2"
                            disabled={useSavedCard}
                          />
                          {errors.cardPassword && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.cardPassword}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 카드 소유자명과 별칭 */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>카드 소유자명</Label>
                          <Input
                            value={cardHolderName}
                            onChange={(e) => setCardHolderName(e.target.value)}
                            placeholder="홍길동"
                            className="mt-2"
                            disabled={useSavedCard}
                          />
                        </div>

                        <div>
                          <Label>카드 별칭 (선택)</Label>
                          <Input
                            value={cardAlias}
                            onChange={(e) => setCardAlias(e.target.value)}
                            placeholder="주카드, 회사카드 등"
                            className="mt-2"
                            disabled={useSavedCard}
                          />
                        </div>
                      </div>

                      {/* 신용카드 전용 휴대폰 번호 */}
                      <div>
                        <Label>휴대폰 번호 (본인확인용)</Label>
                        <div className="flex gap-2 mt-2">
                          <Select
                            value={cardPhonePrefix}
                            onValueChange={setCardPhonePrefix}
                          >
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
                            onChange={(e) =>
                              setCardPhoneNumber(
                                e.target.value
                                  .replace(/[^0-9]/g, "")
                                  .slice(0, 8),
                              )
                            }
                            className="flex-1"
                          />
                        </div>
                        {errors.phoneNumber && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.phoneNumber}
                          </p>
                        )}
                      </div>
                    </TabsContent>

                    {/* 내 통장 결제 */}
                    <TabsContent value="bank" className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">내 통장 결제 안내</h3>
                        <p className="text-sm text-gray-600">
                          계좌번호와 비밀번호를 입력하여 인증 후 결제가
                          가능합니다.
                        </p>
                      </div>

                      {/* 저장된 계좌 선택 - 회원 전용 */}
                      {isLoggedIn &&
                        savedPaymentMethods.filter(
                          (method) =>
                            method.paymentMethodType === "BANK_ACCOUNT",
                        ).length > 0 && (
                          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  🏦
                                </span>
                              </div>
                              <Label className="text-lg font-semibold text-green-800">
                                저장된 계좌 사용
                              </Label>
                            </div>
                            <RadioGroup
                              value={
                                useSavedAccount
                                  ? selectedSavedAccount?.toString()
                                  : "new"
                              }
                              onValueChange={handleSavedAccountChange}
                              className="space-y-3"
                            >
                              <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer">
                                <RadioGroupItem value="new" id="new-account" />
                                <Label
                                  htmlFor="new-account"
                                  className="text-base font-medium cursor-pointer"
                                >
                                  새 계좌 입력
                                </Label>
                              </div>
                              {savedPaymentMethods
                                .filter(
                                  (method) =>
                                    method.paymentMethodType === "BANK_ACCOUNT",
                                )
                                .map((method) => {
                                  const bankCodes: { [key: string]: string } = {
                                    "004": "국민은행",
                                    "088": "신한은행",
                                    "020": "우리은행",
                                    "081": "하나은행",
                                    "011": "농협은행",
                                    "032": "부산은행",
                                    "031": "대구은행",
                                    "034": "광주은행",
                                    "037": "전북은행",
                                    "039": "경남은행",
                                    "035": "제주은행",
                                    "090": "카카오뱅크",
                                    "089": "케이뱅크",
                                    "092": "토스뱅크",
                                    "003": "IBK기업은행",
                                  };
                                  const bankName =
                                    bankCodes[method.bankCode || ""] ||
                                    method.bankCode;

                                  return (
                                    <div
                                      key={method.id}
                                      className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:bg-green-50 cursor-pointer"
                                    >
                                      <RadioGroupItem
                                        value={method.id.toString()}
                                        id={`saved-account-${method.id}`}
                                      />
                                      <Label
                                        htmlFor={`saved-account-${method.id}`}
                                        className="flex-1 cursor-pointer"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <div className="font-medium text-base">
                                              {method.alias}
                                            </div>
                                            <div className="text-gray-600 text-sm">
                                              {bankName} ****
                                              {method.accountNumber?.slice(-4)}
                                            </div>
                                          </div>
                                          {method.isDefault && (
                                            <Badge
                                              variant="outline"
                                              className="bg-green-100 text-green-800 border-green-300"
                                            >
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
                            {errors.bankSelection && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.bankSelection}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label>계좌번호</Label>
                            <Input
                              placeholder="계좌번호를 입력하세요"
                              value={bankAccountNumber}
                              onChange={(e) =>
                                setBankAccountNumber(
                                  e.target.value.replace(/[^0-9]/g, ""),
                                )
                              }
                              className="mt-2"
                              disabled={useSavedAccount}
                            />
                            {errors.bankAccount && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.bankAccount}
                              </p>
                            )}
                          </div>

                          <div>
                            <Label>계좌 비밀번호 4자리</Label>
                            <Input
                              type="password"
                              value={bankPassword}
                              onChange={(e) =>
                                setBankPassword(
                                  e.target.value
                                    .replace(/[^0-9]/g, "")
                                    .slice(0, 4),
                                )
                              }
                              maxLength={4}
                              className="mt-2"
                              placeholder={
                                useSavedAccount
                                  ? "저장된 계좌 (입력불필요)"
                                  : "계좌 비밀번호 4자리"
                              }
                              disabled={useSavedAccount}
                            />
                            {errors.bankPassword && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.bankPassword}
                              </p>
                            )}
                          </div>

                          {/* 계좌 별칭 */}
                          <div>
                            <Label>계좌 별칭 (선택)</Label>
                            <Input
                              value={bankAlias}
                              onChange={(e) => setBankAlias(e.target.value)}
                              placeholder="주계좌, 급여계좌 등"
                              className="mt-2"
                              disabled={useSavedAccount}
                            />
                          </div>

                          {/* 내 통장 전용 휴대폰 번호 */}
                          <div>
                            <Label>휴대폰 번호</Label>
                            <div className="flex gap-2 mt-2">
                              <Select
                                value={bankPhonePrefix}
                                onValueChange={setBankPhonePrefix}
                                disabled={useSavedAccount}
                              >
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
                                onChange={(e) =>
                                  setBankPhoneNumber(
                                    e.target.value
                                      .replace(/[^0-9]/g, "")
                                      .slice(0, 8),
                                  )
                                }
                                className="flex-1"
                                disabled={useSavedAccount}
                              />
                            </div>
                            {errors.phoneNumber && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.phoneNumber}
                              </p>
                            )}
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
                              <p className="font-medium text-green-800">
                                계좌 인증 완료
                              </p>
                              <p className="text-sm text-green-600">
                                {savedAccountInfo?.bankName}{" "}
                                {savedAccountInfo?.accountNumber} (
                                {savedAccountInfo?.accountHolder})
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
                          <li>
                            • 아래 계좌로 입금 후 결제/발권 버튼을 클릭해주세요
                          </li>
                          <li>• 입금자명은 예약자명과 동일해야 합니다</li>
                          <li>• 입금 확인까지 최대 5분 소요됩니다</li>
                        </ul>
                      </div>

                      <div>
                        <Label>입금 은행 선택</Label>
                        <Select
                          value={selectedBankForTransfer}
                          onValueChange={setSelectedBankForTransfer}
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
                      </div>

                      {selectedBankForTransfer && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          {(() => {
                            const selectedBank = bankAccountInfo.find(
                              (bank) =>
                                bank.bankName === selectedBankForTransfer,
                            );
                            return selectedBank ? (
                              <div>
                                <h4 className="font-medium mb-2">
                                  입금 계좌 정보
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p>
                                    <span className="font-medium">은행:</span>{" "}
                                    {selectedBank.bankName}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      계좌번호:
                                    </span>{" "}
                                    {selectedBank.accountNumber}
                                  </p>
                                  <p>
                                    <span className="font-medium">예금주:</span>{" "}
                                    {selectedBank.accountHolder}
                                  </p>
                                  <p>
                                    <span className="font-medium">
                                      입금금액:
                                    </span>{" "}
                                    <span className="text-red-600 font-bold">
                                      {formatPrice(reservationInfo.price)}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}

                      {selectedBankForTransfer && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="depositCompleted"
                            checked={isDepositCompleted}
                            onCheckedChange={(checked) =>
                              setIsDepositCompleted(checked === true)
                            }
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
                          <Select
                            value={transferPhonePrefix}
                            onValueChange={setTransferPhonePrefix}
                          >
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
                            onChange={(e) =>
                              setTransferPhoneNumber(
                                e.target.value
                                  .replace(/[^0-9]/g, "")
                                  .slice(0, 8),
                              )
                            }
                            className="flex-1"
                          />
                        </div>
                        {errors.phoneNumber && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.phoneNumber}
                          </p>
                        )}
                      </div>

                      {errors.transfer && (
                        <p className="text-red-500 text-sm">
                          {errors.transfer}
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>

                  {/* 비회원 정보 입력 폼 */}
                  {!isLoggedIn && (
                    <div className="mt-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            비회원 정보 입력
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            예약 확인 및 취소를 위해 아래 정보를 입력해주세요.
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* 예약자명 */}
                          <div>
                            <Label
                              htmlFor="nonMemberName"
                              className="flex items-center gap-2"
                            >
                              <User className="h-4 w-4" />
                              예약자명 <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="nonMemberName"
                              placeholder="실명을 입력해주세요"
                              value={nonMemberInfo.name}
                              onChange={(e) =>
                                setNonMemberInfo((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="mt-1"
                            />
                            {errors.nonMemberName && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.nonMemberName}
                              </p>
                            )}
                          </div>

                          {/* 비회원 비밀번호 */}
                          <div>
                            <Label
                              htmlFor="nonMemberPassword"
                              className="flex items-center gap-2"
                            >
                              <Lock className="h-4 w-4" />
                              비회원 비밀번호{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="nonMemberPassword"
                              type="password"
                              placeholder="예약 조회 시 사용할 비밀번호 (5자리 숫자)"
                              value={nonMemberInfo.password}
                              onChange={(e) =>
                                setNonMemberInfo((prev) => ({
                                  ...prev,
                                  password: e.target.value,
                                }))
                              }
                              className="mt-1"
                            />
                            {errors.nonMemberPassword && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.nonMemberPassword}
                              </p>
                            )}
                          </div>

                          {/* 비밀번호 확인 */}
                          <div>
                            <Label htmlFor="confirmPassword">
                              비밀번호 확인{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              placeholder="비밀번호를 다시 입력해주세요"
                              value={nonMemberInfo.confirmPassword}
                              onChange={(e) =>
                                setNonMemberInfo((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                              className="mt-1"
                            />
                            {errors.confirmPassword && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.confirmPassword}
                              </p>
                            )}
                          </div>

                          {/* 휴대폰 번호 */}
                          <div>
                            <Label
                              htmlFor="nonMemberPhone"
                              className="flex items-center gap-2"
                            >
                              <Phone className="h-4 w-4" />
                              휴대폰 번호{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="nonMemberPhone"
                              placeholder="01012345678"
                              value={nonMemberInfo.phone}
                              onChange={(e) =>
                                setNonMemberInfo((prev) => ({
                                  ...prev,
                                  phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 11),
                                }))
                              }
                              className="mt-1"
                            />
                            {errors.nonMemberPhone && (
                              <p className="text-red-500 text-sm mt-1">
                                {errors.nonMemberPhone}
                              </p>
                            )}
                          </div>

                          <div className="bg-amber-50 p-3 rounded-lg">
                            <p className="text-sm text-amber-800">
                              💡 <strong>알림:</strong> 입력하신 정보는 예약
                              확인, 변경, 취소 시 사용됩니다. 정확한 정보를
                              입력해주세요.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* 마일리지 사용 - 회원 전용 */}
                  {isLoggedIn && (
                    <div className="mt-6">
                      <div className="bg-blue-50 p-4 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-lg font-medium">
                            마일리지 사용
                          </Label>
                          <span className="text-sm text-gray-600">
                            보유: {availableMileage?.toLocaleString() || "0"}P |
                            최대사용:{" "}
                            {maxUsableMileage?.toLocaleString() || "0"}P
                          </span>
                        </div>

                        {/* 마일리지 적립 정책 안내 */}
                        <div className="mt-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setShowMileagePolicy(!showMileagePolicy)
                            }
                            className="text-sm text-gray-600 hover:text-gray-800 p-0 h-auto font-normal"
                          >
                            <ChevronDown
                              className={`h-4 w-4 mr-1 transition-transform ${showMileagePolicy ? "rotate-180" : ""}`}
                            />
                            마일리지 적립 정책 보기
                          </Button>

                          {showMileagePolicy && (
                            <div className="bg-gray-50 p-3 rounded-lg mt-2 text-sm text-gray-600 space-y-1">
                              <p>기본 적립률: 결제 금액의 1% (1원 = 1포인트)</p>
                              <p>
                                지연 보상: 30분 이상 지연 시 지연분 × 100P 추가
                                적립
                              </p>
                              <p>유효기간: 적립일로부터 5년</p>
                              <p>사용 제한: 최소 1,000P 이상부터 사용 가능 (결제 금액의 100%까지)</p>
                              <div className="bg-white p-2 rounded mt-2">
                                <p className="text-gray-700">
                                  이번 결제 시 예상 적립:{" "}
                                  {Math.floor(
                                    finalPayableAmount * 0.01,
                                  ).toLocaleString()}
                                  P
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  * 실제 적립은 열차 도착 완료 후 진행됩니다
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">

                          {/* 직접 입력 */}
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              placeholder="사용할 마일리지 입력"
                              value={mileageInputValue}
                              onChange={(e) =>
                                handleMileageChange(e.target.value)
                              }
                              min="0"
                              max={Math.min(
                                availableMileage || 0,
                                maxUsableMileage || 0,
                              ).toString()}
                              className="flex-1"
                            />
                            <span className="text-sm font-medium">P</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const maxValue = Math.min(
                                  availableMileage || 0,
                                  maxUsableMileage || 0,
                                ).toString();
                                handleMileageChange(maxValue, true);
                              }}
                            >
                              전액사용
                            </Button>
                          </div>
                        </div>

                        {mileageToUse > 0 && (
                          <div className="bg-white p-3 rounded border space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>원래 금액:</span>
                              <span>{formatPrice(reservationInfo.price)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-blue-600">
                              <span>마일리지 할인:</span>
                              <span>-{mileageToUse.toLocaleString()}원</span>
                            </div>
                            <div className="border-t pt-2">
                              <div className="flex justify-between font-medium">
                                <span>최종 결제 금액:</span>
                                <span className="text-lg text-blue-600">
                                  {formatPrice(finalPayableAmount)}
                                </span>
                              </div>
                              {finalPayableAmount === 0 && (
                                <p className="text-xs text-green-600 mt-1">
                                  ✓ 마일리지로 전액 결제됩니다
                                </p>
                              )}
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
                                onCheckedChange={(checked) =>
                                  setRequestReceipt(checked === true)
                                }
                              />
                              <Label
                                htmlFor="mileageReceipt"
                                className="text-sm font-medium"
                              >
                                현금영수증 신청 (선택사항)
                              </Label>
                            </div>

                            {requestReceipt && (
                              <>
                                <RadioGroup
                                  value={receiptType}
                                  onValueChange={setReceiptType}
                                  className="flex gap-4 mb-3"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="personal"
                                      id="mileagePersonalReceipt"
                                    />
                                    <Label htmlFor="mileagePersonalReceipt">
                                      개인 소득공제
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="business"
                                      id="mileageBusinessReceipt"
                                    />
                                    <Label htmlFor="mileageBusinessReceipt">
                                      사업자 증빙
                                    </Label>
                                  </div>
                                </RadioGroup>

                                {receiptType === "personal" && (
                                  <div>
                                    <Label className="text-sm">
                                      휴대폰 번호
                                    </Label>
                                    <div className="flex gap-2 mt-1">
                                      <Select
                                        value={receiptPhonePrefix}
                                        onValueChange={setReceiptPhonePrefix}
                                      >
                                        <SelectTrigger className="w-20">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="010">
                                            010
                                          </SelectItem>
                                          <SelectItem value="011">
                                            011
                                          </SelectItem>
                                          <SelectItem value="016">
                                            016
                                          </SelectItem>
                                          <SelectItem value="017">
                                            017
                                          </SelectItem>
                                          <SelectItem value="018">
                                            018
                                          </SelectItem>
                                          <SelectItem value="019">
                                            019
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <Input
                                        placeholder="12345678"
                                        value={receiptPhoneNumber}
                                        onChange={(e) =>
                                          setReceiptPhoneNumber(
                                            e.target.value
                                              .replace(/[^0-9]/g, "")
                                              .slice(0, 8),
                                          )
                                        }
                                        className="flex-1"
                                      />
                                    </div>
                                  </div>
                                )}

                                {receiptType === "business" && (
                                  <div>
                                    <Label className="text-sm">
                                      사업자등록번호
                                    </Label>
                                    <Input
                                      placeholder="000-00-00000"
                                      value={businessNumber}
                                      onChange={(e) =>
                                        setBusinessNumber(e.target.value)
                                      }
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
                  )}

                  {/* 현금영수증 (현금성 결제는 항상 표시, 간편결제/신용카드는 회원의 마일리지 사용 시에만) */}
                  {((!isLoggedIn &&
                    (paymentMethod === "bank" ||
                      paymentMethod === "transfer")) ||
                    (isLoggedIn &&
                      mileageToUse === 0 &&
                      (paymentMethod === "bank" ||
                        paymentMethod === "transfer"))) && (
                    <div className="mt-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="receipt"
                          checked={requestReceipt}
                          onCheckedChange={(checked) =>
                            setRequestReceipt(checked === true)
                          }
                        />
                        <Label htmlFor="receipt">
                          현금영수증 신청{" "}
                          <span className="text-gray-500">(선택)</span>
                        </Label>
                      </div>

                      {requestReceipt && (
                        <div className="mt-4 ml-6 space-y-3">
                          <RadioGroup
                            value={receiptType}
                            onValueChange={setReceiptType}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="personal"
                                id="personalReceipt"
                              />
                              <Label htmlFor="personalReceipt">
                                개인 소득공제
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="business"
                                id="businessReceipt"
                              />
                              <Label htmlFor="businessReceipt">
                                사업자 증빙
                              </Label>
                            </div>
                          </RadioGroup>

                          {receiptType === "personal" && (
                            <div>
                              <Label className="text-sm">휴대폰 번호</Label>
                              <div className="flex gap-2 mt-1">
                                <Select
                                  value={receiptPhonePrefix}
                                  onValueChange={setReceiptPhonePrefix}
                                >
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
                                  onChange={(e) =>
                                    setReceiptPhoneNumber(
                                      e.target.value
                                        .replace(/[^0-9]/g, "")
                                        .slice(0, 8),
                                    )
                                  }
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
                                onChange={(e) =>
                                  setBusinessNumber(e.target.value)
                                }
                                className="mt-1"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 약관 동의 */}
                  <div id="agreement-section" className={`mt-6 space-y-3 border p-4 rounded-lg ${errors.agreements ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                    <h3 className="font-semibold text-sm mb-3">필수 약관 동의</h3>
                    
                    {/* 1. 결제 서비스 이용약관 동의 (필수) */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={agreeTerms}
                        onCheckedChange={(checked) =>
                          setAgreeTerms(checked === true)
                        }
                        className={errors.agreements ? 'border-red-500' : ''}
                      />
                      <Label htmlFor="terms" className="text-sm cursor-pointer">
                        <span className="text-red-600 font-bold">[필수]</span> 결제 서비스
                        이용약관에 동의합니다
                      </Label>
                    </div>

                    {/* 2. 개인정보 수집 이용 약관 동의 (필수) */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="personalInfo"
                        checked={agreePersonalInfo}
                        onCheckedChange={(checked) =>
                          setAgreePersonalInfo(checked === true)
                        }
                        className={errors.agreements ? 'border-red-500' : ''}
                      />
                      <Label htmlFor="personalInfo" className="text-sm cursor-pointer">
                        <span className="text-red-600 font-bold">[필수]</span> 개인정보 수집 및
                        이용에 동의합니다
                      </Label>
                    </div>

                    {/* 3. 결제 수단 저장 체크박스 (선택사항) - 회원 전용, 신용카드와 내 통장 결제에만 표시 */}
                    {isLoggedIn &&
                      (paymentMethod === "card" || paymentMethod === "bank") &&
                      !(useSavedCard || useSavedAccount) && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="savePayment"
                            checked={agreeSavePayment}
                            onCheckedChange={(checked) =>
                              setAgreeSavePayment(checked === true)
                            }
                          />
                          <Label htmlFor="savePayment" className="text-sm">
                            결제 수단을 저장하여 다음에도 사용하겠습니다
                          </Label>
                        </div>
                      )}

                    {errors.agreements && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mt-2">
                        <p className="text-sm font-semibold flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          {errors.agreements}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 일반 에러 메시지 */}
                  {errors.general && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{errors.general}</p>
                    </div>
                  )}

                  {/* 결제 버튼 */}
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing || isInitialLoading}
                    className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg disabled:bg-gray-400"
                  >
                    {isProcessing
                      ? "결제 처리 중..."
                      : isInitialLoading
                      ? "로그인 정보 확인 중..."
                      : `${formatPrice(finalPayableAmount)} 결제하기`}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}{" "}
        {/* 스켈레톤 조건부 렌더링 종료 */}
      </div>
    </div>
  );
}
