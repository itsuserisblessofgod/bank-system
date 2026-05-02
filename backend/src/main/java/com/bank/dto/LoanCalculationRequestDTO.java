package com.bank.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record LoanCalculationRequestDTO(
        @NotBlank String strategyType,
        @DecimalMin(value = "0.01", message = "assetPrice must be > 0") BigDecimal assetPrice,
        BigDecimal profitMargin,
        BigDecimal annualRate,
        BigDecimal residualValue,
        @Min(value = 1, message = "termMonths must be >= 1") int termMonths,
        String purpose
) {}
