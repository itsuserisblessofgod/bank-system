package com.bank.controller;

import com.bank.dto.LoanApplicationResponseDTO;
import com.bank.dto.LoanCalculationRequestDTO;
import com.bank.dto.LoanCalculationResultDTO;
import com.bank.dto.LoanStatusUpdateRequest;
import com.bank.security.AuthenticatedUser;
import com.bank.service.LoanService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @PostMapping("/calculate")
    public LoanCalculationResultDTO calculate(@Valid @RequestBody LoanCalculationRequestDTO req) {
        return loanService.calculate(req);
    }

    @PostMapping("/apply")
    public LoanApplicationResponseDTO apply(@Valid @RequestBody LoanCalculationRequestDTO req) {
        return loanService.applyForLoan(AuthenticatedUser.requireUserId(), req);
    }

    @GetMapping("/my")
    public List<LoanApplicationResponseDTO> myLoans() {
        return loanService.getMyLoans(AuthenticatedUser.requireUserId());
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<LoanApplicationResponseDTO> allLoans() {
        return loanService.getAllLoans();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public LoanApplicationResponseDTO updateStatus(@PathVariable("id") UUID id,
                                                   @Valid @RequestBody LoanStatusUpdateRequest req) {
        return loanService.updateStatus(id, req.status());
    }
}
