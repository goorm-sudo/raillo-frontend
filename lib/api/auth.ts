import { api, ApiResponse } from '../api';

// 로그인 요청 타입
export interface LoginRequest {
    memberNo: string;
    password: string;
}

// 로그인 응답 타입
export interface LoginResponse {
    grantType: string;
    accessToken: string;
    accessTokenExpiresIn: number;
    refreshToken: string;
}

// 토큰 갱신 응답 타입
export interface TokenReissueResponse {
    grantType: string;
    accessToken: string;
    accessTokenExpiresIn: number;
}

// 인증 관련 API
export const authAPI = {
    // 로그인
    login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
        return api.post<LoginResponse>('/auth/login', data);
    },

    // 로그아웃
    logout: async (): Promise<ApiResponse> => {
        return api.post('/auth/logout');
    },

    // 토큰 갱신
    reissueToken: async (): Promise<ApiResponse<TokenReissueResponse>> => {
        return api.post<TokenReissueResponse>('/auth/reissue');
    },
};

// 기존 호환성을 위한 export
export const login = authAPI.login;
export const logout = authAPI.logout; 