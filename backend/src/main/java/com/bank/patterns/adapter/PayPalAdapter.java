package com.bank.patterns.adapter;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Adapter that translates the EBMS PaymentGateway interface into PayPal-style API calls.
 * The vendor SDK is simulated; in production this would call PayPalHttpClient.execute(...).
 */
@Component("paypalGateway")
public class PayPalAdapter implements PaymentGateway {

    @Override
    public PaymentResult processPayment(BigDecimal amount, String currency, UUID accountId) {
        String ref = "paypal_" + UUID.randomUUID();
        return PaymentResult.ok(ref + "_" + amount.toPlainString() + currency);
    }

    @Override
    public String providerName() {
        return "PAYPAL";
    }
}
