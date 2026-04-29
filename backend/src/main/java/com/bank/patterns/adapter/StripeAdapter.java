package com.bank.patterns.adapter;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Adapter that translates the EBMS PaymentGateway interface into Stripe-style API calls.
 * The vendor SDK is simulated; in production the body would call StripeClient.charges.create(...).
 */
@Component("stripeGateway")
@Primary
public class StripeAdapter implements PaymentGateway {

    @Override
    public PaymentResult processPayment(BigDecimal amount, String currency, UUID accountId) {
        long amountInCents = amount.movePointRight(2).longValueExact();
        String ref = "stripe_" + UUID.randomUUID();
        return PaymentResult.ok(ref + "_" + amountInCents + currency);
    }

    @Override
    public String providerName() {
        return "STRIPE";
    }
}
