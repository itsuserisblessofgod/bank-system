package com.bank.patterns.observer;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TransactionEventPublisher {

    private final List<TransactionObserver> observers;

    public TransactionEventPublisher(List<TransactionObserver> observers) {
        this.observers = observers;
    }

    public void publish(TransactionEvent event) {
        for (TransactionObserver o : observers) {
            try {
                o.onTransactionEvent(event);
            } catch (Exception ignored) {
                // observers must not break the transaction flow
            }
        }
    }
}
