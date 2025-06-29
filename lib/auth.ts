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
    }
  },

  isAuthenticated: (): boolean => {
    return !!tokenManager.getToken();
  },
}; 