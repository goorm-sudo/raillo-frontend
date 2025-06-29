// 회원가입 폼 데이터 타입
export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  birthDate: string;
  gender: string;
}

// 약관 동의 타입
export interface Agreements {
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
}

// 유효성 검사 에러 타입
export interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: string;
  terms?: string;
  privacy?: string;
}

// 회원가입 유효성 검사 함수
export const validateSignupForm = (
  formData: SignupFormData,
  agreements: Agreements
): ValidationErrors => {
  const errors: ValidationErrors = {}

  // 이름 검사
  if (!formData.name.trim()) {
    errors.name = "이름은 필수입니다."
  }

  // 전화번호 검사 (하이픈 제거 후 11자리 숫자만)
  const phoneNumbersOnly = formData.phoneNumber.replace(/[^0-9]/g, '')
  if (!phoneNumbersOnly) {
    errors.phoneNumber = "전화번호는 필수입니다."
  } else if (phoneNumbersOnly.length !== 11) {
    errors.phoneNumber = "전화번호는 11자리 숫자여야 합니다."
  }

  // 비밀번호 검사
  if (!formData.password) {
    errors.password = "비밀번호는 필수입니다."
  } else if (formData.password.length < 8) {
    errors.password = "비밀번호는 8자 이상이어야 합니다."
  }

  // 비밀번호 확인 검사
  if (!formData.confirmPassword) {
    errors.confirmPassword = "비밀번호 확인은 필수입니다."
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "비밀번호가 일치하지 않습니다."
  }

  // 이메일 검사
  if (!formData.email) {
    errors.email = "이메일은 필수입니다."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "올바른 이메일 형식이 아닙니다."
  }

  // 생년월일 검사 (YYYY-MM-DD 형식)
  if (!formData.birthDate) {
    errors.birthDate = "생년월일은 필수입니다."
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.birthDate)) {
    errors.birthDate = "생년월일은 YYYY-MM-DD 형식으로 입력해야 합니다."
  }

  // 성별 검사 (M 또는 W)
  if (!formData.gender) {
    errors.gender = "성별은 필수입니다."
  } else if (!/^[MW]$/.test(formData.gender)) {
    errors.gender = "성별을 선택해주세요."
  }

  // 약관 동의 검사
  if (!agreements.terms) {
    errors.terms = "이용약관에 동의해주세요."
  }
  if (!agreements.privacy) {
    errors.privacy = "개인정보 수집 및 이용에 동의해주세요."
  }

  return errors
}

// 휴대폰 번호에 하이픈 추가하는 함수 (최적화)
export const formatPhoneNumber = (value: string): string => {
  // 숫자만 추출
  const numbers = value.replace(/\D/g, '')
  
  // 11자리 제한
  if (numbers.length > 11) {
    const limitedNumbers = numbers.slice(0, 11)
    
    // 하이픈 추가
    if (limitedNumbers.length <= 3) {
      return limitedNumbers
    } else if (limitedNumbers.length <= 7) {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`
    } else {
      return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`
    }
  }
  
  // 11자리 이하인 경우
  if (numbers.length <= 3) {
    return numbers
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  } else {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`
  }
}

// 휴대폰 번호에서 하이픈 제거하는 함수
export const removePhoneNumberFormatting = (phoneNumber: string): string => {
  return phoneNumber.replace(/[^0-9]/g, '')
} 