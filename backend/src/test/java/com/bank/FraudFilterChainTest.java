package com.bank;

import com.bank.model.*;
import com.bank.patterns.fraud.*;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FraudFilterChainTest {

    private TransactionContext sampleContext(BigDecimal amount) {
        User owner = User.builder().email("o@e.com").fullName("o").passwordHash("x").role("ROLE_USER").active(true).countryCode("US").build();
        SavingsAccount sender = new SavingsAccount();
        sender.setOwner(owner);
        sender.setBalance(new BigDecimal("100000"));
        sender.setDailyLimit(new BigDecimal("5000"));
        sender.setAccountNumber("EBMS1");
        return new TransactionContext(TransactionType.WITHDRAWAL, sender, null, amount);
    }

    @Test
    void passesWhenAllRulesPass() {
        FraudRule r1 = ctx -> FraudResult.passed("R1");
        FraudRule r2 = ctx -> FraudResult.passed("R2");
        FraudFilterChain chain = new FraudFilterChain(List.of(r1, r2));
        FraudResult result = chain.evaluate(sampleContext(new BigDecimal("100")));
        assertFalse(result.blocked());
    }

    @Test
    void shortCircuitsOnFirstBlock() {
        boolean[] secondCalled = {false};
        FraudRule blocker = ctx -> FraudResult.blocked("Blocker", "nope");
        FraudRule second = ctx -> {
            secondCalled[0] = true;
            return FraudResult.passed("Second");
        };
        FraudFilterChain chain = new FraudFilterChain(List.of(blocker, second));
        FraudResult result = chain.evaluate(sampleContext(new BigDecimal("100")));
        assertTrue(result.blocked());
        assertEquals("Blocker", result.ruleName());
        assertFalse(secondCalled[0], "second rule must not run after a block");
    }

    @Test
    void limitRuleBlocksAmountAboveDailyLimit() {
        CheckLimitRule rule = new CheckLimitRule();
        FraudResult result = rule.evaluate(sampleContext(new BigDecimal("5000.01")));
        assertTrue(result.blocked());
    }

    @Test
    void limitRulePassesAtExactLimit() {
        CheckLimitRule rule = new CheckLimitRule();
        FraudResult result = rule.evaluate(sampleContext(new BigDecimal("5000")));
        assertFalse(result.blocked());
    }

    @Test
    void countryRuleBlocksRestrictedCountry() {
        CheckCountryRule rule = new CheckCountryRule("KP,IR");
        User owner = User.builder().email("o@e.com").fullName("o").passwordHash("x").role("ROLE_USER").active(true).countryCode("KP").build();
        SavingsAccount sender = new SavingsAccount();
        sender.setOwner(owner);
        sender.setDailyLimit(new BigDecimal("5000"));
        sender.setBalance(BigDecimal.TEN);
        sender.setAccountNumber("EBMS2");
        TransactionContext ctx = new TransactionContext(TransactionType.WITHDRAWAL, sender, null, BigDecimal.ONE);
        assertTrue(rule.evaluate(ctx).blocked());
    }
}
