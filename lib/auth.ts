import { authAPI } from './api/auth';

// 토큰 갱신 중복 요청 방지를 위한 플래그
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// 토큰 만료 알림 상태 관리
let isShowingExpirationAlert = false;

// 토큰 갱신 시도 여부 관리 (무한 루프 방지)
let hasAttemptedRefresh = false;

// 토큰 관리 함수들
export const tokenManager = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiresIn');
    }
    // 토큰 제거 시 갱신 시도 플래그도 리셋
    hasAttemptedRefresh = false;
  },

  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const expiresIn = localStorage.getItem('tokenExpiresIn');
      
      if (!token || !expiresIn) {
        return false;
      }

      // 토큰 만료 시간 확인
      const expirationTime = parseInt(expiresIn);
      const currentTime = Date.now();
      
      if (currentTime >= expirationTime) {
        // 토큰이 만료되었지만 refreshToken이 있으면 갱신 가능하다고 판단
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          return true; // refreshToken이 있으면 갱신 가능하므로 true 반환
        } else {
          // refreshToken이 없으면 완전히 제거
          tokenManager.removeToken();
          return false;
        }
      }

      return true;
    }
    return false;
  },

  // 로그인 성공 시 토큰들을 저장
  setLoginTokens: (accessToken: string, refreshToken: string, expiresIn: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tokenExpiresIn', expiresIn.toString());
    }
    // 로그인 시 갱신 시도 플래그 리셋
    hasAttemptedRefresh = false;
  },

  // refreshToken 가져오기
  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },

  // 토큰 만료 시 사용자에게 알림
  handleTokenExpiration: async (): Promise<boolean> => {
    if (isShowingExpirationAlert) {
      return false;
    }

    isShowingExpirationAlert = true;

    try {
      // 사용자에게 토큰 갱신 여부 확인
      const shouldRefresh = window.confirm(
        '로그인 세션이 만료되었습니다.\n\n' +
        '계속 사용하시려면 "확인"을, 로그아웃하시려면 "취소"를 눌러주세요.'
      );

      if (shouldRefresh) {
        // 토큰 갱신 시도
        const refreshSuccess = await tokenManager.refreshToken();
        if (refreshSuccess) {
          console.log('✅ 사용자 요청으로 토큰 갱신 성공');
          return true;
        } else {
          // 토큰 갱신 실패 시 로그아웃
          alert('토큰 갱신에 실패했습니다. 다시 로그인해주세요.');
          tokenManager.logout();
          return false;
        }
      } else {
        // 사용자가 취소한 경우 로그아웃
        console.log('사용자가 토큰 갱신을 취소했습니다.');
        tokenManager.logout();
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

    // refreshToken이 없으면 갱신 불가
    const refreshToken = tokenManager.getRefreshToken();
    if (!refreshToken) {
      return false;
    }

    // 갱신 시도 플래그 설정
    hasAttemptedRefresh = true;

    isRefreshing = true;
    refreshPromise = (async () => {
      try {
        // refreshToken을 Authorization 헤더에 포함하여 요청
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/reissue`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`토큰 갱신 실패: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result) {
          const { accessToken, accessTokenExpiresIn } = data.result;
          
          // 새로운 토큰 저장
          tokenManager.setToken(accessToken);
          localStorage.setItem('tokenExpiresIn', accessTokenExpiresIn.toString());
          
          // 갱신 성공 시 플래그 리셋
          hasAttemptedRefresh = false;
          
          console.log('✅ 토큰 갱신 성공');
          return true;
        }
        
        return false;
      } catch (error) {
        console.error('❌ 토큰 갱신 실패:', error);
        return false;
      } finally {
        isRefreshing = false;
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  },
}; 