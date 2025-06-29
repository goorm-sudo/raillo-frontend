import {tokenManager} from './auth';

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 환경 변수 체크
if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL 환경 변수가 설정되지 않았습니다.');
}

// API 응답 타입 정의 (실제 응답 형식에 맞춤)
export interface ApiResponse<T = any> {
    message?: string;
    result?: T;
}

// API 에러 응답 타입
export interface ApiErrorResponse {
    timestamp: string;
    errorCode: string;
    errorMessage: string;
    details: any;
}

// API 에러 타입
export class ApiError extends Error {
    constructor(
        public status: number,
        public errorCode: string,
        public errorMessage: string,
        public details?: any
    ) {
        super(errorMessage);
        this.name = 'ApiError';
    }
}

// 기본 헤더 설정
const getDefaultHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // 토큰이 있다면 Authorization 헤더 추가
    const token = tokenManager.getToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
};

// API 요청 공통 함수
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
        headers: getDefaultHeaders(),
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            // 에러 응답 처리
            const errorData = data as ApiErrorResponse;
            throw new ApiError(
                response.status,
                errorData.errorCode,
                errorData.errorMessage,
                errorData.details
            );
        }

        // 성공 응답 처리
        return data as ApiResponse<T>;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            'NETWORK_ERROR',
            error instanceof Error ? error.message : 'Unknown error occurred'
        );
    }
}

// HTTP 메서드별 함수들
export const api = {
    // GET 요청
    get: <T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> => {
        const url = new URL(`${API_BASE_URL}${endpoint}`);
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        return apiRequest<T>(url.pathname + url.search);
    },

    // POST 요청
    post: <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
        return apiRequest<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    // PUT 요청
    put: <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
        return apiRequest<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    // PATCH 요청
    patch: <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
        return apiRequest<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    // DELETE 요청
    delete: <T>(endpoint: string): Promise<ApiResponse<T>> => {
        return apiRequest<T>(endpoint, {
            method: 'DELETE',
        });
    },
};

export default api;
