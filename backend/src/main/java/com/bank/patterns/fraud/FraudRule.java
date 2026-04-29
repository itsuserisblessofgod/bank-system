package com.bank.patterns.fraud;

public interface FraudRule {
    FraudResult evaluate(TransactionContext context);

    default String name() {
        return getClass().getSimpleName();
    }
}
