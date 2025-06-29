import { api } from '../api';

// 회원가입 요청 타입
export interface SignupRequest {
  name: string;
  phoneNumber: string;
  password: string;
  email: string;
  birthDate: string;
  gender: 'M' | 'F';
}

// 회원가입 응답 타입
export interface SignupResponse {
  memberNo: string;
}

// 회원가입 API 함수
export const signup = async (signupData: SignupRequest): Promise<SignupResponse> => {
  try {
    const response = await api.post<SignupResponse>('/auth/signup', signupData);
    
    if (response.result) {
      return response.result;
    }
    
    throw new Error(response.message || '회원가입에 실패했습니다.');
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}; 