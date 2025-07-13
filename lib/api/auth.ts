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

// 회원번호 찾기 요청 타입
export interface FindMemberNoRequest {
    name: string;
    phoneNumber: string;
}

// 회원번호 찾기 응답 타입
export interface FindMemberNoResponse {
    email: string;
}

// 회원번호 찾기 인증 요청 타입
export interface VerifyMemberNoRequest {
    email: string;
    authCode: string;
}

// 회원번호 찾기 인증 응답 타입
export interface VerifyMemberNoResponse {
    memberNo: string;
}

// 비밀번호 찾기 요청 타입
export interface FindPasswordRequest {
    name: string;
    memberNo: string;
}

// 비밀번호 찾기 응답 타입
export interface FindPasswordResponse {
    email: string;
}

// 비밀번호 찾기 인증 요청 타입
export interface VerifyPasswordRequest {
    email: string;
    authCode: string;
}

// 비밀번호 찾기 인증 응답 타입
export interface VerifyPasswordResponse {
    temporaryToken: string;
}

// 비밀번호 변경 요청 타입
export interface ChangePasswordRequest {
    newPassword: string;
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

    // 회원번호 찾기 (이메일 인증 코드 전송)
    findMemberNo: async (data: FindMemberNoRequest): Promise<ApiResponse<FindMemberNoResponse>> => {
        return api.post<FindMemberNoResponse>('/auth/member-no', data);
    },

    // 회원번호 찾기 인증 코드 검증
    verifyMemberNo: async (data: VerifyMemberNoRequest): Promise<ApiResponse<VerifyMemberNoResponse>> => {
        return api.post<VerifyMemberNoResponse>('/auth/member-no/verify', data);
    },

    // 비밀번호 찾기 (이메일 인증 코드 전송)
    findPassword: async (data: FindPasswordRequest): Promise<ApiResponse<FindPasswordResponse>> => {
        return api.post<FindPasswordResponse>('/auth/password', data);
    },

    // 비밀번호 찾기 인증 코드 검증
    verifyPassword: async (data: VerifyPasswordRequest): Promise<ApiResponse<VerifyPasswordResponse>> => {
        return api.post<VerifyPasswordResponse>('/auth/password/verify', data);
    },

    // 비밀번호 변경 (임시 토큰 사용)
    changePassword: async (requestData: ChangePasswordRequest, temporaryToken: string): Promise<ApiResponse> => {
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/members/password`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${temporaryToken}`,
            },
            body: JSON.stringify(requestData),
        });

        if (response.status === 204) {
            return {} as ApiResponse;
        }

        const text = await response.text();
        const responseData = text ? JSON.parse(text) : {};

        if (!response.ok) {
            throw new Error(responseData.message || '비밀번호 변경에 실패했습니다.');
        }

        return responseData as ApiResponse;
    },
};

// 기존 호환성을 위한 export
export const login = authAPI.login;
export const logout = authAPI.logout; 