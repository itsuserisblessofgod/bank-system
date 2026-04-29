package com.bank.patterns.decorator;

import com.bank.model.Transaction;

public abstract class TransactionDecorator implements TransactionProcessor {
    protected final TransactionProcessor delegate;

    protected TransactionDecorator(TransactionProcessor delegate) {
        this.delegate = delegate;
    }

    @Override
    public Transaction process(Transaction transaction) {
        return delegate.process(transaction);
    }
}
