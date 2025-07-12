// 좌석 클래스
export enum SeatClass {
  STANDARD = 'STANDARD',        // 일반실
  FIRST_CLASS = 'FIRST_CLASS'   // 특실
}

// 좌석 위치
export enum SeatPosition {
  WINDOW = 'WINDOW',      // 창가
  AISLE = 'AISLE',        // 통로
  MIDDLE = 'MIDDLE'       // 중간
}

// 좌석 방향
export enum SeatDirection {
  FORWARD = 'FORWARD',    // 순방향
  BACKWARD = 'BACKWARD'   // 역방향
}

// 좌석 상태
export enum SeatStatus {
  AVAILABLE = 'AVAILABLE',          // 예약 가능
  RESERVED = 'RESERVED',            // 예약됨
  OCCUPIED = 'OCCUPIED',            // 점유됨
  MAINTENANCE = 'MAINTENANCE',      // 정비중
  BLOCKED = 'BLOCKED'               // 차단됨
}

// 좌석 기본 정보
export interface Seat {
  seatId: number;
  carNumber: number;
  seatNumber: string;
  seatClass: SeatClass;
  seatPosition: SeatPosition;
  seatDirection: SeatDirection;
  seatStatus: SeatStatus;
  row: number;
  column: string; // A, B, C, D 등
}

// 좌석 예약 가능성 정보
export interface SeatAvailability {
  seatId: number;
  isAvailable: boolean;
  fare: number;
  specialNote?: string; // 특별 사항 (예: "테이블 좌석", "콘센트 있음" 등)
}

// 객차 레이아웃 정보
export interface CarLayout {
  carNumber: number;
  seatClass: SeatClass;
  totalRows: number;
  seatsPerRow: number;
  seatConfiguration: string; // "2x2", "3x2" 등
  facilities: string[]; // ["화장실", "자판기", "수유실"] 등
}

// 좌석 선택 정보 (UI용)
export interface SelectedSeat {
  seatId: number;
  carNumber: number;
  seatNumber: string;
  seatClass: SeatClass;
  fare: number;
  passengerName?: string;
  passengerType?: 'ADULT' | 'CHILD' | 'SENIOR';
}

// 좌석 추천 정보
export interface SeatRecommendation {
  seatIds: number[];
  reason: string; // "함께 앉을 수 있는 좌석", "조용한 구역", "화장실 가까움" 등
  score: number; // 추천 점수 (0-100)
}

// 좌석 필터 옵션
export interface SeatFilterOptions {
  seatClass?: SeatClass;
  seatPosition?: SeatPosition[];
  seatDirection?: SeatDirection;
  minRow?: number;
  maxRow?: number;
  preferTogether?: boolean; // 함께 앉기 선호
  nearFacilities?: string[]; // 가까운 시설
}

// 좌석 그룹 (여러 명이 함께 앉을 때)
export interface SeatGroup {
  groupId: string;
  seats: Seat[];
  totalFare: number;
  groupType: 'ROW' | 'FACING' | 'ADJACENT'; // 같은 줄, 마주보기, 인접
}

// 좌석 맵 표시 정보
export interface SeatMapDisplay {
  carNumber: number;
  layout: CarLayout;
  seats: SeatWithAvailability[];
  legendItems: LegendItem[];
}

// 좌석과 가용성 정보 결합
export interface SeatWithAvailability extends Seat {
  availability: SeatAvailability;
}

// 범례 아이템
export interface LegendItem {
  status: SeatStatus;
  label: string;
  color: string;
  icon?: string;
}

// 좌석 선택 검증 결과
export interface SeatSelectionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}