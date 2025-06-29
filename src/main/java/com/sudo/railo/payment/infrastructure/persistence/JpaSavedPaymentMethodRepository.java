package com.sudo.railo.payment.infrastructure.persistence;

import com.sudo.railo.payment.domain.entity.PaymentMethod;
import com.sudo.railo.payment.domain.entity.SavedPaymentMethod;
import com.sudo.railo.payment.domain.repository.SavedPaymentMethodRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * JPA를 사용한 SavedPaymentMethodRepository 구현체
 */
@Repository
public interface JpaSavedPaymentMethodRepository extends JpaRepository<SavedPaymentMethod, Long>, SavedPaymentMethodRepository {
    
    /**
     * 사용자별 활성화된 저장된 결제 수단 조회
     */
    @Override
    List<SavedPaymentMethod> findByUserIdAndIsActiveTrue(String userId);
    
    /**
     * 사용자의 기본 결제 수단 조회
     */
    @Override
    Optional<SavedPaymentMethod> findByUserIdAndIsDefaultTrueAndIsActiveTrue(String userId);
    
    /**
     * 특정 결제 수단 타입으로 조회
     */
    @Override
    List<SavedPaymentMethod> findByUserIdAndPaymentMethodAndIsActiveTrue(String userId, PaymentMethod paymentMethod);
    
    /**
     * 사용자의 모든 결제 수단을 기본이 아닌 상태로 변경
     */
    @Override
    @Modifying
    @Transactional
    @Query("UPDATE SavedPaymentMethod s SET s.isDefault = false WHERE s.userId = :userId AND s.isActive = true")
    void updateAllToNonDefault(@Param("userId") String userId);
} 