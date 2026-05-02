package com.bank.patterns.loan;

import com.bank.dto.LoanCalculationRequestDTO;
import com.bank.dto.LoanCalculationResultDTO;

public interface LoanCalculationStrategy {
    LoanCalculationResultDTO calculate(LoanCalculationRequestDTO request);

    String getStrategyName();
}
