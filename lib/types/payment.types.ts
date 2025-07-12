// 결제 수단 타입
export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  BANK_TRANSFER = 'BANK_TRANSFER',
  KAKAO_PAY = 'KAKAO_PAY',
  NAVER_PAY = 'NAVER_PAY',
  PAYCO = 'PAYCO'
}

// 결제 상태
export enum PaymentExecutionStatus {
  PENDING = 'PENDING',          // 결제 대기
  PROCESSING = 'PROCESSING',    // 처리 중
  COMPLETED = 'COMPLETED',      // 완료
  FAILED = 'FAILED',           // 실패
  CANCELLED = 'CANCELLED',      // 취소
  PARTIALLY_CANCELLED = 'PARTIALLY_CANCELLED' // 부분 취소
}

// 결제 계산 요청
export interface PaymentCalculationRequest {
  reservationId?: number;       // 예약 ID (Optional - 예약 삭제 시에도 결제 가능)
  externalOrderId: string;      // 외부 주문 ID (예약번호)
  userId: string;               // 사용자 ID
  originalAmount: number;       // 원본 금액
  items?: PaymentItem[];        // 상품 아이템 리스트
  requestedPromotions?: PromotionRequest[]; // 프로모션 요청
  mileageToUse?: number;        // 사용할 마일리지 (기본값 0)
  availableMileage?: number;    // 보유 마일리지 (기본값 0)
  clientIp?: string;            // 클라이언트 IP
  userAgent?: string;           // User Agent
  // 열차 정보 (예약 삭제 시에도 결제 가능하도록)
  trainScheduleId?: number;
  trainDepartureTime?: string;
  trainArrivalTime?: string;
  trainOperator?: string;
  routeInfo?: string;
}

// 결제 아이템
export interface PaymentItem {
  productId: string;            // 상품 ID
  quantity: number;             // 수량
  unitPrice: number;            // 단가
}

// 프로모션 요청
export interface PromotionRequest {
  type: 'COUPON' | 'MILEAGE' | 'DISCOUNT_CODE'; // 프로모션 타입
  identifier?: string;          // 쿠폰 코드 등
  pointsToUse?: number;         // 마일리지 사용 포인트
}

// 결제 계산 응답
export interface PaymentCalculationResponse {
  calculationId: string;        // 계산 ID
  finalAmount: number;          // 최종 결제 금액
  originalAmount: number;       // 원본 금액
  mileageInfo: {
    pointsUsed: number;         // 사용된 포인트
    amountDeducted: number;     // 차감된 금액
    maxUsablePoints: number;    // 최대 사용 가능 포인트
    recommendedPoints: number;  // 추천 사용 포인트
    expectedEarning: number;    // 예상 적립 포인트
  };
  expiresAt: string;           // 만료 시간
}

// PG 결제 요청
export interface PgPaymentRequest {
  merchantOrderId: string;      // 가맹점 주문 ID
  amount: number;               // 결제 금액
  paymentMethod: string;        // 결제 수단
  productName: string;          // 상품명
  buyerName: string;            // 구매자 이름
  buyerEmail: string;           // 구매자 이메일
  buyerPhone: string;           // 구매자 전화번호
  successUrl: string;           // 성공 시 리다이렉트 URL
  failUrl: string;              // 실패 시 리다이렉트 URL
  cancelUrl: string;            // 취소 시 리다이렉트 URL
  calculationId: string;        // 계산 ID
  // 결제 수단별 추가 정보
  cardNumber?: string;          // 카드번호
  cardExpiryMonth?: string;     // 카드 유효기간 월
  cardExpiryYear?: string;      // 카드 유효기간 년
  cardCvc?: string;             // CVC
  cardHolderName?: string;      // 카드 소유자명
  cardPassword?: string;        // 카드 비밀번호
  savedPaymentMethodId?: number; // 저장된 결제수단 ID
  bankCode?: string;            // 은행 코드
  accountNumber?: string;       // 계좌번호
  accountPassword?: string;     // 계좌 비밀번호
  accountHolderName?: string;   // 예금주명
  depositorName?: string;       // 입금자명 (가상계좌)
}

// PG 결제 응답
export interface PgPaymentResponse {
  success: boolean;             // 성공 여부
  paymentUrl?: string;          // 결제 페이지 URL
  pgTransactionId?: string;     // PG 거래 ID
  status?: string;              // 상태
  errorCode?: string;           // 에러 코드
  errorMessage?: string;        // 에러 메시지
}

// PG 결제 승인
export interface PgPaymentApprovalRequest {
  paymentMethod: string;        // 결제 수단 (문자열로 전송)
  pgTransactionId: string;      // PG 거래 ID
  merchantOrderId: string;      // 가맹점 주문 ID
  calculationId: string;        // 계산 ID
  // 회원 정보
  memberId?: number | null;     // 로그인된 회원 ID (비회원인 경우 null)
  // 비회원 정보
  nonMemberName?: string;       // 예약자 이름
  nonMemberPhone?: string;      // 전화번호 (하이픈 제거)
  nonMemberPassword?: string;   // 비밀번호 (5자리)
  // 현금영수증 정보
  requestReceipt?: boolean;     // 현금영수증 발급 요청
  receiptType?: string;         // 'personal' 또는 'business'
  receiptPhoneNumber?: string | null;  // 개인 소득공제용 휴대폰 번호
  businessNumber?: string | null;      // 사업자 증빙용 사업자등록번호
}

// 결제 실행 요청
export interface PaymentExecuteRequest {
  calculationId: string;        // 계산 ID
  idempotencyKey: string;       // 멱등성 키
  paymentMethod: {
    type: string;               // 결제 타입
    pgProvider?: string;        // PG 제공자
    pgToken?: string;           // PG 토큰
  };
  memberId?: number;            // 회원 ID
  mileageToUse?: number;        // 사용할 마일리지
  availableMileage?: number;    // 보유 마일리지
  nonMemberName?: string;       // 비회원 이름
  nonMemberPhone?: string;      // 비회원 전화번호
  nonMemberPassword?: string;   // 비회원 비밀번호
  requestReceipt?: boolean;     // 현금영수증 요청
  receiptType?: string;         // 영수증 타입
  receiptPhoneNumber?: string;  // 영수증 전화번호
  businessNumber?: string;      // 사업자번호
}

// 결제 실행 응답
export interface PaymentExecuteResponse {
  paymentId: string | null;     // 결제 ID
  externalOrderId: string;      // 외부 주문 ID
  paymentStatus: PaymentExecutionStatus; // 결제 상태
  amountPaid: number;           // 결제 금액
  result: {
    success: boolean;           // 성공 여부
    errorCode?: string;         // 에러 코드
    message?: string;           // 메시지
  };
}

// 저장된 결제수단
export interface SavedPaymentMethod {
  id: number;
  memberId: number;
  paymentMethodType: 'CREDIT_CARD' | 'BANK_ACCOUNT';
  alias: string;                // 별칭
  cardNumber?: string;          // 마스킹된 카드번호
  cardExpiryMonth?: string;
  cardExpiryYear?: string;
  cardHolderName?: string;
  bankCode?: string;
  accountNumber?: string;       // 마스킹된 계좌번호
  accountHolderName?: string;
  isDefault: boolean;
  createdAt: string;
}

// 마일리지 잔액
export interface MileageBalance {
  currentBalance: number;       // 현재 잔액
  activeBalance: number;        // 활성 잔액
  pendingBalance?: number;      // 대기 중인 잔액
  expiringBalance?: number;     // 만료 예정 잔액
}