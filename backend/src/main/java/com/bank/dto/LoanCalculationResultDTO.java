package com.bank.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record LoanCalculationResultDTO(
        String strategyType,
        BigDecimal assetPrice,
        BigDecimal totalPrice,
        BigDecimal monthlyPayment,
        BigDecimal totalPayment,
        BigDecimal totalProfit,
        BigDecimal totalInterest,
        BigDecimal effectiveRate,
        int termMonths,
        String purpose,
        Instant calculatedAt
) {}
