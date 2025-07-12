import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  TrainSearchRequest, 
  TrainSearchSlicePageResponse, 
  TrainCarListRequest,
  TrainCarSeatDetailRequest,
  STATION_MAP 
} from '@/lib/types/train.types';
import { 
  CreateReservationRequest,
  CancelReservationRequest 
} from '@/lib/types/reservation.types';
import {
  PaymentCalculationRequest,
  PaymentCalculationResponse,
  PgPaymentRequest,
  PgPaymentResponse,
  PgPaymentApprovalRequest,
  PaymentExecuteResponse,
  PaymentExecuteRequest
} from '@/lib/types/payment.types';

// 백엔드 공통 응답 형식
interface SuccessResponse<T> {
  message: string;
  result: T;
}

// 백엔드 URL 동적 설정
const getBackendURL = () => {
  // 브라우저 환경에서만 실행
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    
    // 네트워크 IP로 접속한 경우 같은 IP로 백엔드 접근
    if (currentHost === '192.168.1.39') {
      return 'http://192.168.1.39:8080';
    }
    // 127.0.0.1로 접속한 경우
    if (currentHost === '127.0.0.1') {
      return 'http://127.0.0.1:8080';
    }
  }
  
  // 기본값은 localhost
  return 'http://localhost:8080';
};

