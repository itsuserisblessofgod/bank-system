package com.bank.patterns.adapter;

public record PaymentResult(boolean success, String externalRef, String message) {
    public static PaymentResult ok(String ref) {
        return new PaymentResult(true, ref, "OK");
    }

    public static PaymentResult failed(String message) {
        return new PaymentResult(false, null, message);
    }
}
