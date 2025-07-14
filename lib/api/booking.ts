import { api } from '../api'

// 예약 요청 타입
export interface ReservationRequest {
  trainScheduleId: number;
  departureStationId: number;
  arrivalStationId: number;
  passengers: {
    passengerType: 'ADULT' | 'CHILD' | 'INFANT' | 'SENIOR' | 'DISABLED_HEAVY' | 'DISABLED_LIGHT' | 'VETERAN';
    count: number;
  }[];
  seatIds: number[];
  tripType: "OW";
}

// 예약 응답 타입
export interface ReservationResponse {
  reservationId: number
  seatReservationIds: number[]
}

// 예약 정보 조회 응답 타입
export interface ReservationDetailResponse {
  reservationId: number
  reservationCode: string
  trainNumber: string
  trainName: string
  departureStationName: string
  arrivalStationName: string
  departureTime: string
  arrivalTime: string
  operationDate: string
  expiresAt: string
  seats: {
    seatReservationId: number
    passengerType: string
    carNumber: number
    carType: string
    seatNumber: string
    baseFare: number
    fare: number
  }[]
}

// 예약 요청 함수
export const makeReservation = async (request: ReservationRequest) => {
  return api.post<ReservationResponse>("/api/v1/booking/reservation", request)
}

// 예약 정보 조회 함수
export const getReservationDetail = async (reservationId: number) => {
  return api.get<ReservationDetailResponse>(`/api/v1/booking/reservation/${reservationId}`)
}

// 예약 취소 함수 (body에 reservationId를 JSON으로 보냄)
export const deleteReservation = async (reservationId: number) => {
  return api.delete("/api/v1/booking/reservation", {
    reservationId
  })
}

// 장바구니에 예약 추가 요청 타입
export interface AddToCartRequest {
  reservationId: number
}

// 장바구니에 예약 추가 응답 타입
export interface AddToCartResponse {
  message: string
}

// 장바구니 조회 응답 타입
export interface CartResponse {
  message: string
  result: ReservationDetailResponse[]
}

// 장바구니에 예약 추가 함수
export const addToCart = async (request: AddToCartRequest) => {
  return api.post<AddToCartResponse>("/api/v1/cart/reservations", request)
}

// 장바구니 조회 함수
export const getCart = async () => {
  return api.get<CartResponse>("/api/v1/cart/reservations")
}

// 예약 목록 조회 함수
export const getReservationList = async () => {
  return api.get<ReservationDetailResponse[]>("/api/v1/booking/reservation")
}

 