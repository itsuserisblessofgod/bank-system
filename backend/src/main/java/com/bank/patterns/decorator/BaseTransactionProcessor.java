package com.bank.patterns.decorator;

import com.bank.model.Transaction;
import com.bank.model.TransactionStatus;

public class BaseTransactionProcessor implements TransactionProcessor {
    @Override
    public Transaction process(Transaction transaction) {
        if (transaction.getStatus() == null || transaction.getStatus() == TransactionStatus.PENDING) {
            transaction.setStatus(TransactionStatus.COMPLETED);
        }
        return transaction;
    }
}
