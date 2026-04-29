package com.bank.patterns.decorator;

import com.bank.model.Transaction;

public interface TransactionProcessor {
    Transaction process(Transaction transaction);
}
