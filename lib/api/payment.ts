import { api } from '../api';

// 결제 관련 타입 정의
export interface PaymentProcessCardRequest {
  reservationId: number;
  amount: number;
  cardNumber: string;
  validThru: string;
  rrn: string;
  installmentMonths: number;
  cardPassword: number;
}

export interface PaymentProcessAccountRequest {
  reservationId: number;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountHolderName: string;
  identificationNumber: string;
  accountPassword: string;
}

export interface PaymentProcessResponse {
  paymentId: number;
  paymentKey: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAt: string;
}

export interface PaymentHistoryResponse {
  paymentId: number;
  paymentKey: string;
  reservationCode: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paidAt: string;
  cancelledAt?: string;
  refundedAt?: string;
}

export interface PaymentCancelResponse {
  paymentId: number;
  paymentKey: string;
  amount: number;
  cancelledAt: string;
  refundAmount: number;
}

// 카드 결제 처리
export const processPaymentViaCard = async (request: PaymentProcessCardRequest): Promise<PaymentProcessResponse> => {
  const response = await api.post<PaymentProcessResponse>('/api/v1/payments/card', request);
  return response.result!;
};

// 계좌이체 결제 처리
export const processPaymentViaBankAccount = async (request: PaymentProcessAccountRequest): Promise<PaymentProcessResponse> => {
  const response = await api.post<PaymentProcessResponse>('/api/v1/payments/bank-account', request);
  return response.result!;
};

// 결제 취소
export const cancelPayment = async (paymentKey: string): Promise<PaymentCancelResponse> => {
  const response = await api.post<PaymentCancelResponse>(`/api/v1/payments/${paymentKey}/cancel`);
  return response.result!;
};

// 결제 내역 조회
export const getPaymentHistory = async (): Promise<PaymentHistoryResponse[]> => {
  const response = await api.get<PaymentHistoryResponse[]>('/api/v1/payments');
  return response.result!;
};