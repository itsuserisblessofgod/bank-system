package com.bank.patterns.loan;

import com.bank.dto.LoanCalculationRequestDTO;
import com.bank.dto.LoanCalculationResultDTO;
import com.bank.exception.ApiException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Component
public class StandardLoanStrategy implements LoanCalculationStrategy {

    public static final String NAME = "STANDARD";

    @Override
    public LoanCalculationResultDTO calculate(LoanCalculationRequestDTO request) {
        if (request.annualRate() == null) {
            throw ApiException.badRequest("annualRate is required for STANDARD loans");
        }
        BigDecimal principal = request.assetPrice();
        double annual = request.annualRate().doubleValue();
        int n = request.termMonths();

        double monthlyRate = annual / 12.0;
        BigDecimal monthlyPayment;
        if (monthlyRate == 0.0) {
            monthlyPayment = principal.divide(BigDecimal.valueOf(n), 4, RoundingMode.HALF_UP);
        } else {
            double pow = Math.pow(1 + monthlyRate, n);
            double m = principal.doubleValue() * (monthlyRate * pow) / (pow - 1);
            monthlyPayment = BigDecimal.valueOf(m).setScale(4, RoundingMode.HALF_UP);
        }
        BigDecimal totalPayment = monthlyPayment.multiply(BigDecimal.valueOf(n))
                .setScale(4, RoundingMode.HALF_UP);
        BigDecimal totalInterest = totalPayment.subtract(principal).setScale(4, RoundingMode.HALF_UP);
        BigDecimal effectiveRate = request.annualRate().setScale(4, RoundingMode.HALF_UP);

        return new LoanCalculationResultDTO(
                NAME,
                principal,
                totalPayment,
                monthlyPayment,
                totalPayment,
                BigDecimal.ZERO.setScale(4),
                totalInterest,
                effectiveRate,
                n,
                request.purpose(),
                Instant.now()
        );
    }

    @Override
    public String getStrategyName() {
        return NAME;
    }
}
