package com.bank.patterns.observer;

import com.bank.model.Transaction;
import com.bank.model.User;

public record TransactionEvent(Transaction transaction, User user, String channel) {}
