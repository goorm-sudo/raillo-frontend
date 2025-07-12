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
  },

  // 강화된 토큰 완전 정리 함수
  clearAllTokens: () => {
    if (typeof window !== 'undefined') {
      // 모든 토큰 완전 정리 시작
      
      // 기본 토큰들 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiresIn');
      
      // 추가로 token이 포함된 모든 키 제거
      Object.keys(localStorage).forEach(key => {
        if (key.toLowerCase().includes('token')) {
          localStorage.removeItem(key);
          // 제거된 토큰
        }
      });
      
      // 모든 토큰 정리 완료
    }
  },

  // JWT 토큰 자동 갱신 함수
  refreshAccessToken: async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      // Refresh Token이 없습니다
      return false;
    }

    try {
      // 토큰 자동 갱신 시작
      
      // 동적 import로 순환 참조 방지
      const { authAPI } = await import('@/lib/api/auth');
      
      const response = await fetch('http://localhost:8080/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.result) {
          // 새 토큰들 저장
          tokenManager.setLoginTokens(
            data.result.accessToken,
            data.result.refreshToken || refreshToken, // 새 refresh token이 없으면 기존 것 유지
            data.result.accessTokenExpiresIn
          );
          
          // 토큰 자동 갱신 성공
          return true;
        }
      }
      
      // 토큰 갱신 실패 - 응답 오류
      return false;
      
    } catch (error) {
      // 토큰 갱신 중 에러
      return false;
    }
  },

  // 토큰 만료 5분 전 자동 갱신 스케줄러
  startAutoRefreshScheduler: () => {
    if (typeof window === 'undefined') return;
    
    // 기존 스케줄러가 있으면 정리
    if ((window as any).tokenRefreshTimer) {
      clearInterval((window as any).tokenRefreshTimer);
    }
    
    (window as any).tokenRefreshTimer = setInterval(async () => {
      const expiresIn = localStorage.getItem('tokenExpiresIn');
      
      if (expiresIn) {
        const expirationTime = parseInt(expiresIn);
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;
        
        // 만료 5분(300,000ms) 전에 자동 갱신
        if (timeUntilExpiry <= 300000 && timeUntilExpiry > 0) {
          // 토큰 만료 5분 전 - 자동 갱신 시도
          const renewed = await tokenManager.refreshAccessToken();
          
          if (!renewed) {
            // 자동 갱신 실패 - 로그아웃 처리
            handleSessionExpiry();
          }
        }
      }
    }, 60000); // 1분마다 체크
    
    // 토큰 자동 갱신 스케줄러 시작
  },

  // 토큰 자동 갱신 스케줄러 정지
  stopAutoRefreshScheduler: () => {
    if (typeof window !== 'undefined' && (window as any).tokenRefreshTimer) {
      clearInterval((window as any).tokenRefreshTimer);
      (window as any).tokenRefreshTimer = null;
      // 토큰 자동 갱신 스케줄러 정지
    }
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
        // 토큰이 만료되었으면 제거
        tokenManager.clearAllTokens();
        return false;
      }

      return true;
    }
    return false;
  },

  // 로그인 성공 시 토큰들을 저장하고 자동 갱신 스케줄러 시작
  setLoginTokens: (accessToken: string, refreshToken: string, expiresIn: number) => {
    if (typeof window !== 'undefined') {
      // 기존 토큰 완전 정리 후 새 토큰 저장
      tokenManager.clearAllTokens();
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tokenExpiresIn', expiresIn.toString());
      
      // 새 토큰 저장 완료
      
      // 자동 갱신 스케줄러 시작
      tokenManager.startAutoRefreshScheduler();
    }
  },

  // refreshToken 가져오기
  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },
};

// 전역 로그아웃 함수 (자동 갱신 스케줄러도 정지)
export const globalLogout = (message: string = '로그아웃되었습니다.') => {
  // 전역 로그아웃 시작
  
  // 자동 갱신 스케줄러 정지
  tokenManager.stopAutoRefreshScheduler();
  
  // 모든 토큰 완전 정리
  tokenManager.clearAllTokens();
  
  // 사용자에게 알림 후 로그인 페이지로 이동
  setTimeout(() => {
    alert(message);
    window.location.href = '/login';
  }, 100);
  
  // 전역 로그아웃 완료
};

// 세션 만료 처리 함수 (토큰 갱신 시도 후 실패 시에만 로그아웃)
export const handleSessionExpiry = async () => {
  // 세션 만료 감지 - 토큰 갱신 시도
  
  const renewed = await tokenManager.refreshAccessToken();
  
  if (renewed) {
    // 토큰 갱신 성공 - 세션 유지
    return true;
  } else {
    // 토큰 갱신 실패 - 로그아웃 처리
    globalLogout('세션이 만료되었습니다. 다시 로그인해주세요.');
    return false;
  }
};

// 토큰 유효성 검사 함수
export const validateToken = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    // 토큰이 없습니다
    return false;
  }

  try {
    // JWT 토큰 기본 검증
    const tokenParts = accessToken.split('.');
    if (tokenParts.length !== 3) {
      throw new Error('잘못된 토큰 형식');
    }
    
    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // 토큰 검증
    
    if (payload.exp && payload.exp < currentTime) {
      // 토큰이 만료되었습니다
      handleSessionExpiry();
      return false;
    }
    
    return true;
    
  } catch (error) {
    // 토큰 검증 에러
    handleSessionExpiry();
    return false;
  }
}; 