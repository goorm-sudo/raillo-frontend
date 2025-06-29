package com.sudo.railo.payment.application.dto;

import lombok.Data;

/**
 * 결제 수단 저장 요청 DTO
 */
@Data
public class SavePaymentMethodRequest {
    
    private String userId;
    private String paymentMethod;
    private Boolean isDefault = false;
    private String alias;
    
    // 신용카드 관련 필드
    private String cardNumber;
    private String cardHolderName;
    private String expiryMonth;
    private String expiryYear;
    
    // 계좌 관련 필드
    private String bankName;
    private String accountNumber;
    private String accountHolderName;
} 