// API 클라이언트 설정
const apiClient: AxiosInstance = axios.create({
  baseURL: getBackendURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (토큰 자동 추가)
apiClient.interceptors.request.use(
  (config) => {
    // 요청 데이터 로깅 (디버깅용)
    if (config.url?.includes('/payments/calculate')) {
      console.log('📊 Payment calculation request details:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data,
        dataType: typeof config.data,
        dataStringified: JSON.stringify(config.data),
        dataKeys: config.data ? Object.keys(config.data) : 'NO_DATA',
        dataValues: config.data ? JSON.stringify(config.data, null, 2) : 'NO_DATA',
        hasData: !!config.data,
        dataLength: config.data ? JSON.stringify(config.data).length : 0,
        contentType: config.headers['Content-Type']
      });
      
      // Axios가 data를 string으로 변환했는지 확인
      if (typeof config.data === 'string') {
        console.log('📝 Request data is already stringified:', config.data);
      }
      
      // 데이터가 없거나 빈 객체인 경우 경고
      if (!config.data || (typeof config.data === 'object' && Object.keys(config.data).length === 0)) {
        console.error('⚠️ 경고: Payment calculation 요청 데이터가 비어있습니다!');
      }
    }
    
    // 비회원도 접근 가능한 API 목록 (토큰이 있으면 포함, 없으면 제외)
    const optionalAuthAPIs = [
      '/api/v1/booking/reservation',  // 예약 생성 - 회원/비회원 모두 가능
      '/api/v1/payments/calculate',  // 결제 계산 - 회원/비회원 모두 가능
      '/api/v1/payments/execute'  // 결제 실행 - 회원/비회원 모두 가능
    ];
    
    // 토큰 없이도 접근 가능한 API 목록
    const publicAPIs = [
      '/api/v1/trains',
      '/api/v1/booking/fare',
      '/api/v1/booking/seat',
      '/api/v1/payments/pg',
      '/api/v1/payment-history/member/reservation',  // 예약번호로 결제 정보 조회 (회원)
      '/api/v1/payment-history/reservation',  // 예약번호로 결제 정보 조회 (공용)
    ];
    
    const isPublicAPI = publicAPIs.some(api => config.url?.includes(api));
    const isOptionalAuthAPI = optionalAuthAPIs.some(api => config.url?.includes(api));
    const token = localStorage.getItem('accessToken');
    
    // Public API는 토큰 없이 요청
    if (isPublicAPI) {
      console.log('🔓 Public API 요청 (토큰 없음):', {
        method: config.method?.toUpperCase(),
        url: config.url,
        isPublicAPI
      });
      // Public API는 토큰을 제거
      delete config.headers.Authorization;
    } else if (isOptionalAuthAPI) {
      // Optional Auth API는 토큰이 있을 때만 추가
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔐 Optional Auth API 요청 (회원):', {
          method: config.method?.toUpperCase(),
          url: config.url,
          hasToken: true
        });
      } else {
        console.log('🔓 Optional Auth API 요청 (비회원):', {
          method: config.method?.toUpperCase(),
          url: config.url,
          hasToken: false
        });
      }
    } else if (token) {
      // Private API이고 토큰이 있는 경우에만 토큰 추가
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🚀 Private API 요청 with 토큰:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        tokenPresent: !!token,
        tokenLength: token.length,
        tokenStart: token.substring(0, 50) + '...',
        authHeader: `Bearer ${token.substring(0, 20)}...`
      });
    } else {
      console.log('⚠️ Private API 요청 without 토큰:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        tokenInStorage: !!localStorage.getItem('accessToken')
      });
    }
    return config;
  },
  (error) => {
    console.error('❌ 요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리 및 토큰 자동 갱신)
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API 응답 성공:', {
      status: response.status,
      url: response.config.url,
      dataSize: JSON.stringify(response.data).length
    });
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const url = error.response?.config?.url;
    const errorData = error.response?.data;
    const originalRequest = error.config;
    
    console.error('❌ API 에러 상세:', {
      status,
      url,
      errorData,
      message: error.message,
      hasToken: !!localStorage.getItem('accessToken')
    });
    
    // 비회원도 접근 가능한 API는 인증 에러를 무시
    const optionalAuthAPIs = [
      '/api/v1/booking/reservation',  // 예약 생성 - 회원/비회원 모두 가능
      '/api/v1/payments/calculate',  // 결제 계산 - 회원/비회원 모두 가능
      '/api/v1/payments/execute'  // 결제 실행 - 회원/비회원 모두 가능
    ];
    
    const publicAPIs = [
      '/api/v1/trains',
      '/api/v1/booking/fare',
      '/api/v1/booking/seat',
      '/api/v1/payments/pg',
      '/api/v1/payment-history/member/reservation',  // 예약번호로 결제 정보 조회 (회원)
      '/api/v1/payment-history/reservation',  // 예약번호로 결제 정보 조회 (공용)
    ];
    
    const isPublicAPI = publicAPIs.some(api => url?.includes(api));
    const isOptionalAuthAPI = optionalAuthAPIs.some(api => url?.includes(api));
    
    // Public API나 비회원 접근은 401/403 에러를 무시
    if (isPublicAPI) {
      console.log('🔓 Public API 인증 에러 무시:', {
        status,
        url,
        message: errorData?.errorMessage || errorData?.message
      });
      // Public API는 인증 에러를 그대로 반환
      return Promise.reject(error);
    }
    
    // 🔄 401/403 에러 시 토큰 갱신 시도 (회원 전용 API만 해당)
    if ((status === 401 || status === 403) && !originalRequest._retry) {
      // 토큰이 없는 경우는 로그인 필요 상태로 간주
      const hasToken = !!localStorage.getItem('accessToken');
      if (!hasToken) {
        console.log('🔒 토큰 없음 - 로그인 필요');
        return Promise.reject(error);
      }
      
      console.warn('🔐 인증 에러 발생 - 토큰 갱신 시도:', {
        status,
        url,
        accessToken: localStorage.getItem('accessToken') ? 'EXISTS' : 'MISSING',
        refreshToken: localStorage.getItem('refreshToken') ? 'EXISTS' : 'MISSING'
      });
      
      // 🚨 JWT 서명 오류, 만료된 토큰, 또는 403 에러 감지 시 토큰 갱신 시도
      if (errorData?.errorMessage?.includes('JWT') || 
          errorData?.message?.includes('JWT') ||
          errorData?.errorMessage?.includes('토큰') ||
          errorData?.errorMessage?.includes('서명') ||
          status === 403 || status === 401) {
        
        console.log('🔄 토큰 갱신 시도 중...');
        
        // 재시도 플래그 설정
        originalRequest._retry = true;
        
        try {
          // 동적 import로 순환 참조 방지
          const { tokenManager } = await import('@/lib/auth');
          
          const renewed = await tokenManager.refreshAccessToken();
          
          if (renewed) {
            console.log('✅ 토큰 갱신 성공 - 원본 요청 재시도');
            
            // 새 토큰으로 Authorization 헤더 업데이트
            const newToken = localStorage.getItem('accessToken');
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            
            // 원본 요청 재시도
            return apiClient(originalRequest);
          } else {
            console.warn('❌ 토큰 갱신 실패 - 로그아웃 처리');
            
            // 토큰 갱신 실패 시 로그아웃
            const { handleSessionExpiry } = await import('@/lib/auth');
            handleSessionExpiry();
            
            return Promise.reject(error);
          }
        } catch (refreshError) {
          console.error('❌ 토큰 갱신 중 예외 발생:', refreshError);
          
          // 갱신 실패 시 로그아웃
          const { handleSessionExpiry } = await import('@/lib/auth');
          handleSessionExpiry();
          
          return Promise.reject(error);
        }
      }
    }
    
    // 다른 에러나 이미 재시도한 요청은 그대로 반환
    return Promise.reject(error);
  }
);

