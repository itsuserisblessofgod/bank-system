package com.bank.controller;

import com.bank.dto.FraudAuditResponse;
import com.bank.dto.TransactionResponse;
import com.bank.patterns.fraud.FraudFilterChain;
import com.bank.patterns.fraud.FraudRule;
import com.bank.repository.FraudAuditLogRepository;
import com.bank.repository.TransactionRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fraud")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class FraudController {

    private final TransactionRepository txRepo;
    private final FraudAuditLogRepository auditRepo;
    private final FraudFilterChain chain;
    private final List<FraudRule> allRules;
    private final int velocityWindowMinutes;
    private final int maxTransactions;
    private final String blockedCountries;

    public FraudController(TransactionRepository txRepo,
                           FraudAuditLogRepository auditRepo,
                           FraudFilterChain chain,
                           List<FraudRule> allRules,
                           @org.springframework.beans.factory.annotation.Value("${ebms.fraud.velocity.window-minutes:10}") int velocityWindowMinutes,
                           @org.springframework.beans.factory.annotation.Value("${ebms.fraud.velocity.max-tx:10}") int maxTransactions,
                           @org.springframework.beans.factory.annotation.Value("${ebms.fraud.blocked-countries:KP,IR,SY}") String blockedCountries) {
        this.txRepo = txRepo;
        this.auditRepo = auditRepo;
        this.chain = chain;
        this.allRules = allRules;
        this.velocityWindowMinutes = velocityWindowMinutes;
        this.maxTransactions = maxTransactions;
        this.blockedCountries = blockedCountries;
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

    @GetMapping("/rules/info")
    public Map<String, Object> rulesInfo() {
        return Map.of(
                "rules", List.of("CheckLimitRule", "CheckVelocityRule", "CheckCountryRule"),
                "velocityWindow", velocityWindowMinutes + " minutes",
                "maxTransactions", maxTransactions,
                "blockedCountries", Arrays.stream(blockedCountries.split(","))
                        .map(String::trim)
                        .filter((country) -> !country.isEmpty())
                        .toList()
        );
    }

    @PostMapping("/rules/reload")
    public List<String> reloadRules() {
        chain.reload(allRules);
        return chain.ruleNames();
    }
}
