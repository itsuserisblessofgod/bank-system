package com.bank.patterns.fraud;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class FraudFilterChain {

    private final List<FraudRule> rules;

    @Autowired
    public FraudFilterChain(List<FraudRule> rules) {
        this.rules = new ArrayList<>(rules);
    }

    public FraudResult evaluate(TransactionContext context) {
        for (FraudRule rule : rules) {
            FraudResult result = rule.evaluate(context);
            if (result.blocked()) {
                return result;
            }
        }
        return FraudResult.passed("AllRulesPassed");
    }

    public List<String> ruleNames() {
        return rules.stream().map(FraudRule::name).toList();
    }

    public void reload(List<FraudRule> newRules) {
        this.rules.clear();
        this.rules.addAll(newRules);
    }
}
