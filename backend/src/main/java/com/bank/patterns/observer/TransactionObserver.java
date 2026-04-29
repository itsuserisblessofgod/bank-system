package com.bank.patterns.observer;

public interface TransactionObserver {
    void onTransactionEvent(TransactionEvent event);
}
