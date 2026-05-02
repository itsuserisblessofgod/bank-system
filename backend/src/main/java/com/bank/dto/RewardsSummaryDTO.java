package com.bank.dto;

import java.math.BigDecimal;
import java.util.List;

public record RewardsSummaryDTO(
        int totalPoints,
        String cardTier,
        BigDecimal cashbackRate,
        int pointsToNextTier,
        BigDecimal totalEarned,
        List<RewardTransactionDTO> recentTransactions
) {}
