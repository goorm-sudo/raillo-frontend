// 세션스토리지 디버깅 도구
export const sessionStorageDebug = {
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    sessionStorage.setItem(key, stringValue);
    
    // console.log('세션스토리지 저장:', {
    //   key,
    //   value,
    //   stringValue,
    //   현재_세션스토리지: {
    //     ...sessionStorage
    //   }
    // });
  },
  
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    
    const value = sessionStorage.getItem(key);
    // console.log('세션스토리지 조회:', {
    //   key,
    //   value,
    //   존재여부: value !== null,
    //   현재_세션스토리지: {
    //     ...sessionStorage
    //   }
    // });
    
    return value;
  },
  
  getAll: () => {
    if (typeof window === 'undefined') return {};
    
    const all: { [key: string]: string | null } = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        all[key] = sessionStorage.getItem(key);
      }
    }
    
    // console.log('전체 세션스토리지:', all);
    return all;
  },
  
  clear: (keys?: string[]) => {
    if (typeof window === 'undefined') return;
    
    if (keys) {
      keys.forEach(key => {
        sessionStorage.removeItem(key);
        // console.log('세션스토리지 삭제:', key);
      });
    } else {
      sessionStorage.clear();
      // console.log('세션스토리지 전체 삭제');
    }
  }
};