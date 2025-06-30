package com.sudo.railo.payment.application.service;

import com.sudo.railo.payment.application.dto.SavedPaymentMethodRequestDto;
import com.sudo.railo.payment.application.dto.SavedPaymentMethodResponseDto;

import java.util.List;

public interface SavedPaymentMethodServiceInterface {

    /**
     * 저장된 결제수단 목록 조회
     */
    List<SavedPaymentMethodResponseDto> getSavedPaymentMethods(Long memberId);

    /**
     * 결제수단 저장
     */
    SavedPaymentMethodResponseDto savePaymentMethod(SavedPaymentMethodRequestDto requestDto);

    /**
     * 결제수단 삭제
     */
    void deletePaymentMethod(Long paymentMethodId);

    /**
     * 기본 결제수단 설정
     */
    void setDefaultPaymentMethod(Long paymentMethodId, Long memberId);
} 