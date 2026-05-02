package com.bank.patterns.loan;

import com.bank.exception.ApiException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class LoanStrategyResolver {

    private final Map<String, LoanCalculationStrategy> byName;

    public LoanStrategyResolver(List<LoanCalculationStrategy> strategies) {
        this.byName = strategies.stream()
                .collect(Collectors.toMap(s -> s.getStrategyName().toUpperCase(), s -> s));
    }

    public LoanCalculationStrategy resolve(String strategyType) {
        if (strategyType == null || strategyType.isBlank()) {
            throw ApiException.badRequest("strategyType is required");
        }
        LoanCalculationStrategy strategy = byName.get(strategyType.trim().toUpperCase());
        if (strategy == null) {
            throw ApiException.badRequest("Unknown loan strategy: " + strategyType);
        }
        return strategy;
    }
}
