package com.bank.service;

import com.bank.model.FraudAuditLog;
import com.bank.model.Transaction;
import com.bank.patterns.fraud.FraudFilterChain;
import com.bank.patterns.fraud.FraudResult;
import com.bank.repository.FraudAuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FraudAuditService {

    private final FraudAuditLogRepository auditRepo;
    private final FraudFilterChain chain;

    public FraudAuditService(FraudAuditLogRepository auditRepo, FraudFilterChain chain) {
        this.auditRepo = auditRepo;
        this.chain = chain;
    }

    @Transactional
    public void record(Transaction tx, FraudResult result) {
        auditRepo.save(FraudAuditLog.builder()
                .transaction(tx)
                .ruleTriggered(result.ruleName())
                .decision(result.blocked() ? "BLOCKED" : "PASSED")
                .details(result.reason() == null
                        ? "Chain ran rules: " + chain.ruleNames()
                        : result.reason())
                .build());
    }
}
