/**
 * 중앙화된 에러 처리 유틸리티
 */

export interface ErrorResponse {
  timestamp?: string
  errorCode?: string
  errorMessage?: string
  details?: any
}

/**
 * 에러 객체에서 사용자에게 표시할 메시지를 추출합니다.
 * @param error - 에러 객체
 * @param defaultMessage - 기본 에러 메시지
 * @returns 사용자에게 표시할 에러 메시지
 */
export const extractErrorMessage = (error: any, defaultMessage: string = '오류가 발생했습니다.'): string => {
  console.error('Error details:', error)
  
  // 1. 직접 에러 객체에 errorMessage가 있는 경우 (제공된 형식)
  if (error?.errorMessage) {
    return error.errorMessage
  }
  
  // 2. response.data에 errorMessage가 있는 경우
  if (error?.response?.data?.errorMessage) {
    return error.response.data.errorMessage
  }
  
  // 3. response.data에 message가 있는 경우
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  
  // 4. 일반적인 에러 메시지
  if (error?.message) {
    return error.message
  }
  
  // 5. 기본 메시지
  return defaultMessage
}

/**
 * 에러를 처리하고 사용자에게 알림을 표시합니다.
 * @param error - 에러 객체
 * @param defaultMessage - 기본 에러 메시지
 * @param showAlert - alert 표시 여부 (기본값: true)
 * @returns 추출된 에러 메시지
 */
export const handleError = (
  error: any, 
  defaultMessage: string = '오류가 발생했습니다.',
  showAlert: boolean = true
): string => {
  const message = extractErrorMessage(error, defaultMessage)
  
  if (showAlert) {
    alert(message)
  }
  
  return message
}

/**
 * API 호출을 래핑하여 에러 처리를 자동화하는 함수
 * @param apiCall - API 호출 함수
 * @param defaultMessage - 기본 에러 메시지
 * @param showAlert - alert 표시 여부
 * @returns API 호출 결과 또는 null (에러 시)
 */
export const withErrorHandling = async <T>(
  apiCall: () => Promise<T>,
  defaultMessage: string = '오류가 발생했습니다.',
  showAlert: boolean = true
): Promise<T | null> => {
  try {
    return await apiCall()
  } catch (error) {
    handleError(error, defaultMessage, showAlert)
    return null
  }
} 