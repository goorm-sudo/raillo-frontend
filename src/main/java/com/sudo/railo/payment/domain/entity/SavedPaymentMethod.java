package com.sudo.railo.payment.domain.entity;

import com.sudo.railo.global.domain.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 저장된 결제 수단 엔티티
 * 사용자가 결제 시 "결제 수단 저장" 체크박스를 선택했을 때 저장되는 정보
 */
@Entity
@Table(name = "saved_payment_methods")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SavedPaymentMethod extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "saved_payment_method_id")
    private Long id;

    /**
     * 사용자 ID (회원/비회원 구분)
     * 비회원의 경우 "guest_user" 등의 임시 값 사용
     */
    @Column(name = "user_id", nullable = false, length = 100)
    private String userId;

    /**
     * 결제 방법 타입
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 50)
    private PaymentMethod paymentMethod;

    /**
     * 기본 결제 수단 여부
     */
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;

    /**
     * 결제 수단 별칭 (사용자가 지정)
     */
    @Column(name = "alias", length = 100)
    private String alias;

    // 신용카드 관련 필드
    @Column(name = "card_number", length = 20)
    private String cardNumber; // 마스킹된 카드번호 (예: ****-****-****-1234)

    @Column(name = "card_holder_name", length = 100)
    private String cardHolderName;

    @Column(name = "expiry_month", length = 2)
    private String expiryMonth;

    @Column(name = "expiry_year", length = 4)
    private String expiryYear;

    // 계좌 관련 필드
    @Column(name = "bank_name", length = 50)
    private String bankName;

    @Column(name = "account_number", length = 50)
    private String accountNumber; // 마스킹된 계좌번호

    @Column(name = "account_holder_name", length = 100)
    private String accountHolderName;

    /**
     * 활성화 상태
     */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Builder
    public SavedPaymentMethod(String userId, PaymentMethod paymentMethod, Boolean isDefault, 
                             String alias, String cardNumber, String cardHolderName, 
                             String expiryMonth, String expiryYear, String bankName, 
                             String accountNumber, String accountHolderName) {
        this.userId = userId;
        this.paymentMethod = paymentMethod;
        this.isDefault = isDefault != null ? isDefault : false;
        this.alias = alias;
        this.cardNumber = cardNumber;
        this.cardHolderName = cardHolderName;
        this.expiryMonth = expiryMonth;
        this.expiryYear = expiryYear;
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.accountHolderName = accountHolderName;
        this.isActive = true;
    }

    /**
     * 카드번호 마스킹 처리
     */
    public static String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 4) {
            return cardNumber;
        }
        String cleanNumber = cardNumber.replaceAll("[^0-9]", "");
        if (cleanNumber.length() < 4) {
            return cardNumber;
        }
        return "****-****-****-" + cleanNumber.substring(cleanNumber.length() - 4);
    }

    /**
     * 계좌번호 마스킹 처리
     */
    public static String maskAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.length() < 4) {
            return accountNumber;
        }
        String cleanNumber = accountNumber.replaceAll("[^0-9]", "");
        if (cleanNumber.length() < 4) {
            return accountNumber;
        }
        return cleanNumber.substring(0, 6) + "-**-" + cleanNumber.substring(cleanNumber.length() - 4);
    }

    /**
     * 기본 결제 수단으로 설정
     */
    public void setAsDefault() {
        this.isDefault = true;
    }

    /**
     * 기본 결제 수단 해제
     */
    public void unsetAsDefault() {
        this.isDefault = false;
    }

    /**
     * 결제 수단 비활성화
     */
    public void deactivate() {
        this.isActive = false;
    }
} 