// 결제 내역 조회 API 함수들
export const paymentHistoryApi = {
  // 회원 결제 내역 조회 (JWT에서 memberId 자동 추출)
  getMemberPaymentHistory: async (page: number = 0, size: number = 20) => {
    const { data } = await apiClient.get('/api/v1/payment-history/member', {
      params: { page, size }
    });
    return data;
  },

  // 회원 결제 내역 기간별 조회
  getMemberPaymentHistoryByDateRange: async (
    startDate: string,
    endDate: string,
    paymentMethod?: string,
    page: number = 0,
    size: number = 20
  ) => {
    const { data } = await apiClient.get('/api/v1/payment-history/member/date-range', {
      params: { startDate, endDate, paymentMethod, page, size }
    });
    return data;
  },

  // 특정 결제 상세 정보 조회
  getPaymentDetail: async (paymentId: number) => {
    const { data } = await apiClient.get(`/api/v1/payment-history/${paymentId}`);
    return data;
  },

  // 예약번호로 결제 정보 조회 (회원용)
  getPaymentByReservationId: async (reservationId: number) => {
    console.log('🔍 getPaymentByReservationId 호출:', {
      reservationId,
      type: typeof reservationId,
      url: `/api/v1/payment-history/member/reservation/${reservationId}`
    });
    
    try {
      const { data } = await apiClient.get(`/api/v1/payment-history/member/reservation/${reservationId}`);
      console.log('✅ getPaymentByReservationId 응답:', {
        hasData: !!data,
        dataType: typeof data,
        dataKeys: data ? Object.keys(data) : [],
        fullData: data
      });
      return data;
    } catch (error: any) {
      console.error('❌ getPaymentByReservationId 에러:', {
        reservationId,
        status: error.response?.status,
        errorMessage: error.response?.data?.errorMessage,
        fullError: error.response?.data
      });
      throw error;
    }
  },

  // 예약번호로 결제 정보 조회 (공용 - 비회원/회원 모두 사용 가능)
  getPaymentByReservationIdPublic: async (reservationId: number) => {
    console.log('🔍 getPaymentByReservationIdPublic 호출:', {
      reservationId,
      type: typeof reservationId,
      url: `/api/v1/payment-history/reservation/${reservationId}`
    });
    
    try {
      const { data } = await apiClient.get(`/api/v1/payment-history/reservation/${reservationId}`);
      console.log('✅ getPaymentByReservationIdPublic 응답:', {
        hasData: !!data,
        dataType: typeof data,
        dataKeys: data ? Object.keys(data) : [],
        fullData: data
      });
      return data;
    } catch (error: any) {
      console.error('❌ getPaymentByReservationIdPublic 에러:', {
        reservationId,
        status: error.response?.status,
        errorMessage: error.response?.data?.errorMessage,
        fullError: error.response?.data
      });
      throw error;
    }
  },

  // 비회원 결제 내역 조회
  getGuestPaymentHistory: async (
    reservationId: number,
    name: string,
    phoneNumber: string,
    password: string
  ) => {
    // 비회원 전체 조회 (reservationId 0인 경우)
    if (reservationId === 0) {
      const { data } = await apiClient.get('/api/v1/payment-history/guest/all', {
        params: { name, phoneNumber, password }
      });
      return data;
    } else {
      // 특정 예약 조회
      const { data } = await apiClient.get('/api/v1/payment-history/guest', {
        params: { reservationId, name, phoneNumber, password }
      });
      return data;
    }
  },

  // 마일리지 잔액 조회 (결제내역 컨트롤러의 추가 기능)
  getMileageBalanceFromHistory: async () => {
    const { data } = await apiClient.get('/api/v1/payment-history/mileage/balance');
    return data;
  },
};

