import { api, ApiResponse } from '../api';
import { 
  PaymentCalculationRequest, 
  PaymentCalculationResponse,
  PaymentExecuteRequest,
  PaymentExecuteResponse
} from './payment';

// ============= Saved Payment Method Types =============
export interface SavedPaymentMethod {
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

export interface CreateSavedPaymentMethodRequest {
  paymentMethodType: string;
  alias: string;
  cardNumber?: string;
  cardHolderName?: string;
  cardExpiryMonth?: string;
  cardExpiryYear?: string;
  cardCvc?: string;
  bankCode?: string;
  accountNumber?: string;
  accountHolderName?: string;
  accountPassword?: string;
  isDefault?: boolean;
}

// ============= Mileage Types =============
export interface MileageBalanceResponse {
  balance: number;
}

export interface MileageBalanceInfo {
  memberId: number;
  currentBalance: number;
  activeBalance: number;
  pendingEarning: number;
  expiringInMonth: number;
  lastTransactionAt: string;
}

// ============= Bank Account Verification Types =============
export interface BankAccountVerificationRequest {
  bankCode: string;
  accountNumber: string;
  accountPassword: string;
}

export interface BankAccountVerificationResponse {
  verified: boolean;
  accountHolderName: string;
  maskedAccountNumber: string;
  bankName: string;
  message?: string;
}

// ============= PG Payment Types =============
export interface PgPaymentRequest {
  calculationId: string;
  paymentMethod: string;
  returnUrl?: string;
  cancelUrl?: string;
  // 카드 정보
  cardNumber?: string;
  cardExpiryMonth?: string;
  cardExpiryYear?: string;
  cardCvc?: string;
  cardHolderName?: string;
  cardPassword?: string;
  installmentMonths?: number;
  // 계좌 정보
  bankCode?: string;
  accountNumber?: string;
  accountPassword?: string;
  // 간편결제 정보
  simplePaymentProvider?: string;
  simplePaymentPhone?: string;
  // 기타 정보
  savedPaymentMethodId?: number;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
}

export interface PgPaymentResponse {
  paymentUrl?: string;
  pgTransactionId?: string;
  merchantOrderId?: string;
  status?: string;
}

export interface PgPaymentApprovalRequest {
  paymentMethod: string;
  pgTransactionId: string;
  merchantOrderId: string;
  calculationId: string;
  memberId?: number;
  nonMemberName?: string;
  nonMemberPhone?: string;
  nonMemberPassword?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  approvedAmount?: number;
  cardInfo?: {
    cardNumber?: string;
    cardType?: string;
    issuerName?: string;
    installmentMonths?: number;
  };
  cashReceiptInfo?: {
    type?: string;
    identifier?: string;
  };
}

// ============= API Client Instances =============

// Saved Payment Method API
export const savedPaymentMethodApi = {
  // 저장된 결제수단 목록 조회
  getSavedPaymentMethods: async (): Promise<ApiResponse<SavedPaymentMethod[]>> => {
    return api.get<SavedPaymentMethod[]>('/saved-payment-methods');
  },

  // 결제수단 저장
  addSavedPaymentMethod: async (request: CreateSavedPaymentMethodRequest): Promise<ApiResponse<SavedPaymentMethod>> => {
    return api.post<SavedPaymentMethod>('/saved-payment-methods', request);
  },

  // 결제수단 삭제
  deleteSavedPaymentMethod: async (id: number): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/saved-payment-methods/${id}`);
  },

  // 기본 결제수단 설정
  setDefaultPaymentMethod: async (id: number): Promise<ApiResponse<void>> => {
    return api.put<void>(`/saved-payment-methods/${id}/default`);
  },

  // 결제용 상세 조회 (복호화된 정보)
  getPaymentMethodForPayment: async (id: number, sessionId?: string): Promise<ApiResponse<SavedPaymentMethod>> => {
    const params = sessionId ? { sessionId } : undefined;
    return api.get<SavedPaymentMethod>(`/saved-payment-methods/${id}/raw`, params);
  }
};

// Mileage API
export const mileageApi = {
  // 마일리지 잔액 조회 (간단)
  getMileageBalance: async (): Promise<ApiResponse<MileageBalanceResponse>> => {
    return api.get<MileageBalanceResponse>('/mileage/balance/simple');
  },

  // 마일리지 잔액 조회 (상세)
  getMileageBalanceDetail: async (): Promise<ApiResponse<MileageBalanceInfo>> => {
    return api.get<MileageBalanceInfo>('/mileage/balance');
  },

  // 사용 가능한 마일리지 조회
  getAvailableMileage: async (): Promise<ApiResponse<{
    availableBalance: number;
    minimumUsableAmount: number;
    maximumUsablePercentage: number;
  }>> => {
    return api.get('/mileage/available');
  }
};

// Bank Account Verification API
export const bankAccountApi = {
  // 계좌 유효성 검증
  verifyBankAccount: async (request: BankAccountVerificationRequest): Promise<ApiResponse<BankAccountVerificationResponse>> => {
    return api.post<BankAccountVerificationResponse>('/payment/verify-bank-account', request);
  }
};

// Payment API (PG 결제 관련)
export const paymentApi = {
  // 결제 계산
  calculatePayment: async (requestData: PaymentCalculationRequest): Promise<ApiResponse<PaymentCalculationResponse>> => {
    // console.log('📊 Payment calculation request details:', {
    //   url: '/payments/calculate',
    //   method: 'POST',
    //   data: requestData,
    //   dataType: typeof requestData,
    //   dataStringified: JSON.stringify(requestData),
    //   dataKeys: requestData ? Object.keys(requestData) : 'NO_DATA',
    //   dataValues: requestData ? JSON.stringify(requestData, null, 2) : 'NO_DATA',
    //   hasData: !!requestData,
    //   dataLength: requestData ? JSON.stringify(requestData).length : 0,
    // });
    
    // 데이터가 없거나 빈 객체인 경우 경고
    if (!requestData || (typeof requestData === 'object' && Object.keys(requestData).length === 0)) {
      // console.error('⚠️ 경고: Payment calculation 요청 데이터가 비어있습니다!');
    }
    
    return api.post<PaymentCalculationResponse>('/payments/calculate', requestData);
  },

  // PG 결제 요청
  requestPgPayment: async (requestData: PgPaymentRequest): Promise<ApiResponse<PgPaymentResponse>> => {
    return api.post<PgPaymentResponse>('/payments/pg/request', requestData);
  },

  // PG 결제 승인
  approvePgPayment: async (requestData: PgPaymentApprovalRequest): Promise<ApiResponse<PaymentExecuteResponse>> => {
    return api.post<PaymentExecuteResponse>('/payments/pg/approve', requestData);
  },

  // 일반 결제 실행
  executePayment: async (requestData: PaymentExecuteRequest): Promise<ApiResponse<PaymentExecuteResponse>> => {
    return api.post<PaymentExecuteResponse>('/payments/execute', requestData);
  }
};

// ============= Payment History Types =============
export interface PaymentHistorySearchRequest {
  startDate?: string;
  endDate?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PaymentHistorySearchResponse {
  content: PaymentHistoryItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface PaymentHistoryItem {
  paymentId: number;
  reservationId: number;
  externalOrderId: string;
  paymentStatus: string;
  amountPaid: number;
  amountOriginalTotal: number;
  totalDiscountAmountApplied: number;
  mileagePointsUsed: number;
  mileageAmountDeducted: number;
  mileageToEarn: number;
  paymentMethod: string;
  pgProvider?: string;
  pgApprovalNo?: string;
  paidAt: string;
  createdAt: string;
  receiptUrl?: string;
}

// Payment History API
export const paymentHistoryApi = {
  // 회원 결제 이력 조회
  getMemberPaymentHistory: async (request?: PaymentHistorySearchRequest): Promise<ApiResponse<PaymentHistorySearchResponse>> => {
    return api.get<PaymentHistorySearchResponse>('/payment-history/member', request);
  },

  // 비회원 결제 이력 조회
  getGuestPaymentHistory: async (
    reservationId: number,
    name: string,
    phone: string,
    password: string
  ): Promise<ApiResponse<PaymentHistoryItem>> => {
    return api.post<PaymentHistoryItem>('/payment-history/guest/search', {
      reservationId,
      name,
      phone,
      password
    });
  },

  // 예약번호로 결제 정보 조회 (공용)
  getPaymentByReservationIdPublic: async (reservationId: number): Promise<ApiResponse<PaymentHistoryItem>> => {
    return api.get<PaymentHistoryItem>(`/payment-history/reservation/${reservationId}`);
  },

  // 특정 결제 상세 조회
  getPaymentDetail: async (paymentId: number): Promise<ApiResponse<PaymentHistoryItem>> => {
    return api.get<PaymentHistoryItem>(`/payment-history/${paymentId}`);
  }
};

// ============= Refund Types =============
export interface RefundCalculationRequest {
  paymentId: number;
  refundType: 'CANCEL' | 'PARTIAL';
  refundReason: string;
  trainDepartureTime?: string;
  trainArrivalTime?: string;
}

export interface RefundCalculationResponse {
  refundCalculationId: number;
  paymentId: number;
  reservationId: number;
  originalAmount: number;
  refundFeeRate: number;
  refundFee: number;
  refundAmount: number;
  mileageRefundAmount: number;
  trainDepartureTime: string;
  refundRequestTime: string;
  refundType: string;
  status: string;
  isRefundableByTime: boolean;
  refundPolicy: {
    timeUntilDeparture: number;
    feePercentage: number;
    description: string;
  };
}

export interface RefundProcessRequest {
  refundCalculationId: number;
}

export interface RefundProcessResponse {
  refundId: number;
  paymentId: number;
  refundAmount: number;
  refundStatus: string;
  refundCompletedAt: string;
}

// Refund API
export const refundApi = {
  // 환불 금액 계산
  calculateRefund: async (request: RefundCalculationRequest) => {
    const response = await api.post<RefundCalculationResponse>('/refunds/calculate', request);
    return response.result || response;
  },

  // 환불 처리
  processRefund: async (refundId: number) => {
    const response = await api.post<RefundProcessResponse>(`/refunds/${refundId}/process`);
    return response.result || response;
  }
};

// Default export for backward compatibility
const apiClient = api;
export default apiClient;