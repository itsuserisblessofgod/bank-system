package com.bank.dto;

import com.bank.model.FraudAuditLog;

import java.time.Instant;
import java.util.UUID;

public record FraudAuditResponse(
        UUID id,
        UUID transactionId,
        String ruleTriggered,
        String decision,
        String details,
        Instant createdAt
) {
    public static FraudAuditResponse from(FraudAuditLog log) {
        return new FraudAuditResponse(
                log.getId(),
                log.getTransaction().getId(),
                log.getRuleTriggered(),
                log.getDecision(),
                log.getDetails(),
                log.getCreatedAt()
        );
    }
}
