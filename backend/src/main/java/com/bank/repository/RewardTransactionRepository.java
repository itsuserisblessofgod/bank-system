package com.bank.repository;

import com.bank.model.RewardTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RewardTransactionRepository extends JpaRepository<RewardTransaction, UUID> {
    List<RewardTransaction> findTop10ByUserIdOrderByCreatedAtDesc(UUID userId);

    Page<RewardTransaction> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
