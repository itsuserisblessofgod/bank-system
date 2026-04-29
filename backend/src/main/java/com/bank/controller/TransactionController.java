package com.bank.controller;

import com.bank.dto.*;
import com.bank.security.AuthenticatedUser;
import com.bank.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/deposit")
    public TransactionResponse deposit(@Valid @RequestBody DepositRequest req) {
        return transactionService.deposit(AuthenticatedUser.requireUserId(), req);
    }

    @PostMapping("/withdraw")
    public TransactionResponse withdraw(@Valid @RequestBody WithdrawRequest req) {
        return transactionService.withdraw(AuthenticatedUser.requireUserId(), req);
    }

    @PostMapping("/transfer")
    public TransactionResponse transfer(@Valid @RequestBody TransferRequest req) {
        return transactionService.transfer(AuthenticatedUser.requireUserId(), req);
    }

    @GetMapping("/history")
    public Page<TransactionResponse> history(@RequestParam UUID accountId,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return transactionService.history(AuthenticatedUser.requireUserId(), accountId, page, size);
    }
}
