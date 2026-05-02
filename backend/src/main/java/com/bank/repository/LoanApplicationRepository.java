package com.bank.repository;

import com.bank.model.LoanApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LoanApplicationRepository extends JpaRepository<LoanApplication, UUID> {
    List<LoanApplication> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<LoanApplication> findAllByOrderByCreatedAtDesc();
}
