package com.bank.repository;

import com.bank.model.FraudAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FraudAuditLogRepository extends JpaRepository<FraudAuditLog, UUID> {
    List<FraudAuditLog> findAllByOrderByCreatedAtDesc();
}
