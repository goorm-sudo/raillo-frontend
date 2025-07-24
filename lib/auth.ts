import { authAPI } from './api/auth';

// 토큰 갱신 중복 요청 방지를 위한 플래그
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// 토큰 만료 알림 상태 관리
let isShowingExpirationAlert = false;

// 토큰 갱신 시도 여부 관리 (무한 루프 방지)
let hasAttemptedRefresh = false;

// 쿠키 유틸리티 함수들
const cookieUtils = {
  deleteCookie: (name: string) => {
    if (typeof document !== 'undefined') {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure`;
    }
  }
};

// 토큰 관리 함수들
export const tokenManager = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('accessToken', token);
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('accessToken');
    }
    return null;
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('tokenExpiresIn');
      // HttpOnly 쿠키 삭제는 백엔드에서 처리되어야 하지만, 클라이언트에서도 시도
      cookieUtils.deleteCookie('refreshToken');
    }
    // 토큰 제거 시 갱신 시도 플래그도 리셋
    hasAttemptedRefresh = false;
  },

  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('accessToken');
      const expiresIn = sessionStorage.getItem('tokenExpiresIn');
      
      if (!token || !expiresIn) {
        return false;
      }

      // 토큰 만료 시간 확인
      const expirationTime = parseInt(expiresIn);
      const currentTime = Date.now();
      
      // 토큰이 아직 유효하면 true 반환
      if (currentTime < expirationTime) {
        return true;
      }
      
      // 토큰이 만료된 경우 false 반환 (갱신은 API 요청에서 처리)
      return false;
    }
    return false;
  },

  // 로그인 성공 시 accessToken만 클라이언트에서 저장 (refreshToken은 백엔드에서 HttpOnly 쿠키로 설정)
  setLoginTokens: (accessToken: string, expiresIn: number) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('tokenExpiresIn', expiresIn.toString());
    }
    // 로그인 시 갱신 시도 플래그 리셋
    hasAttemptedRefresh = false;
  },

  // 페이지 로드 시 토큰 상태 확인 및 자동 갱신
  initializeAuth: async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    const token = sessionStorage.getItem('accessToken');
    const expiresIn = sessionStorage.getItem('tokenExpiresIn');
    
    // 토큰이 있고 유효하면 true 반환
    if (token && expiresIn) {
      const expirationTime = parseInt(expiresIn);
      const currentTime = Date.now();
      
      if (currentTime < expirationTime) {
        return true;
      }
    }
    
    // HttpOnly 쿠키는 JavaScript로 접근 불가하므로 reissue API 호출로 판단
    // 처음 접속한 사용자나 로그아웃한 사용자는 401 응답을 받게 됨
    try {
      const refreshSuccess = await tokenManager.refreshToken();
      return refreshSuccess;
    } catch (error) {
      // refreshToken이 없거나 만료된 경우 또는 처음 접속자
      return false;
    }
  },

  // HttpOnly refreshToken 존재 여부 확인 (API 호출로 처리)
  hasRefreshToken: async (): Promise<boolean> => {
    try {
      // /reissue 엔드포인트로 테스트 요청
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/reissue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      // 401이 아니면 refreshToken이 있다고 가정
      return response.status !== 401;
    } catch (error) {
      return false;
    }
  },

  // 토큰 만료 시 사용자에게 알림
  handleTokenExpiration: async (): Promise<boolean> => {
    if (isShowingExpirationAlert) {
      return false;
    }

    isShowingExpirationAlert = true;

    try {
      // 자동으로 토큰 갱신 시도
      const refreshSuccess = await tokenManager.refreshToken();
      if (refreshSuccess) {
        console.log('✅ 자동 토큰 갱신 성공');
        return true;
      } else {
        // 토큰 갱신 실패 시 사용자에게 알림
        const shouldLogin = window.confirm(
          '로그인 세션이 만료되었습니다.\n\n' +
          '로그인 페이지로 이동하시겠습니까?'
        );
        
        if (shouldLogin) {
          tokenManager.logout();
        }
        return false;
      }
    } finally {
      isShowingExpirationAlert = false;
    }
  },

  // 로그아웃 처리
  logout: () => {
    tokenManager.removeToken();
    
    // 로그인 페이지로 리다이렉트
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  // 토큰 갱신
  refreshToken: async (): Promise<boolean> => {
    // 이미 갱신 중이면 기존 Promise 반환
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    // 갱신 시도 플래그 설정
    hasAttemptedRefresh = true;

    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        // /reissue API 호출로 토큰 갱신
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/reissue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // HttpOnly 쿠키 포함
        });

        if (!response.ok) {
          // 401이면 refreshToken이 없거나 만료됨 (정상적인 상황)
          if (response.status === 401) {
            tokenManager.removeToken();
          }
          console.log(`토큰 갱신 불가: ${response.status} (정상적인 상황일 수 있음)`);
          return false;
        }

        const data = await response.json();
        
        if (data.result) {
          const { accessToken, accessTokenExpiresIn } = data.result;
          
          // 새로운 accessToken 저장
          tokenManager.setToken(accessToken);
          sessionStorage.setItem('tokenExpiresIn', accessTokenExpiresIn.toString());
          
          // 갱신 성공 시 플래그 리셋
          hasAttemptedRefresh = false;
          
          console.log('✅ 토큰 갱신 성공');
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('❌ 토큰 갱신 실패:', error);
        // 갱신 실패 시 토큰 제거
        tokenManager.removeToken();
        return false;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },
}; 