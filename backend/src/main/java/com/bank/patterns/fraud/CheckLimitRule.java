package com.bank.patterns.fraud;

import com.bank.model.Account;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(10)
public class CheckLimitRule implements FraudRule {

    @Override
    public FraudResult evaluate(TransactionContext ctx) {
        Account source = ctx.senderAccount();
        if (source == null) return FraudResult.passed(name());
        if (ctx.amount().compareTo(source.getDailyLimit()) > 0) {
            return FraudResult.blocked(name(),
                    "Amount " + ctx.amount() + " exceeds account daily limit " + source.getDailyLimit());
        }
        return FraudResult.passed(name());
    }
}
