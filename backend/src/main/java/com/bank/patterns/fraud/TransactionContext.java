package com.bank.patterns.fraud;

import com.bank.model.Account;
import com.bank.model.TransactionType;

import java.math.BigDecimal;

public record TransactionContext(
        TransactionType type,
        Account senderAccount,
        Account receiverAccount,
        BigDecimal amount
) {}
