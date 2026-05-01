package com.bank.repository;

import com.bank.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query("SELECT t FROM Transaction t " +
            "WHERE t.senderAccount.id = :accountId OR t.receiverAccount.id = :accountId " +
            "ORDER BY t.timestamp DESC")
    Page<Transaction> findByAccountId(@Param("accountId") UUID accountId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.fraudFlag = true ORDER BY t.timestamp DESC")
    List<Transaction> findFlagged();

    @Query("SELECT COUNT(t) FROM Transaction t " +
            "WHERE (t.senderAccount.id = :accountId OR t.receiverAccount.id = :accountId) " +
            "AND t.timestamp >= :since")
    long countSince(@Param("accountId") UUID accountId, @Param("since") Instant since);

    @Query("SELECT t FROM Transaction t " +
            "WHERE t.senderAccount.owner.id = :userId OR t.receiverAccount.owner.id = :userId " +
            "ORDER BY t.timestamp DESC")
    List<Transaction> findRecentByUserId(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.senderAccount.id = :accountId AND t.status = com.bank.model.TransactionStatus.COMPLETED " +
            "AND t.timestamp >= :since")
    BigDecimal sumOutgoingSince(@Param("accountId") UUID accountId, @Param("since") Instant since);
}
