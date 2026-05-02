package com.bank.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record RedeemResponseDTO(
        UUID accountId,
        int redeemedPoints,
        BigDecimal creditedAmount,
        BigDecimal newBalance,
        int remainingPoints
) {}
