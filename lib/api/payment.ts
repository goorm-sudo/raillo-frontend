import { api } from '../api'

// 결제 계산 요청 타입
export interface PaymentCalculationRequest {
  reservationId?: number;
  externalOrderId: string;
  userId: string;
  originalAmount: number;
  items?: PaymentItem[];
  requestedPromotions?: PromotionRequest[];
  mileageToUse?: number;
  availableMileage?: number;
  clientIp?: string;
  userAgent?: string;
  trainScheduleId?: number;
  trainDepartureTime?: string;
  trainArrivalTime?: string;
  routeInfo?: string;
  seatNumber?: string;
}

export interface PaymentItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface PromotionRequest {
  type: string;
  identifier?: string;
  pointsToUse?: number;
}

// 결제 계산 응답 타입
export interface PaymentCalculationResponse {
  id: string;
  externalOrderId: string;
  originalAmount: number;
  discountAmount: number;
  mileageUsed: number;
  finalPayableAmount: number;
  appliedPromotions: AppliedPromotion[];
  expiresAt: string;
}

export interface AppliedPromotion {
  type: string;
  name: string;
  discountAmount: number;
  details: string;
}

// 결제 실행 요청 타입
export interface PaymentExecuteRequest {
  calculationId: string;
  paymentMethod: string;
  cardInfo?: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardHolderName: string;
    installmentMonths?: number;
  };
  bankInfo?: {
    bankCode: string;
    accountNumber: string;
    accountPassword: string;
  };
  simplePaymentInfo?: {
    provider: string;
    phoneNumber: string;
  };
  cashReceiptInfo?: {
    type: string;
    identifier: string;
  };
  nonMemberInfo?: {
    name: string;
    phoneNumber: string;
    password: string;
  };
  savePaymentMethod?: boolean;
  paymentMethodAlias?: string;
  mileageToUse?: number;
}

// 결제 실행 응답 타입
export interface PaymentExecuteResponse {
  paymentId: string;
  status: string;
  amount: number;
  paidAt: string;
  receiptUrl?: string;
  pgResponse?: {
    transactionId: string;
    approvalNumber?: string;
    cardInfo?: {
      cardNumber: string;
      cardType: string;
      issuerName: string;
    };
  };
}

// 결제 계산 API
export const calculatePayment = async (request: PaymentCalculationRequest) => {
  return api.post<PaymentCalculationResponse>("/payments/calculate", request)
}

// 결제 실행 API
export const executePayment = async (request: PaymentExecuteRequest) => {
  return api.post<PaymentExecuteResponse>("/payments/execute", request)
}

// 결제 계산 조회 API
export const getCalculation = async (calculationId: string) => {
  return api.get<PaymentCalculationResponse>(`/payments/calculations/${calculationId}`)
}

// PG 결제 승인 API (카카오페이 등)
export const confirmPgPayment = async (calculationId: string, pgToken: string) => {
  return api.post<PaymentExecuteResponse>("/payments/confirm", {
    calculationId,
    pgToken
  })
}