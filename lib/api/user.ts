import { api, ApiResponse } from '../api';

// 회원 상세 정보 타입
export interface MemberDetailInfo {
  memberNo: string;
  membership: string;
  email: string;
  birthDate: string;
  gender: 'M' | 'F';
  totalMileage: number;
}

// 회원 정보 응답 타입
export interface MemberInfoResponse {
  name: string;
  phoneNumber: string;
  role: string;
  memberDetailInfo: MemberDetailInfo;
}

// 마이페이지에서 사용할 회원 정보 타입
export interface MemberInfo {
  memberId: string;
  name: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  gender: string;
  memberGrade: string;
  mileage: number;
}

// 사용자 관련 API
export const userAPI = {
  // 내 정보 조회
  getMyInfo: async (): Promise<ApiResponse<MemberInfoResponse>> => {
    return api.get<MemberInfoResponse>('/api/v1/members/me');
  },
};

// 기존 호환성을 위한 export
export const getMyInfo = userAPI.getMyInfo;

// 마이페이지용 회원 정보 조회 함수
export const getMemberInfo = async (): Promise<MemberInfo> => {
  try {
    const response = await userAPI.getMyInfo();
    const data = response.result;
    
    if (!data) {
      throw new Error('회원 정보를 찾을 수 없습니다.');
    }
    
    // 회원 등급 매핑
    const getGradeDisplayName = (membership: string): string => {
      switch (membership) {
        case 'FAMILY':
          return '패밀리';
        case 'BUSINESS':
          return '비즈니스';
        case 'VIP':
          return 'VIP';
        case 'VVIP':
          return 'VVIP';
        default:
          return '일반';
      }
    };
    
    return {
      memberId: data.memberDetailInfo.memberNo,
      name: data.name,
      email: data.memberDetailInfo.email,
      phoneNumber: data.phoneNumber,
      birthDate: data.memberDetailInfo.birthDate,
      gender: data.memberDetailInfo.gender === 'M' ? '남성' : '여성',
      memberGrade: getGradeDisplayName(data.memberDetailInfo.membership),
      mileage: data.memberDetailInfo.totalMileage,
    };
  } catch (error) {
    console.error('회원 정보 조회 실패:', error);
    throw error;
  }
}; 