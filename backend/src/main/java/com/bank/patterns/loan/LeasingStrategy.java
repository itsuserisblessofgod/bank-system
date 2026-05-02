package com.bank.patterns.loan;

import com.bank.dto.LoanCalculationRequestDTO;
import com.bank.dto.LoanCalculationResultDTO;
import com.bank.exception.ApiException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Component
public class LeasingStrategy implements LoanCalculationStrategy {

    public static final String NAME = "LEASING";

    @Override
    public LoanCalculationResultDTO calculate(LoanCalculationRequestDTO request) {
        if (request.annualRate() == null) {
            throw ApiException.badRequest("annualRate is required for LEASING");
        }
        BigDecimal assetPrice = request.assetPrice();
        BigDecimal residual = request.residualValue() == null ? BigDecimal.ZERO : request.residualValue();
        int n = request.termMonths();
        BigDecimal monthlyRate = request.annualRate()
                .divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP);

        BigDecimal capitalPart = assetPrice.subtract(residual)
                .divide(BigDecimal.valueOf(n), 4, RoundingMode.HALF_UP);
        BigDecimal interestPart = assetPrice.multiply(monthlyRate)
                .setScale(4, RoundingMode.HALF_UP);
        BigDecimal monthlyPayment = capitalPart.add(interestPart).setScale(4, RoundingMode.HALF_UP);
        BigDecimal totalPayment = monthlyPayment.multiply(BigDecimal.valueOf(n))
                .setScale(4, RoundingMode.HALF_UP);
        BigDecimal totalInterest = totalPayment.subtract(assetPrice.subtract(residual))
                .setScale(4, RoundingMode.HALF_UP);

        return new LoanCalculationResultDTO(
                NAME,
                assetPrice,
                totalPayment,
                monthlyPayment,
                totalPayment,
                BigDecimal.ZERO.setScale(4),
                totalInterest,
                request.annualRate().setScale(4, RoundingMode.HALF_UP),
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
