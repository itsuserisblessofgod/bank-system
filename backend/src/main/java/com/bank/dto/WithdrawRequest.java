package com.bank.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record WithdrawRequest(
        @NotNull UUID accountId,
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount
) {}
