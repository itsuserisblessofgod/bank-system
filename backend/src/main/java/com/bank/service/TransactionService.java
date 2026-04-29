package com.bank.service;

import com.bank.dto.*;
import com.bank.exception.ApiException;
import com.bank.model.*;
import com.bank.patterns.decorator.*;
import com.bank.patterns.fraud.FraudFilterChain;
import com.bank.patterns.fraud.FraudResult;
import com.bank.patterns.fraud.TransactionContext;
import com.bank.patterns.observer.TransactionEvent;
import com.bank.patterns.observer.TransactionEventPublisher;
import com.bank.repository.AccountRepository;
import com.bank.repository.TransactionRepository;
import com.bank.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class TransactionService {

    private final AccountRepository accountRepo;
    private final TransactionRepository txRepo;
    private final UserRepository userRepo;
    private final FraudFilterChain fraudChain;
    private final FraudAuditService auditService;
    private final TransactionEventPublisher eventPublisher;
    private final TransactionProcessor processor;

    public TransactionService(AccountRepository accountRepo,
                              TransactionRepository txRepo,
                              UserRepository userRepo,
                              FraudFilterChain fraudChain,
                              FraudAuditService auditService,
                              TransactionEventPublisher eventPublisher) {
        this.accountRepo = accountRepo;
        this.txRepo = txRepo;
        this.userRepo = userRepo;
        this.fraudChain = fraudChain;
        this.auditService = auditService;
        this.eventPublisher = eventPublisher;
        this.processor = new LoggedTransactionDecorator(
                new EncryptedTransactionDecorator(
                        new BaseTransactionProcessor()));
    }

    @Transactional
    public TransactionResponse deposit(UUID userId, DepositRequest req) {
        Account account = loadOwnedAccount(userId, req.accountId());
        Transaction tx = Transaction.builder()
                .receiverAccount(account)
                .amount(req.amount())
                .transactionType(TransactionType.DEPOSIT)
                .status(TransactionStatus.PENDING)
                .build();
        return execute(tx, null, account, req.amount(), TransactionType.DEPOSIT, account.getOwner());
    }

    @Transactional
    public TransactionResponse withdraw(UUID userId, WithdrawRequest req) {
        Account account = loadOwnedAccount(userId, req.accountId());
        if (account.getBalance().compareTo(req.amount()) < 0) {
            throw ApiException.badRequest("Insufficient funds");
        }
        Transaction tx = Transaction.builder()
                .senderAccount(account)
                .amount(req.amount())
                .transactionType(TransactionType.WITHDRAWAL)
                .status(TransactionStatus.PENDING)
                .build();
        return execute(tx, account, null, req.amount(), TransactionType.WITHDRAWAL, account.getOwner());
    }

    @Transactional
    public TransactionResponse transfer(UUID userId, TransferRequest req) {
        if (req.fromAccountId().equals(req.toAccountId())) {
            throw ApiException.badRequest("Cannot transfer to the same account");
        }
        Account from = loadOwnedAccount(userId, req.fromAccountId());
        Account to = accountRepo.findById(req.toAccountId())
                .orElseThrow(() -> ApiException.notFound("Receiver account not found"));
        if (from.getBalance().compareTo(req.amount()) < 0) {
            throw ApiException.badRequest("Insufficient funds");
        }
        Transaction tx = Transaction.builder()
                .senderAccount(from)
                .receiverAccount(to)
                .amount(req.amount())
                .transactionType(TransactionType.TRANSFER)
                .status(TransactionStatus.PENDING)
                .build();
        return execute(tx, from, to, req.amount(), TransactionType.TRANSFER, from.getOwner());
    }

    private TransactionResponse execute(Transaction tx,
                                        Account sender,
                                        Account receiver,
                                        BigDecimal amount,
                                        TransactionType type,
                                        User notifyUser) {
        TransactionContext context = new TransactionContext(type, sender, receiver, amount);
        FraudResult result = fraudChain.evaluate(context);

        if (result.blocked()) {
            tx.setStatus(TransactionStatus.BLOCKED);
            tx.setFraudFlag(true);
            tx.setFraudReason(result.ruleName() + ": " + result.reason());
            txRepo.save(tx);
            auditService.record(tx, result);
            eventPublisher.publish(new TransactionEvent(tx, notifyUser, "BLOCKED"));
            return TransactionResponse.from(tx);
        }

        if (sender != null) {
            sender.setBalance(sender.getBalance().subtract(amount));
            accountRepo.save(sender);
        }
        if (receiver != null) {
            receiver.setBalance(receiver.getBalance().add(amount));
            accountRepo.save(receiver);
        }

        Transaction processed = processor.process(tx);
        txRepo.save(processed);
        auditService.record(processed, result);
        eventPublisher.publish(new TransactionEvent(processed, notifyUser, "COMPLETED"));
        return TransactionResponse.from(processed);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> history(UUID userId, UUID accountId, int page, int size) {
        loadOwnedAccount(userId, accountId);
        return txRepo.findByAccountId(accountId, PageRequest.of(page, size))
                .map(TransactionResponse::from);
    }

    private Account loadOwnedAccount(UUID userId, UUID accountId) {
        Account a = accountRepo.findById(accountId)
                .orElseThrow(() -> ApiException.notFound("Account not found"));
        if (!a.getOwner().getId().equals(userId)) {
            throw ApiException.forbidden("Account does not belong to current user");
        }
        // touch user to ensure attached for downstream observers
        userRepo.findById(userId);
        return a;
    }
}
