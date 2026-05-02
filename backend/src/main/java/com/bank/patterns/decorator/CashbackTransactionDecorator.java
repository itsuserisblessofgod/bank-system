package com.bank.patterns.decorator;

import com.bank.model.Account;
import com.bank.model.Transaction;
import com.bank.model.TransactionStatus;
import com.bank.service.CashbackService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Adds cashback awarding on top of a wrapped transaction processor. After the wrapped
 * transaction completes successfully, calls CashbackService.awardPoints. Any failure in
 * cashback is swallowed so the underlying transaction still succeeds.
 */
public class CashbackTransactionDecorator extends TransactionDecorator {

    private static final Logger log = LoggerFactory.getLogger(CashbackTransactionDecorator.class);

    private final CashbackService cashbackService;

    public CashbackTransactionDecorator(TransactionProcessor delegate, CashbackService cashbackService) {
        super(delegate);
        this.cashbackService = cashbackService;
    }

    @Override
    public Transaction process(Transaction transaction) {
        Transaction processed = super.process(transaction);
        if (processed.getStatus() == TransactionStatus.COMPLETED) {
            try {
                Account anchor = processed.getSenderAccount() != null
                        ? processed.getSenderAccount()
                        : processed.getReceiverAccount();
                if (anchor != null && anchor.getOwner() != null) {
                    cashbackService.awardPoints(
                            anchor.getOwner().getId(),
                            processed.getAmount(),
                            processed.getTransactionType().name());
                }
            } catch (Exception e) {
                log.warn("Cashback award failed: {}", e.getMessage());
            }
        }
        return processed;
    }
}
