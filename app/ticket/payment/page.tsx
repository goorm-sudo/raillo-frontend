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

<<<<<<< HEAD
=======
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
        localStorage.removeItem("loginInfo");
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
            // 사용자 정보 API 호출하여 실제 이름 가져오기
            try {
              const { getMyInfo } = await import('@/lib/api/user');
              const userInfoResponse = await getMyInfo();
              
              if (userInfoResponse.result) {
                const userInfo = userInfoResponse.result;
                const loginData = {
                  isLoggedIn: true,
                  userId: payload.sub || "guest_user",
                  username: userInfo.name || "Unknown",
                  memberNo: payload.sub || "Unknown",
                  email: userInfo.memberDetailInfo?.email || "unknown@raillo.com",
                  phoneNumber: userInfo.phoneNumber || "",
                  exp: payload.exp,
                };
                
                setLoginInfo(loginData);
                setIsLoggedIn(true);
                localStorage.setItem('loginInfo', JSON.stringify(loginData));
              }
            } catch (error) {
              console.error('사용자 정보 조회 실패:', error);
              // API 호출 실패 시 기본값 사용
              const loginData = {
                isLoggedIn: true,
                userId: payload.sub || "guest_user",
                username: payload.sub || "Unknown",
                memberNo: payload.sub || "Unknown",
                email: payload.email || "unknown@raillo.com",
                exp: payload.exp,
              };
              
              setLoginInfo(loginData);
              setIsLoggedIn(true);
              localStorage.setItem('loginInfo', JSON.stringify(loginData));
            }
          } else {
            // 토큰이 만료되었으면 로그아웃
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("loginInfo");
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
        localStorage.removeItem("loginInfo");
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
        // response.result가 직접 balance를 포함할 수 있음
        let balance = 0;
        
        // 디버깅을 위한 로그
        console.log("마일리지 API 응답:", response.result);
        
        if (typeof response.result === 'number') {
          // 단순 숫자 응답인 경우
          balance = response.result;
        } else if (response.result.balance !== undefined) {
          // balance 필드가 있는 경우
          balance = response.result.balance;
        } else if (response.result.currentBalance !== undefined) {
          // currentBalance 필드가 있는 경우
          balance = response.result.currentBalance;
        }

        const safeBalance = isNaN(balance) ? 0 : balance || 0;
        
        // 100% 결제 가능 - 결제 금액과 보유 마일리지 중 작은 값
        const maxUsableByPrice = reservationInfo.price;
        const maxUsableByBalance = safeBalance;
        const maxUsable = Math.min(maxUsableByPrice, maxUsableByBalance);

        setAvailableMileage(safeBalance);
        setMaxUsableMileage(maxUsable);
      } else {
        // 응답에 result가 없는 경우
        setAvailableMileage(0);
        setMaxUsableMileage(0);
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
      setCardHolderName("");
      setCardAlias("");
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
        // 카드 소유자명과 별칭 설정
        setCardHolderName(rawMethod.cardHolderName || "");
        setCardAlias(rawMethod.alias || "");
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
          // 카드 소유자명과 별칭 설정 (마스킹된 데이터에서)
          setCardHolderName(method.cardHolderName || "");
          setCardAlias(method.alias || "");
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

    // 전화번호가 없거나 길이가 부족한 경우
    if (!phoneToCheck || phoneToCheck.length < 7) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: "전화번호를 입력해주세요.",
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
    // 계좌 인증 시에는 비밀번호 체크하지 않음 (인증 API에서 처리)
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
        passwordLength: bankPassword.length,
      });

      // 계좌 검증 전용 API 호출
      const response = await bankAccountApi.verifyBankAccount(verificationData);
      
      console.log("계좌 인증 API 응답:", response);

      // 무조건 성공 처리 (Mock 환경)
      const accountInfo: BankInfo = {
        bankName: response?.result?.bankName || selectedBankForAccount,
        accountNumber: response?.result?.maskedAccountNumber || bankAccountNumber.replace(/(\d{6})(\d{2})(\d+)/, "$1-$2-$3"),
        accountHolder: response?.result?.accountHolderName || "예금주",
      };

      setSavedAccountInfo(accountInfo);
      setIsAccountVerified(true);
      alert("계좌 인증이 완료되었습니다!");
      
      // 성공 처리 후 바로 종료
      setIsProcessing(false);
      return;
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
      setIsProcessing(false);
    }
  };

  // 결제 처리 함수
>>>>>>> a9130dc (JWT 토큰 회원정보 수정)
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
