package com.bank.patterns.fraud;

public record FraudResult(boolean blocked, String ruleName, String reason) {

    public static FraudResult passed(String ruleName) {
        return new FraudResult(false, ruleName, null);
    }

    public static FraudResult blocked(String ruleName, String reason) {
        return new FraudResult(true, ruleName, reason);
    }
}
