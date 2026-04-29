package com.bank.patterns.fraud;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Component
@Order(30)
public class CheckCountryRule implements FraudRule {

    private final Set<String> blockedCountries;

    public CheckCountryRule(@Value("${ebms.fraud.blocked-countries:}") String blockedCsv) {
        this.blockedCountries = blockedCsv == null || blockedCsv.isBlank()
                ? Set.of()
                : new HashSet<>(Arrays.asList(blockedCsv.split(",")));
    }

    @Override
    public FraudResult evaluate(TransactionContext ctx) {
        String senderCountry = ctx.senderAccount() == null ? null
                : ctx.senderAccount().getOwner().getCountryCode();
        String receiverCountry = ctx.receiverAccount() == null ? null
                : ctx.receiverAccount().getOwner().getCountryCode();
        if (senderCountry != null && blockedCountries.contains(senderCountry)) {
            return FraudResult.blocked(name(), "Sender country " + senderCountry + " is restricted");
        }
        if (receiverCountry != null && blockedCountries.contains(receiverCountry)) {
            return FraudResult.blocked(name(), "Receiver country " + receiverCountry + " is restricted");
        }
        return FraudResult.passed(name());
    }
}