// 저장된 결제수단 API 함수들 (올바른 경로 확인)
export const savedPaymentMethodApi = {
  // 저장된 결제수단 목록 조회 (JWT에서 memberId 자동 추출)
  getSavedPaymentMethods: async () => {
    const { data } = await apiClient.get('/api/v1/saved-payment-methods');
    return data;
  },

  // 저장된 결제수단 상세 조회 (실제 결제용 - 원본 데이터)
  getSavedPaymentMethodDetail: async (id: number) => {
    const { data } = await apiClient.get(`/api/v1/saved-payment-methods/${id}/raw`);
    return data;
  },

  // 저장된 결제수단 삭제
  deleteSavedPaymentMethod: async (id: number) => {
    const { data } = await apiClient.delete(`/api/v1/saved-payment-methods/${id}`);
    return data;
  },

  // 저장된 결제수단 추가
  addSavedPaymentMethod: async (paymentMethodData: any) => {
    const { data } = await apiClient.post('/api/v1/saved-payment-methods', paymentMethodData);
    return data;
  },

  // LocalFile 설계 반영 - 결제수단 사용 통계
  getPaymentMethodUsageStats: async () => {
    const { data } = await apiClient.get('/api/v1/saved-payment-methods/usage-stats');
    return data;
  },

  // 결제수단 보안 정보 조회
  getSecurityInfo: async () => {
    const { data } = await apiClient.get('/api/v1/saved-payment-methods/security-info');
    return data;
  },
};

// 계좌 검증 API (저장하지 않고 검증만)
export const bankAccountApi = {
  // 계좌 유효성 검증
  verifyBankAccount: async (verificationData: {
    bankCode: string;
    accountNumber: string;
    accountPassword: string;
  }) => {
    const { data } = await apiClient.post('/api/v1/payment/verify-bank-account', verificationData);
    return data;
  },
};

// 사용자 정보 조회 API
export const getUserInfo = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data;
};

// 마일리지 API 함수들 (LocalFile 설계와 1:1 매칭)
export const mileageApi = {
  // 마일리지 잔액 조회 (JWT에서 memberId 자동 추출)
  getMileageBalance: async () => {
    const { data } = await apiClient.get('/api/v1/mileage/balance');
    return data;
  },

  // 간단한 마일리지 잔액 조회 (JWT에서 memberId 자동 추출)
  getSimpleMileageBalance: async () => {
    const { data } = await apiClient.get('/api/v1/mileage/balance/simple');
    return data;
  },

  // 사용 가능한 마일리지 조회 (JWT에서 memberId 자동 추출)
  getAvailableMileage: async () => {
    const { data } = await apiClient.get('/api/v1/mileage/available');
    return data;
  },

  // 마일리지 통계 조회 (JWT에서 memberId 자동 추출)
  getMileageStatistics: async (startDate: string, endDate: string) => {
    const { data } = await apiClient.get('/api/v1/mileage/statistics', {
      params: { startDate, endDate },
    });
    return data;
  },

  // 마일리지 거래 내역 조회 (JWT에서 memberId 자동 추출)
  getMileageTransactions: async (page: number = 0, size: number = 10) => {
    const { data } = await apiClient.get('/api/v1/mileage/transactions', {
      params: { page, size },
    });
    return data;
  },

  // 적립 예정 마일리지 조회 (LocalFile 설계 반영)
  getEarningSchedules: async () => {
    const { data } = await apiClient.get('/api/v1/mileage/earning-schedules');
    return data;
  },

  // 지연 보상 마일리지 조회
  getDelayCompensation: async () => {
    const { data } = await apiClient.get('/api/v1/mileage/delay-compensation');
    return data;
  },

  // 마일리지 적립 이력 조회 (Train별)
  getEarningHistory: async (trainId?: string, startDate?: string, endDate?: string) => {
    const { data } = await apiClient.get('/api/v1/mileage/earning-history', {
      params: { trainId, startDate, endDate },
    });
    return data;
  },
};

