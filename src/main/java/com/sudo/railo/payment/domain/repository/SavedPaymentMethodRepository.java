package com.sudo.railo.payment.domain.repository;

import com.sudo.railo.payment.domain.entity.PaymentMethod;
import com.sudo.railo.payment.domain.entity.SavedPaymentMethod;

import java.util.List;
import java.util.Optional;

/**
 * 저장된 결제 수단 Repository 인터페이스
 */
public interface SavedPaymentMethodRepository {
    
    /**
     * 결제 수단 저장
     */
    SavedPaymentMethod save(SavedPaymentMethod savedPaymentMethod);
    
    /**
     * 사용자별 저장된 결제 수단 조회
     */
    List<SavedPaymentMethod> findByUserIdAndIsActiveTrue(String userId);
    
    /**
     * 사용자의 기본 결제 수단 조회
     */
    Optional<SavedPaymentMethod> findByUserIdAndIsDefaultTrueAndIsActiveTrue(String userId);
    
    /**
     * 특정 결제 수단 타입으로 조회
     */
    List<SavedPaymentMethod> findByUserIdAndPaymentMethodAndIsActiveTrue(String userId, PaymentMethod paymentMethod);
    
    /**
     * ID로 조회
     */
    Optional<SavedPaymentMethod> findById(Long id);
    
    /**
     * 사용자의 모든 결제 수단을 기본이 아닌 상태로 변경
     */
    void updateAllToNonDefault(String userId);
} 