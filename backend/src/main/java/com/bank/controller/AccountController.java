package com.bank.controller;

import com.bank.dto.AccountResponse;
import com.bank.dto.CreateAccountRequest;
import com.bank.security.AuthenticatedUser;
import com.bank.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping("/create")
    public AccountResponse create(@Valid @RequestBody CreateAccountRequest req) {
        return accountService.create(AuthenticatedUser.requireUserId(), req);
    }

    @GetMapping("/{id}")
    public AccountResponse get(@PathVariable("id") UUID id) {
        boolean isAdmin = "ROLE_ADMIN".equals(AuthenticatedUser.requireRole());
        return accountService.getById(AuthenticatedUser.requireUserId(), id, isAdmin);
    }

    @GetMapping("/my")
    public List<AccountResponse> my() {
        return accountService.myAccounts(AuthenticatedUser.requireUserId());
    }
}
