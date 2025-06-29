import { api, ApiResponse } from '../api';

// 좌석 정보 타입
export interface SeatInfo {
  availableSeats: number;
  totalSeats: number;
  fare: number;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'SOLD_OUT';
  canReserve: boolean;
  displayText: string;
}

// 열차 정보 타입
export interface TrainSchedule {
  trainNumber: string;
  trainName: string;
  departureStationName: string;
  arrivalStationName: string;
  departureTime: string;
  arrivalTime: string;
  travelTime: string;
  standardSeat: SeatInfo;
  firstClassSeat: SeatInfo | null;
  standing: SeatInfo | null;
  formattedTravelTime: string;
  expressTrain: boolean;
}

// 페이지네이션 정보 타입
export interface PageInfo {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 열차 조회 응답 타입
export interface TrainSearchResponse {
  content: TrainSchedule[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// 열차 조회 요청 파라미터 타입
export interface TrainSearchRequest {
  departureStationId: number;
  arrivalStationId: number;
  operationDate: string;
  passengerCount: number;
  departureHour: string;
}

// 역 정보 타입
export interface Station {
  id: number;
  name: string;
}

// 역 정보 상수
export const STATIONS: Station[] = [
  { id: 1, name: '행신' },
  { id: 2, name: '서울' },
  { id: 3, name: '영등포' },
  { id: 4, name: '수원' },
  { id: 5, name: '광명' },
  { id: 6, name: '천안아산' },
  { id: 7, name: '오송' },
  { id: 8, name: '대전' },
  { id: 9, name: '김천구미' },
  { id: 10, name: '서대구' },
  { id: 11, name: '동대구' },
  { id: 12, name: '경주' },
  { id: 13, name: '울산' },
  { id: 14, name: '경산' },
  { id: 15, name: '밀양' },
  { id: 16, name: '물금' },
  { id: 17, name: '구포' },
  { id: 18, name: '부산' },
  { id: 19, name: '진영' },
  { id: 20, name: '창원중앙' },
  { id: 21, name: '창원' },
  { id: 22, name: '마산' },
  { id: 23, name: '진주' },
  { id: 24, name: '포항' },
  { id: 25, name: '용산' },
  { id: 26, name: '공주' },
  { id: 27, name: '서대전' },
  { id: 28, name: '계룡' },
  { id: 29, name: '논산' },
  { id: 30, name: '익산' },
  { id: 31, name: '김제' },
  { id: 32, name: '정읍' },
  { id: 33, name: '장성' },
  { id: 34, name: '광주송정' },
  { id: 35, name: '나주' },
  { id: 36, name: '목포' },
  { id: 37, name: '전주' },
  { id: 38, name: '남원' },
  { id: 39, name: '곡성' },
  { id: 40, name: '구례구' },
  { id: 41, name: '순천' },
  { id: 42, name: '여천' },
  { id: 43, name: '여수엑스포' },
  { id: 44, name: '청량리' },
  { id: 45, name: '상봉' },
  { id: 46, name: '덕소' },
  { id: 47, name: '양평' },
  { id: 48, name: '서원주' },
  { id: 49, name: '만종' },
  { id: 50, name: '횡성' },
  { id: 51, name: '둔내' },
  { id: 52, name: '평창' },
  { id: 53, name: '진부(오대산)' },
  { id: 54, name: '강릉' },
  { id: 55, name: '정동진' },
  { id: 56, name: '묵호' },
  { id: 57, name: '동해' },
  { id: 58, name: '원주' },
  { id: 59, name: '제천' },
  { id: 60, name: '단양' },
  { id: 61, name: '풍기' },
  { id: 62, name: '영주' },
  { id: 63, name: '안동' },
  { id: 64, name: '의성' },
  { id: 65, name: '영천' },
  { id: 66, name: '태화강' },
  { id: 67, name: '부전' },
  { id: 68, name: '판교(경기)' },
  { id: 69, name: '부발' },
  { id: 70, name: '가남' },
  { id: 71, name: '감곡장호원' },
  { id: 72, name: '앙성온천' },
  { id: 73, name: '충주' },
  { id: 74, name: '살미' },
  { id: 75, name: '수안보온천' },
  { id: 76, name: '연풍' },
  { id: 77, name: '문경' },
  { id: 78, name: '진부' },
  { id: 79, name: '구레구' }
];

// 역 정보 유틸리티 함수
export const stationUtils = {
  // ID로 역 이름 찾기
  getStationName: (id: number): string => {
    const station = STATIONS.find(s => s.id === id);
    return station ? station.name : '알 수 없음';
  },

  // 이름으로 역 ID 찾기
  getStationId: (name: string): number | null => {
    const station = STATIONS.find(s => s.name === name);
    return station ? station.id : null;
  },

  // 역 목록 가져오기
  getAllStations: (): Station[] => {
    return [...STATIONS];
  },

  // 역 이름으로 검색
  searchStations: (query: string): Station[] => {
    return STATIONS.filter(station => 
      station.name.includes(query)
    );
  }
};

// 열차 관련 API
export const trainAPI = {
  // 열차 조회
  searchTrains: async (request: TrainSearchRequest): Promise<ApiResponse<TrainSearchResponse>> => {
    return api.post<TrainSearchResponse>('/api/v1/train-schedule/search', request);
  },
};

// 기존 호환성을 위한 export
export const searchTrains = trainAPI.searchTrains; 