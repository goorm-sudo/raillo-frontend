package com.sudo.railo.payment.presentation.controller;

import com.sudo.railo.payment.application.dto.SavedPaymentMethodRequestDto;
import com.sudo.railo.payment.application.dto.SavedPaymentMethodResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/saved-payment-methods")
@CrossOrigin(origins = "*")
public class SavedPaymentMethodController {

    /**
     * 저장된 결제수단 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<SavedPaymentMethodResponseDto>> getSavedPaymentMethods(
            @RequestParam Long memberId) {
        
        System.out.println("저장된 결제수단 목록 조회 요청 - memberId: " + memberId);
        
        // Mock 데이터 생성 (실제로는 DB에서 조회)
        List<SavedPaymentMethodResponseDto> mockData = new ArrayList<>();
        
        // Mock 신용카드 데이터
        SavedPaymentMethodResponseDto creditCard = new SavedPaymentMethodResponseDto();
        creditCard.setId(1L);
        creditCard.setMemberId(memberId);
        creditCard.setPaymentMethodType("CREDIT_CARD");
        creditCard.setAlias("내 신용카드");
        creditCard.setCardNumber("1234567890123456");
        creditCard.setCardHolderName("홍길동");
        creditCard.setCardExpiryMonth("12");
        creditCard.setCardExpiryYear("2025");
        creditCard.setIsDefault(true);
        creditCard.setCreatedAt(LocalDateTime.now());
        mockData.add(creditCard);
        
        // Mock 계좌 데이터
        SavedPaymentMethodResponseDto bankAccount = new SavedPaymentMethodResponseDto();
        bankAccount.setId(2L);
        bankAccount.setMemberId(memberId);
        bankAccount.setPaymentMethodType("BANK_ACCOUNT");
        bankAccount.setAlias("내 통장");
        bankAccount.setBankCode("004");
        bankAccount.setAccountNumber("1234567890");
        bankAccount.setAccountHolderName("홍길동");
        bankAccount.setIsDefault(false);
        bankAccount.setCreatedAt(LocalDateTime.now());
        mockData.add(bankAccount);
        
        return ResponseEntity.ok(mockData);
    }

    /**
     * 결제수단 저장
     */
    @PostMapping
    public ResponseEntity<SavedPaymentMethodResponseDto> savePaymentMethod(
            @RequestBody SavedPaymentMethodRequestDto request) {
        
        System.out.println("결제수단 저장 요청: " + request);
        
        // Mock 응답 생성
        SavedPaymentMethodResponseDto response = new SavedPaymentMethodResponseDto();
        response.setId(System.currentTimeMillis()); // Mock ID
        response.setMemberId(request.getMemberId());
        response.setPaymentMethodType(request.getPaymentMethodType());
        response.setAlias(request.getAlias());
        
        if ("CREDIT_CARD".equals(request.getPaymentMethodType())) {
            response.setCardNumber(request.getCardNumber());
            response.setCardHolderName(request.getCardHolderName());
            response.setCardExpiryMonth(request.getCardExpiryMonth());
            response.setCardExpiryYear(request.getCardExpiryYear());
            // CVC는 보안상 응답에 포함하지 않음
        } else if ("BANK_ACCOUNT".equals(request.getPaymentMethodType())) {
            response.setBankCode(request.getBankCode());
            response.setAccountNumber(request.getAccountNumber());
            response.setAccountHolderName(request.getAccountHolderName());
            // 계좌 비밀번호는 보안상 응답에 포함하지 않음
        }
        
        response.setIsDefault(request.getIsDefault());
        response.setCreatedAt(LocalDateTime.now());
        
        System.out.println("결제수단 저장 완료: " + response.getId());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 결제수단 삭제
     */
    @DeleteMapping("/{paymentMethodId}")
    public ResponseEntity<Void> deletePaymentMethod(@PathVariable Long paymentMethodId) {
        
        System.out.println("결제수단 삭제 요청 - paymentMethodId: " + paymentMethodId);
        
        // Mock 삭제 처리
        System.out.println("결제수단 삭제 완료: " + paymentMethodId);
        
        return ResponseEntity.ok().build();
    }

    /**
     * 기본 결제수단 설정
     */
    @PutMapping("/{paymentMethodId}/default")
    public ResponseEntity<Void> setDefaultPaymentMethod(
            @PathVariable Long paymentMethodId,
            @RequestParam Long memberId) {
        
        System.out.println("기본 결제수단 설정 요청 - paymentMethodId: " + paymentMethodId + ", memberId: " + memberId);
        
        // Mock 기본 설정 처리
        System.out.println("기본 결제수단 설정 완료: " + paymentMethodId);
        
        return ResponseEntity.ok().build();
    }
} 