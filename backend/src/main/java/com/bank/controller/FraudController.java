package com.bank.controller;

import com.bank.dto.FraudAuditResponse;
import com.bank.dto.TransactionResponse;
import com.bank.patterns.fraud.FraudFilterChain;
import com.bank.patterns.fraud.FraudRule;
import com.bank.repository.FraudAuditLogRepository;
import com.bank.repository.TransactionRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fraud")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class FraudController {

    private final TransactionRepository txRepo;
    private final FraudAuditLogRepository auditRepo;
    private final FraudFilterChain chain;
    private final List<FraudRule> allRules;

    public FraudController(TransactionRepository txRepo,
                           FraudAuditLogRepository auditRepo,
                           FraudFilterChain chain,
                           List<FraudRule> allRules) {
        this.txRepo = txRepo;
        this.auditRepo = auditRepo;
        this.chain = chain;
        this.allRules = allRules;
    }

    @GetMapping("/alerts")
    public List<TransactionResponse> alerts() {
        return txRepo.findFlagged().stream().map(TransactionResponse::from).toList();
    }

    @GetMapping("/audit-log")
    public List<FraudAuditResponse> auditLog() {
        return auditRepo.findAllByOrderByCreatedAtDesc().stream()
                .map(FraudAuditResponse::from)
                .toList();
    }

    @PostMapping("/rules/reload")
    public List<String> reloadRules() {
        chain.reload(allRules);
        return chain.ruleNames();
    }
}
