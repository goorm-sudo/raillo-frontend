import {tokenManager} from './auth';

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 환경 변수 체크
if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL 환경 변수가 설정되지 않았습니다.');
}

// API 응답 타입 정의
export interface ApiResponse<T = any> {
    message?: string;
    result?: T;
}

// 서버 에러 응답 타입 정의
export interface ApiErrorResponse {
    timestamp: string;
    errorCode: string;
    errorMessage: string;
    details: any;
}

// 커스텀 API 에러 클래스
export class ApiError extends Error {
    public timestamp: string;
    public errorCode: string;
    public details: any;
    public status: number;

    constructor(message: string, errorCode: string, timestamp: string, details: any, status: number) {
        super(message);
        this.name = 'ApiError';
        this.errorCode = errorCode;
        this.timestamp = timestamp;
        this.details = details;
        this.status = status;
    }
}

// 기본 헤더 설정 (토큰 자동 포함)
const getDefaultHeaders = async (): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // 토큰이 있고 유효하면 Authorization 헤더 추가
    if (tokenManager.isAuthenticated()) {
        const token = tokenManager.getToken();
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
    } else {
        // 토큰이 만료되었지만 refreshToken이 있으면 갱신 시도
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
            const refreshSuccess = await tokenManager.refreshToken();
            if (refreshSuccess) {
                const newToken = tokenManager.getToken();
                if (newToken) {
                    headers.Authorization = `Bearer ${newToken}`;
                }
            }
        }
    }

    return headers;
};

// API 요청 공통 함수
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const startTime = new Date();

    const config: RequestInit = {
        headers: await getDefaultHeaders(),
        ...options,
    };

    try {
        const response = await fetch(url, config);

        // 204 No Content 처리
        if (response.status === 204) {
            return {} as ApiResponse<T>;
        }

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        if (!response.ok) {
            // 401 에러이고 재시도하지 않았고 토큰이 있는 경우 토큰 갱신 시도
            if (response.status === 401 && retryCount === 0 && tokenManager.getRefreshToken()) {
                const refreshSuccess = await tokenManager.refreshToken();
                
                if (refreshSuccess) {
                    // 토큰 갱신 성공 시 재시도 (최대 1회)
                    return apiRequest<T>(endpoint, options, retryCount + 1);
                } else {
                    // 토큰 갱신 실패 시 사용자에게 알림
                    const userChoice = await tokenManager.handleTokenExpiration();
                    if (userChoice) {
                        // 사용자가 토큰 갱신을 선택한 경우 재시도
                        return apiRequest<T>(endpoint, options, retryCount + 1);
                    }
                    // 사용자가 로그아웃을 선택한 경우 에러 처리로 넘어감
                }
            }

            // 서버 에러 응답 형식에 맞게 처리
            const errorData = data as ApiErrorResponse;
            
            // 통합 에러 로그
            console.error('❌ API Error:', {
                url,
                method: config.method || 'GET',
                status: response.status,
                statusText: response.statusText,
                errorCode: errorData.errorCode,
                errorMessage: errorData.errorMessage,
                duration: `${duration}ms`,
                timestamp: endTime.toISOString(),
                retryCount
            });
            
            if (errorData.errorMessage) {
                throw new ApiError(
                    errorData.errorMessage,
                    errorData.errorCode || 'UNKNOWN_ERROR',
                    errorData.timestamp || new Date().toISOString(),
                    errorData.details || null,
                    response.status
                );
            } else if (data.message) {
                throw new ApiError(
                    data.message,
                    'UNKNOWN_ERROR',
                    new Date().toISOString(),
                    null,
                    response.status
                );
            } else {
                throw new ApiError(
                    'API 요청에 실패했습니다.',
                    'UNKNOWN_ERROR',
                    new Date().toISOString(),
                    null,
                    response.status
                );
            }
        }

        // 통합 성공 로그
        console.log('✅ API Success:', {
            url,
            method: config.method || 'GET',
            status: response.status,
            statusText: response.statusText,
            data,
            duration: `${duration}ms`,
            timestamp: endTime.toISOString(),
            retryCount
        });

        return data as ApiResponse<T>;
    } catch (error: any) {
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();
        
        // 네트워크 에러 등 기타 에러 로그
        console.error('💥 API Network Error:', {
            url,
            method: config.method || 'GET',
            error: error.message,
            duration: `${duration}ms`,
            timestamp: endTime.toISOString(),
            retryCount
        });
        throw error;
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
    delete: <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
        return apiRequest<T>(endpoint, {
            method: 'DELETE',
            body: data ? JSON.stringify(data) : undefined,
        });
    },
};

export default api;
