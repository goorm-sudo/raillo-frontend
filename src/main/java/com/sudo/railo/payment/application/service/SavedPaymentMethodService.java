package com.sudo.railo.payment.application.service;

import com.sudo.railo.payment.application.dto.SavePaymentMethodRequest;
import com.sudo.railo.payment.application.dto.SavedPaymentMethodResponse;
import com.sudo.railo.payment.domain.entity.PaymentMethod;
import com.sudo.railo.payment.domain.entity.SavedPaymentMethod;
import com.sudo.railo.payment.domain.repository.SavedPaymentMethodRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.sudo.railo.payment.application.dto.SavedPaymentMethodRequestDto;
import com.sudo.railo.payment.application.dto.SavedPaymentMethodResponseDto;

/**
 * 저장된 결제 수단 관리 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SavedPaymentMethodService {

    private final SavedPaymentMethodRepository savedPaymentMethodRepository;

    /**
     * 결제 수단 저장
     */
    @Transactional
    public SavedPaymentMethodResponse savePaymentMethod(SavePaymentMethodRequest request) {
        log.info("결제 수단 저장 요청: userId={}, paymentMethod={}", request.getUserId(), request.getPaymentMethod());

        // 기본 결제 수단으로 설정하는 경우, 기존 기본 결제 수단 해제
        if (request.getIsDefault()) {
            savedPaymentMethodRepository.updateAllToNonDefault(request.getUserId());
        }

        // 결제 수단 생성
        SavedPaymentMethod savedPaymentMethod = createSavedPaymentMethod(request);
        
        // 저장
        SavedPaymentMethod saved = savedPaymentMethodRepository.save(savedPaymentMethod);
        
        log.info("결제 수단 저장 완료: id={}, userId={}", saved.getId(), saved.getUserId());
        
        return SavedPaymentMethodResponse.from(saved);
    }

    /**
     * 사용자의 저장된 결제 수단 목록 조회
     */
    public List<SavedPaymentMethodResponse> getUserPaymentMethods(String userId) {
        log.debug("사용자 결제 수단 조회: userId={}", userId);
        
        List<SavedPaymentMethod> paymentMethods = savedPaymentMethodRepository.findByUserIdAndIsActiveTrue(userId);
        
        return paymentMethods.stream()
                .map(SavedPaymentMethodResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 기본 결제 수단 조회
     */
    public SavedPaymentMethodResponse getDefaultPaymentMethod(String userId) {
        return savedPaymentMethodRepository.findByUserIdAndIsDefaultTrueAndIsActiveTrue(userId)
                .map(SavedPaymentMethodResponse::from)
                .orElse(null);
    }

    /**
     * 결제 수단 삭제 (비활성화)
     */
    @Transactional
    public void deletePaymentMethod(Long paymentMethodId, String userId) {
        SavedPaymentMethod paymentMethod = savedPaymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new IllegalArgumentException("결제 수단을 찾을 수 없습니다: " + paymentMethodId));

        if (!paymentMethod.getUserId().equals(userId)) {
            throw new IllegalArgumentException("권한이 없습니다.");
        }

        paymentMethod.deactivate();
        savedPaymentMethodRepository.save(paymentMethod);
        
        log.info("결제 수단 삭제 완료: id={}, userId={}", paymentMethodId, userId);
    }

    /**
     * SavedPaymentMethod 엔티티 생성
     */
    private SavedPaymentMethod createSavedPaymentMethod(SavePaymentMethodRequest request) {
        SavedPaymentMethod.SavedPaymentMethodBuilder builder = SavedPaymentMethod.builder()
                .userId(request.getUserId())
                .paymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()))
                .isDefault(request.getIsDefault())
                .alias(request.getAlias());

        // 신용카드인 경우
        if ("CREDIT_CARD".equals(request.getPaymentMethod())) {
            builder.cardNumber(SavedPaymentMethod.maskCardNumber(request.getCardNumber()))
                    .cardHolderName(request.getCardHolderName())
                    .expiryMonth(request.getExpiryMonth())
                    .expiryYear(request.getExpiryYear());
        }
        
        // 계좌인 경우
        if ("BANK_ACCOUNT".equals(request.getPaymentMethod())) {
            builder.bankName(request.getBankName())
                    .accountNumber(SavedPaymentMethod.maskAccountNumber(request.getAccountNumber()))
                    .accountHolderName(request.getAccountHolderName());
        }

        return builder.build();
    }

    /**
     * 저장된 결제수단 목록 조회
     */
    public List<SavedPaymentMethodResponseDto> getSavedPaymentMethods(Long memberId) {
        // Implementation needed
        throw new UnsupportedOperationException("Method not implemented");
    }

    /**
     * 결제수단 저장
     */
    public SavedPaymentMethodResponseDto savePaymentMethod(SavedPaymentMethodRequestDto requestDto) {
        // Implementation needed
        throw new UnsupportedOperationException("Method not implemented");
    }

    /**
     * 결제수단 삭제
     */
    public void deletePaymentMethod(Long paymentMethodId) {
        // Implementation needed
        throw new UnsupportedOperationException("Method not implemented");
    }

    /**
     * 기본 결제수단 설정
     */
    public void setDefaultPaymentMethod(Long paymentMethodId, Long memberId) {
        // Implementation needed
        throw new UnsupportedOperationException("Method not implemented");
    }
} 