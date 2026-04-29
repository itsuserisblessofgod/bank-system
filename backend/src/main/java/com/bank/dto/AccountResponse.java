package com.bank.dto;

import com.bank.model.Account;
import com.bank.model.AccountType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AccountResponse(
        UUID id,
        String accountNumber,
        BigDecimal balance,
        AccountType accountType,
        BigDecimal dailyLimit,
        Instant createdAt
) {
    public static AccountResponse from(Account a) {
        return new AccountResponse(
                a.getId(),
                a.getAccountNumber(),
                a.getBalance(),
                a.getType(),
                a.getDailyLimit(),
                a.getCreatedAt()
        );
    }
}
