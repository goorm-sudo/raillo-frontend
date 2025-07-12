// 예약 상태
export enum ReservationStatus {
  PENDING = 'PENDING',          // 예약 대기
  CONFIRMED = 'CONFIRMED',      // 예약 확정
  CANCELLED = 'CANCELLED',      // 예약 취소
  COMPLETED = 'COMPLETED',      // 여행 완료
  EXPIRED = 'EXPIRED'           // 예약 만료
}

// 승객 정보
export interface PassengerInfo {
  name: string;
  phoneNumber: string;
  email?: string;
  isMainPassenger: boolean;
}

// 좌석 예약 정보
export interface SeatReservationInfo {
  seatId: number;
  carNumber: number;
  seatNumber: string;
  seatClass: 'STANDARD' | 'FIRST_CLASS';
  fare: number;
}

// 승객 요약 정보 (백엔드 PassengerSummary)
export interface PassengerSummary {
  adult: number;
  child: number;
  senior: number;
}

// 여행 타입
export enum TripType {
  OW = 'OW', // One Way (편도)
  RT = 'RT'  // Round Trip (왕복)
}

// 예약 생성 요청 (백엔드 스펙에 맞춤)
export interface CreateReservationRequest {
  trainScheduleId: number;
  seatId: number;
  departureStationId: number;
  arrivalStationId: number;
  passengerSummary: PassengerSummary;
  tripType: TripType;
}

// 프론트엔드용 예약 생성 요청 (UI에서 수집하는 데이터)
export interface FrontendReservationRequest {
  trainScheduleId: number;
  departureStationId: number;
  arrivalStationId: number;
  passengerInfos: PassengerInfo[];
  seatReservations: SeatReservationInfo[];
  totalAmount: number;
  memberInfo?: {
    memberId: number;
    memberName: string;
    memberPhone: string;
    memberEmail: string;
  };
  guestInfo?: {
    guestName: string;
    guestPhone: string;
    guestPassword: string;
  };
}

// 예약 생성 응답
export interface CreateReservationResponse {
  reservationId: number;
  reservationNumber: string;
  status: ReservationStatus;
  trainInfo: {
    trainNumber: string;
    trainName: string;
    departureStation: string;
    arrivalStation: string;
    departureTime: string;
    arrivalTime: string;
    operationDate: string;
  };
  passengerCount: number;
  totalAmount: number;
  paymentDeadline: string; // ISO 8601 DateTime
  createdAt: string;
}

// 예약 상세 정보
export interface ReservationDetail {
  reservationId: number;
  reservationNumber: string;
  status: ReservationStatus;
  trainInfo: {
    trainScheduleId: number;
    trainNumber: string;
    trainName: string;
    departureStation: string;
    arrivalStation: string;
    departureTime: string;
    arrivalTime: string;
    operationDate: string;
    duration: string;
  };
  passengers: PassengerInfo[];
  seatInfo: SeatReservationInfo[];
  paymentInfo: {
    totalAmount: number;
    paidAmount: number;
    paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
    paymentDeadline: string;
    paymentMethod?: string;
    paymentCompletedAt?: string;
  };
  memberInfo?: {
    memberId: number;
    memberName: string;
    memberPhone: string;
    memberEmail: string;
  };
  createdAt: string;
  updatedAt: string;
}

// 예약 목록 조회 응답
export interface ReservationListResponse {
  content: ReservationDetail[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// 예약 취소 요청
export interface CancelReservationRequest {
  reservationId: number;
  reason?: string;
}

// 예약 취소 응답
export interface CancelReservationResponse {
  reservationId: number;
  reservationNumber: string;
  status: ReservationStatus;
  cancelledAt: string;
  refundInfo?: {
    refundAmount: number;
    refundFee: number;
    refundMethod: string;
    refundStatus: string;
    expectedRefundDate: string;
  };
}

// 비회원 예약 조회 요청
export interface GuestReservationSearchRequest {
  name: string;
  phoneNumber: string;
  password: string;
  reservationNumber?: string;
}

// 비회원 예약 조회 응답
export interface GuestReservationSearchResponse {
  reservations: ReservationDetail[];
}

// 예약 가능 여부 확인 요청
export interface CheckReservationAvailabilityRequest {
  trainScheduleId: number;
  departureStationId: number;
  arrivalStationId: number;
  seatIds: number[];
}

// 예약 가능 여부 확인 응답
export interface CheckReservationAvailabilityResponse {
  isAvailable: boolean;
  unavailableSeatIds: number[];
  message?: string;
}