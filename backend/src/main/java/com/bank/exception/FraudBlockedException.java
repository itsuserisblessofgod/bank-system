package com.bank.exception;

import org.springframework.http.HttpStatus;

public class FraudBlockedException extends ApiException {
    public FraudBlockedException(String reason) {
        super(HttpStatus.FORBIDDEN, "Transaction blocked by fraud engine: " + reason);
    }
}
