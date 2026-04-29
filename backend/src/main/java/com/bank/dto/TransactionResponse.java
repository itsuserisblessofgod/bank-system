package com.bank.dto;

import com.bank.model.Transaction;
import com.bank.model.TransactionStatus;
import com.bank.model.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        UUID senderAccountId,
        UUID receiverAccountId,
        BigDecimal amount,
        TransactionType transactionType,
        TransactionStatus status,
        boolean fraudFlag,
        String fraudReason,
        Instant timestamp
) {
    public static TransactionResponse from(Transaction t) {
        return new TransactionResponse(
                t.getId(),
                t.getSenderAccount() == null ? null : t.getSenderAccount().getId(),
                t.getReceiverAccount() == null ? null : t.getReceiverAccount().getId(),
                t.getAmount(),
                t.getTransactionType(),
                t.getStatus(),
                t.isFraudFlag(),
                t.getFraudReason(),
                t.getTimestamp()
        );
    }
}
