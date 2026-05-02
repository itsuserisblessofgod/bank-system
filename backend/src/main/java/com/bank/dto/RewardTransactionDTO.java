package com.bank.dto;

import com.bank.model.RewardTransaction;

import java.time.Instant;
import java.util.UUID;

public record RewardTransactionDTO(
        UUID id,
        int points,
        String type,
        String description,
        Instant createdAt
) {
    public static RewardTransactionDTO from(RewardTransaction rt) {
        return new RewardTransactionDTO(
                rt.getId(),
                rt.getPoints(),
                rt.getType().name(),
                rt.getDescription(),
                rt.getCreatedAt()
        );
    }
}
