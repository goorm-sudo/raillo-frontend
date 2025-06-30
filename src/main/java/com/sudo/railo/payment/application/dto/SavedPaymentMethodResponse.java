package com.sudo.railo.payment.application.dto;

import com.sudo.railo.payment.domain.entity.SavedPaymentMethod;
import lombok.Builder;
import lombok.Data;

/**
 * 저장된 결제 수단 응답 DTO
 */
@Data
@Builder
public class SavedPaymentMethodResponse {
    
    private Long id;
    private String userId;
    private String paymentMethod;
    private Boolean isDefault;
    private String alias;
    
    // 신용카드 관련 필드
    private String cardNumber; // 마스킹된 카드번호
    private String cardHolderName;
    private String expiryMonth;
    private String expiryYear;
    
    // 계좌 관련 필드
    private String bankName;
    private String accountNumber; // 마스킹된 계좌번호
    private String accountHolderName;
    
    private Boolean isActive;
    
    /**
     * 엔티티에서 DTO로 변환
     */
    public static SavedPaymentMethodResponse from(SavedPaymentMethod entity) {
        return SavedPaymentMethodResponse.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .paymentMethod(entity.getPaymentMethod().name())
                .isDefault(entity.getIsDefault())
                .alias(entity.getAlias())
                .cardNumber(entity.getCardNumber())
                .cardHolderName(entity.getCardHolderName())
                .expiryMonth(entity.getExpiryMonth())
                .expiryYear(entity.getExpiryYear())
                .bankName(entity.getBankName())
                .accountNumber(entity.getAccountNumber())
                .accountHolderName(entity.getAccountHolderName())
                .isActive(entity.getIsActive())
                .build();
    }
} 