// 기차 검색 API
export const trainApi = {
  // 기차 검색
  searchTrains: async (searchParams: {
    departure: string;
    arrival: string;
    date: string;
    passengers: number;
    time?: string;
  }) => {
    console.log('🚂 기차 검색 요청:', searchParams);
    
    try {
      const departureStationId = STATION_MAP[searchParams.departure] || 1;
      const arrivalStationId = STATION_MAP[searchParams.arrival] || 11;

      const request: TrainSearchRequest = {
        departureStationId,
        arrivalStationId,
        operationDate: searchParams.date,
        passengerCount: searchParams.passengers,
        departureHour: searchParams.time ? searchParams.time.padStart(2, '0') : '00'
      };

      const { data } = await apiClient.post<SuccessResponse<TrainSearchSlicePageResponse>>(
        '/api/v1/trains/search', 
        request
      );

      // 백엔드 응답을 프론트엔드 형식으로 변환
      const transformedTrains = data.result.content.map((train) => {
        // 소요 시간 파싱 (ISO 8601 Duration)
        const duration = train.travelTime;
        let durationText = "";
        if (duration) {
          const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
          if (match) {
            const hours = match[1] ? parseInt(match[1]) : 0;
            const minutes = match[2] ? parseInt(match[2]) : 0;
            if (hours > 0) {
              durationText = `${hours}시간 ${minutes}분`;
            } else {
              durationText = `${minutes}분`;
            }
          }
        }

        // 좌석 정보 변환
        const seatInfo: any = {};
        if (train.standardSeat) {
          seatInfo["일반실"] = {
            available: train.standardSeat.availableSeats,
            price: train.standardSeat.fare
          };
        }
        if (train.firstClassSeat) {
          seatInfo["특실"] = {
            available: train.firstClassSeat.availableSeats,
            price: train.firstClassSeat.fare
          };
        }
        if (train.standing) {
          seatInfo["입석"] = {
            available: train.standing.availableCount,
            price: train.standing.fare
          };
        }

        return {
          trainId: train.trainScheduleId.toString(),
          trainType: train.trainName,
          trainNumber: train.trainNumber,
          departureStation: train.departureStationName,
          arrivalStation: train.arrivalStationName,
          departureTime: train.departureTime,
          arrivalTime: train.arrivalTime,
          duration: durationText,
          price: train.standardSeat.fare,
          availableSeats: train.standardSeat.availableSeats,
          seatTypes: Object.keys(seatInfo),
          seatInfo
        };
      });

      return {
        message: "기차 검색이 완료되었습니다.",
        result: {
          searchDate: searchParams.date,
          route: `${searchParams.departure} → ${searchParams.arrival}`,
          trains: transformedTrains
        }
      };
    } catch (error) {
      console.error('❌ 기차 검색 실패:', error);
      throw error; // 에러를 상위로 전파하여 컴포넌트에서 처리
    }
  },

  // 운행 캘린더 조회
  getOperationCalendar: async () => {
    const { data } = await apiClient.get('/api/v1/trains/calendar');
    return data;
  },

  // 객차 목록 조회
  getTrainCars: async (request: TrainCarListRequest) => {
    const { data } = await apiClient.post('/api/v1/trains/cars', request);
    return data;
  },

  // 좌석 상세 조회
  getSeatDetail: async (request: TrainCarSeatDetailRequest) => {
    const { data } = await apiClient.post('/api/v1/trains/seats', request);
    return data;
  },
};

// 예약 관련 API 함수들
export const reservationApi = {
  // 예약 생성
  createReservation: async (requestData: CreateReservationRequest) => {
    const { data } = await apiClient.post('/api/v1/booking/reservation', requestData);
    return data;
  },

  // 예약 조회 (백엔드에 별도 API가 있는지 확인 필요)
  getReservation: async (reservationId: string) => {
    try {
      const { data } = await apiClient.get(`/api/v1/booking/reservation/${reservationId}`);
      return data;
    } catch (error) {
      console.error('예약 조회 실패:', error);
      throw error;
    }
  },

  // 예약 목록 조회 (회원)
  getReservations: async () => {
    try {
      // 백엔드에 예약 목록 조회 API가 없을 수 있음 - 결제 내역에서 대체
      const { data } = await apiClient.get('/api/v1/payment-history/member');
      // 결제 대기 중인 예약만 필터링
      const pendingReservations = data.result?.filter((item: any) => 
        item.paymentStatus === 'PENDING' || item.paymentStatus === 'PAYMENT_PENDING'
      ) || [];
      
      return {
        result: pendingReservations
      };
    } catch (error) {
      console.error('예약 목록 조회 실패:', error);
      return { result: [] };
    }
  },

  // 예약 취소
  cancelReservation: async (reservationId: number) => {
    const { data } = await apiClient.delete('/api/v1/booking/reservation', {
      data: { reservationId }
    });
    return data;
  },

  // 비회원 예약 조회
  getGuestReservation: async (name: string, phoneNumber: string, password: string, reservationNumber?: string) => {
    try {
      // 비회원 결제 내역 조회 API 활용
      const { data } = await apiClient.get('/api/v1/payment-history/guest', {
        params: { 
          name, 
          phoneNumber, 
          password,
          reservationNumber
        }
      });
      return data;
    } catch (error) {
      console.error('비회원 예약 조회 실패:', error);
      throw error;
    }
  },
};


