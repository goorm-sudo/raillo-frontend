// 기차 검색 요청 타입
export interface TrainSearchRequest {
  departureStationId: number;
  arrivalStationId: number;
  operationDate: string; // YYYY-MM-DD
  passengerCount: number;
  departureHour: string; // "00" ~ "23" (2자리 문자열, 필수)
}

// 좌석 가용성 상태
export enum SeatAvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  LIMITED = 'LIMITED',
  FEW_REMAINING = 'FEW_REMAINING',
  STANDING_AVAILABLE = 'STANDING_AVAILABLE',
  SOLD_OUT = 'SOLD_OUT'
}

// 좌석 타입별 정보
export interface SeatTypeInfo {
  availableSeats: number;
  totalSeats: number;
  fare: number;
  status: SeatAvailabilityStatus;
  canReserve: boolean;
  displayText: string;
}

// 입석 정보
export interface StandingTypeInfo {
  availableCount: number;
  fare: number;
  canReserve: boolean;
}

// 기차 검색 응답
export interface TrainSearchResponse {
  trainScheduleId: number;
  trainNumber: string;
  trainName: string;
  departureStationName: string;
  arrivalStationName: string;
  departureTime: string; // HH:mm
  arrivalTime: string; // HH:mm
  travelTime: string; // ISO 8601 Duration (PT40M)
  standardSeat: SeatTypeInfo;
  firstClassSeat: SeatTypeInfo;
  standing?: StandingTypeInfo;
}

// 기차 검색 페이징 응답
export interface TrainSearchSlicePageResponse {
  content: TrainSearchResponse[];
  currentPage: number;
  pageSize: number;
  numberOfElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  first: boolean;
  last: boolean;
}

// 운행 캘린더 아이템
export interface OperationCalendarItem {
  date: string; // YYYY-MM-DD
  isOperating: boolean;
  dayOfWeek: string;
  isHoliday: boolean;
  holidayName?: string;
}

// 객차 목록 요청
export interface TrainCarListRequest {
  trainScheduleId: number;
  departureStationId: number;
  arrivalStationId: number;
  passengerCount: number;
}

// 객차 정보
export interface TrainCarInfo {
  id: number;
  carNumber: string;
  carType: 'STANDARD' | 'FIRST_CLASS';
  totalSeats: number;
  remainingSeats: number;
  recommendationReason?: string;
}

// 객차 목록 응답
export interface TrainCarListResponse {
  recommendedCarNumber: string;
  totalCarCount: number;
  trainClassificationCode: string;
  trainNumber: string;
  carInfos: TrainCarInfo[];
}

// 좌석 상세 요청
export interface TrainCarSeatDetailRequest {
  trainCarId: number;
  trainScheduleId: number;
  departureStationId: number;
  arrivalStationId: number;
}

// 좌석 정보
export interface SeatInfo {
  seatId: number;
  seatNumber: string;
  seatPosition: 'WINDOW' | 'AISLE' | 'MIDDLE';
  direction: 'FORWARD' | 'BACKWARD';
  isAvailable: boolean;
  fare: number;
}

// 좌석 상세 응답
export interface TrainCarSeatDetailResponse {
  trainCarId: number;
  carNumber: number;
  seatClass: 'STANDARD' | 'FIRST_CLASS';
  totalSeatCount: number;
  remainingSeatCount: number;
  seatConfiguration: string; // "2x2" or "3x2"
  seats: SeatInfo[];
}

// 역 정보 (역 이름-ID 매핑용)
export interface StationInfo {
  id: number;
  name: string;
  code?: string;
  region?: string;
}

// 역 매핑 데이터
export const STATION_MAP: { [key: string]: number } = {
  "서울": 1,
  "용산": 2,
  "영등포": 3,
  "수원": 4,
  "천안아산": 5,
  "대전": 6,
  "김천구미": 7,
  "동대구": 8,
  "신경주": 9,
  "울산": 10,
  "부산": 11,
  "광주송정": 12,
  "목포": 13,
  "여수엑스포": 14,
  "강릉": 15,
  "정동진": 16,
  "춘천": 17,
  "원주": 18,
  "제천": 19,
  "안동": 20,
  "포항": 21,
  "경주": 22,
  "마산": 23,
  "진주": 24,
  "순천": 25,
  "여수": 26,
};