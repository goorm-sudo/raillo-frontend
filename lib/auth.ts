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
        tokenManager.removeToken();
        return false;
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
  },

  // refreshToken 가져오기
  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },
}; 