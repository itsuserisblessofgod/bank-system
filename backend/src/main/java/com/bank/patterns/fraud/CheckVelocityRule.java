package com.bank.patterns.fraud;

import com.bank.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
@Order(20)
public class CheckVelocityRule implements FraudRule {

    private final TransactionRepository txRepo;
    private final long windowMinutes;
    private final long maxTx;

    public CheckVelocityRule(TransactionRepository txRepo,
                             @Value("${ebms.fraud.velocity.window-minutes}") long windowMinutes,
                             @Value("${ebms.fraud.velocity.max-tx}") long maxTx) {
        this.txRepo = txRepo;
        this.windowMinutes = windowMinutes;
        this.maxTx = maxTx;
    }

    @Override
    public FraudResult evaluate(TransactionContext ctx) {
        if (ctx.senderAccount() == null) return FraudResult.passed(name());
        Instant since = Instant.now().minus(windowMinutes, ChronoUnit.MINUTES);
        long count = txRepo.countSince(ctx.senderAccount().getId(), since);
        if (count >= maxTx) {
            return FraudResult.blocked(name(),
                    "Velocity exceeded: " + count + " transactions in last " + windowMinutes + " minutes (limit " + maxTx + ")");
        }
        return FraudResult.passed(name());
    }
}
