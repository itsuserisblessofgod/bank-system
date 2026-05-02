package com.bank.service;

import com.bank.dto.LoanApplicationResponseDTO;
import com.bank.dto.LoanCalculationRequestDTO;
import com.bank.dto.LoanCalculationResultDTO;
import com.bank.exception.ApiException;
import com.bank.model.LoanApplication;
import com.bank.model.User;
import com.bank.patterns.loan.LoanCalculationStrategy;
import com.bank.patterns.loan.LoanStrategyResolver;
import com.bank.repository.LoanApplicationRepository;
import com.bank.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class LoanService {

    private static final Set<String> ALLOWED_STATUSES = Set.of("PENDING", "APPROVED", "REJECTED");

    private final LoanStrategyResolver strategyResolver;
    private final LoanApplicationRepository loanRepo;
    private final UserRepository userRepo;

    public LoanService(LoanStrategyResolver strategyResolver,
                       LoanApplicationRepository loanRepo,
                       UserRepository userRepo) {
        this.strategyResolver = strategyResolver;
        this.loanRepo = loanRepo;
        this.userRepo = userRepo;
    }

    public LoanCalculationResultDTO calculate(LoanCalculationRequestDTO request) {
        LoanCalculationStrategy strategy = strategyResolver.resolve(request.strategyType());
        return strategy.calculate(request);
    }

    @Transactional
    public LoanApplicationResponseDTO applyForLoan(UUID userId, LoanCalculationRequestDTO request) {
        LoanCalculationResultDTO result = calculate(request);
        User user = userRepo.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        LoanApplication application = LoanApplication.builder()
                .user(user)
                .strategyType(result.strategyType())
                .assetPrice(result.assetPrice())
                .totalPrice(result.totalPrice())
                .monthlyPayment(result.monthlyPayment())
                .termMonths(result.termMonths())
                .purpose(result.purpose())
                .status("PENDING")
                .build();
        loanRepo.save(application);
        return LoanApplicationResponseDTO.from(application);
    }

    @Transactional(readOnly = true)
    public List<LoanApplicationResponseDTO> getMyLoans(UUID userId) {
        return loanRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(LoanApplicationResponseDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LoanApplicationResponseDTO> getAllLoans() {
        return loanRepo.findAllByOrderByCreatedAtDesc().stream()
                .map(LoanApplicationResponseDTO::from)
                .toList();
    }

    @Transactional
    public LoanApplicationResponseDTO updateStatus(UUID loanId, String status) {
        if (status == null || !ALLOWED_STATUSES.contains(status.toUpperCase())) {
            throw ApiException.badRequest("Status must be one of " + ALLOWED_STATUSES);
        }
        LoanApplication application = loanRepo.findById(loanId)
                .orElseThrow(() -> ApiException.notFound("Loan application not found"));
        application.setStatus(status.toUpperCase());
        loanRepo.save(application);
        return LoanApplicationResponseDTO.from(application);
    }
}
