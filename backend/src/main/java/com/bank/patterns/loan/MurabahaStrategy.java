package com.bank.patterns.loan;

import com.bank.dto.LoanCalculationRequestDTO;
import com.bank.dto.LoanCalculationResultDTO;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;

@Component
public class MurabahaStrategy implements LoanCalculationStrategy {

    public static final String NAME = "MURABAHA";

    @Override
    public LoanCalculationResultDTO calculate(LoanCalculationRequestDTO request) {
        BigDecimal assetPrice = request.assetPrice();
        BigDecimal margin = request.profitMargin() == null ? BigDecimal.ZERO : request.profitMargin();
        int term = request.termMonths();

        BigDecimal totalProfit = assetPrice.multiply(margin).setScale(4, RoundingMode.HALF_UP);
        BigDecimal totalPrice = assetPrice.add(totalProfit).setScale(4, RoundingMode.HALF_UP);
        BigDecimal monthlyPayment = totalPrice.divide(BigDecimal.valueOf(term), 4, RoundingMode.HALF_UP);

        return new LoanCalculationResultDTO(
                NAME,
                assetPrice,
                totalPrice,
                monthlyPayment,
                totalPrice,
                totalProfit,
                BigDecimal.ZERO.setScale(4),
                BigDecimal.ZERO.setScale(4),
                term,
                request.purpose(),
                Instant.now()
        );
    }

    @Override
    public String getStrategyName() {
        return NAME;
    }
}