// 결제 관련 API 함수들 - JWT 기반 자동 인증
export const paymentApi = {
  // 결제 계산 API - JWT에서 memberId 자동 추출
  calculatePayment: async (requestData: PaymentCalculationRequest): Promise<SuccessResponse<PaymentCalculationResponse>> => {
    const { data } = await apiClient.post<SuccessResponse<PaymentCalculationResponse>>(
      '/api/v1/payments/calculate', 
      requestData
    );
    return data;
  },

  // PG 결제 요청 API - JWT에서 memberId 자동 추출
  requestPgPayment: async (requestData: PgPaymentRequest): Promise<SuccessResponse<PgPaymentResponse>> => {
    const { data } = await apiClient.post<SuccessResponse<PgPaymentResponse>>(
      '/api/v1/payments/pg/request', 
      requestData
    );
    return data;
  },

  // PG 결제 승인 API - JWT에서 memberId 자동 추출
  approvePgPayment: async (requestData: PgPaymentApprovalRequest): Promise<SuccessResponse<PaymentExecuteResponse>> => {
    const { data } = await apiClient.post<SuccessResponse<PaymentExecuteResponse>>(
      '/api/v1/payments/pg/approve', 
      requestData
    );
    return data;
  },

  // 결제 실행 API (일반 결제) - JWT엑서 memberId 자동 추출
  executePayment: async (requestData: PaymentExecuteRequest): Promise<SuccessResponse<PaymentExecuteResponse>> => {
    const { data } = await apiClient.post<SuccessResponse<PaymentExecuteResponse>>(
      '/api/v1/payments/execute', 
      requestData
    );
    return data;
  },
};

// 환불 API 함수들 (LocalFile 스펙과 1:1 매칭)
export const refundApi = {
  // 환불 계산 요청
  calculateRefund: async (refundRequest: {
    paymentId: number;
    refundType: 'CHANGE' | 'CANCEL';
    refundReason: string;
    trainDepartureTime?: string;
    trainArrivalTime?: string;
  }) => {
    const { data } = await apiClient.post('/api/v1/refunds/calculate', refundRequest);
    return data;
  },

  // 환불 처리 실행
  processRefund: async (refundId: number) => {
    const { data } = await apiClient.post(`/api/v1/refunds/${refundId}/process`);
    return data;
  },

  // 환불 상세 조회
  getRefundDetail: async (refundId: number) => {
    const { data } = await apiClient.get(`/api/v1/refunds/${refundId}`);
    return data;
  },

  // 결제별 환불 조회
  getRefundsByPayment: async (paymentId: number) => {
    const { data } = await apiClient.get(`/api/v1/refunds/payment/${paymentId}`);
    return data;
  },

  // 회원별 환불 내역 (JWT에서 memberId 자동 추출)
  getMemberRefunds: async (page: number = 0, size: number = 20) => {
    const { data } = await apiClient.get('/api/v1/refunds/member', {
      params: { page, size }
    });
    return data;
  },

  // 처리 대기 중인 환불 목록 (관리자용)
  getPendingRefunds: async () => {
    const { data } = await apiClient.get('/api/v1/refunds/pending');
    return data;
  },

  // 환불 취소
  cancelRefund: async (refundId: number) => {
    const { data } = await apiClient.post(`/api/v1/refunds/${refundId}/cancel`);
    return data;
  },
};

// 마일리지 확장 API (LocalFile 스펙 기준)
export const mileageExtendedApi = {
  // 마일리지 적립 예정 내역 조회
  getEarningSchedule: async () => {
    const { data } = await apiClient.get('/api/v1/mileage/earning-schedule');
    return data;
  },

  // 지연 보상 마일리지 내역 조회
  getDelayCompensationHistory: async (page: number = 0, size: number = 20) => {
    const { data } = await apiClient.get('/api/v1/mileage/delay-compensation', {
      params: { page, size }
    });
    return data;
  },

  // 마일리지 상세 거래 내역 (확장)
  getDetailedTransactionHistory: async (
    page: number = 0, 
    size: number = 20,
    transactionType?: 'EARN' | 'USE' | 'REFUND' | 'DELAY_COMPENSATION'
  ) => {
    const { data } = await apiClient.get('/api/v1/mileage/transactions/detailed', {
      params: { page, size, transactionType }
    });
    return data;
  },
};

export default apiClient;

