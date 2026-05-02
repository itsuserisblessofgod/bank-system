package com.bank.dto;

import com.bank.model.LoanApplication;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record LoanApplicationResponseDTO(
        UUID id,
        String strategyType,
        BigDecimal assetPrice,
        BigDecimal totalPrice,
        BigDecimal monthlyPayment,
        int termMonths,
        String purpose,
        String status,
        Instant createdAt
) {
    public static LoanApplicationResponseDTO from(LoanApplication l) {
        return new LoanApplicationResponseDTO(
                l.getId(),
                l.getStrategyType(),
                l.getAssetPrice(),
                l.getTotalPrice(),
                l.getMonthlyPayment(),
                l.getTermMonths(),
                l.getPurpose(),
                l.getStatus(),
                l.getCreatedAt()
        );
    }
}
