import axios from 'axios';

// API 클라이언트 설정
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (토큰 자동 추가)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API 요청:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
apiClient.interceptors.response.use(
  (response) => {
    console.log('API 응답:', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('API 에러:', error.response?.status, error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      // 토큰 만료 처리
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// 결제 내역 조회 API 함수들
export const paymentApi = {
  // 회원 결제 내역 조회
  getPaymentHistory: async (params: {
    memberId: number;
    startDate: string;
    endDate: string;
    page?: number;
    size?: number;
  }) => {
    const { data } = await apiClient.get('/api/v1/payments/history', {
      params: {
        memberId: params.memberId,
        startDate: params.startDate,
        endDate: params.endDate,
        page: params.page || 0,
        size: params.size || 20,
      },
    });
    return data;
  },

  // 비회원 결제 조회
  getNonMemberPayment: async (params: {
    reservationId: string;
    name: string;
    phoneNumber: string;
    password: string;
  }) => {
    const { data } = await apiClient.get('/api/v1/payments/non-member', {
      params,
    });
    return data;
  },

  // 결제 상세 정보 조회
  getPaymentDetail: async (paymentId: number, memberId: number) => {
    const { data } = await apiClient.get(`/api/v1/payments/${paymentId}/detail`, {
      params: { memberId },
    });
    return data;
  },

  // 결제 계산 API
  calculatePayment: async (requestData: any) => {
    const { data } = await apiClient.post('/api/v1/payments/calculate', requestData);
    return data;
  },

  // PG 결제 요청 API
  requestPgPayment: async (requestData: any) => {
    const { data } = await apiClient.post('/api/v1/payments/pg/request', requestData);
    return data;
  },

  // PG 결제 승인 API
  approvePgPayment: async (requestData: any) => {
    const { data } = await apiClient.post('/api/v1/payments/pg/approve', requestData);
    return data;
  },
};

// 저장된 결제 수단 관리 API 함수들
export const savedPaymentMethodApi = {
  // 저장된 결제 수단 목록 조회
  getSavedPaymentMethods: async (memberId: number) => {
    const { data } = await apiClient.get('/api/v1/saved-payment-methods', {
      params: { memberId },
    });
    return data;
  },

  // 결제 수단 저장
  savePaymentMethod: async (requestData: {
    memberId: number;
    paymentMethodType: string;
    alias: string; // displayName → alias로 변경
    cardNumber?: string;
    cardExpiryMonth?: string;
    cardExpiryYear?: string;
    cardHolderName?: string;
    cardCvc?: string; // CVC 필드 추가
    bankCode?: string;
    accountNumber?: string;
    accountHolderName?: string;
    accountPassword?: string; // 계좌 비밀번호 필드 추가
    isDefault: boolean;
  }) => {
    const { data } = await apiClient.post('/api/v1/saved-payment-methods', requestData);
    return data;
  },

  // 결제 수단 삭제
  deletePaymentMethod: async (paymentMethodId: number) => {
    const { data } = await apiClient.delete(`/api/v1/saved-payment-methods/${paymentMethodId}`);
    return data;
  },

  // 기본 결제 수단 설정
  setDefaultPaymentMethod: async (paymentMethodId: number, memberId: number) => {
    const { data } = await apiClient.put(`/api/v1/saved-payment-methods/${paymentMethodId}/default`, {
      memberId,
    });
    return data;
  },
};

// 편의 함수들 (기존 함수와의 호환성을 위해)
export const getSavedPaymentMethods = async () => {
  const memberId = 1; // 임시 memberId (실제로는 로그인 상태에서 가져와야 함)
  return savedPaymentMethodApi.getSavedPaymentMethods(memberId);
};

export const savePaymentMethod = async (requestData: Omit<Parameters<typeof savedPaymentMethodApi.savePaymentMethod>[0], 'memberId'>) => {
  const memberId = 1; // 임시 memberId (실제로는 로그인 상태에서 가져와야 함)
  return savedPaymentMethodApi.savePaymentMethod({ ...requestData, memberId });
};

export const deleteSavedPaymentMethod = async (paymentMethodId: number) => {
  return savedPaymentMethodApi.deletePaymentMethod(paymentMethodId);
};

export const setDefaultPaymentMethod = async (paymentMethodId: number) => {
  const memberId = 1; // 임시 memberId (실제로는 로그인 상태에서 가져와야 함)
  return savedPaymentMethodApi.setDefaultPaymentMethod(paymentMethodId, memberId);
};

// 사용자 정보 조회 API
export const getUserInfo = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data;
};

export default apiClient;

