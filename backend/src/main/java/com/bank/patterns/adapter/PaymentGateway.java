package com.bank.patterns.adapter;

import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentGateway {
    PaymentResult processPayment(BigDecimal amount, String currency, UUID accountId);

    String providerName();
}
