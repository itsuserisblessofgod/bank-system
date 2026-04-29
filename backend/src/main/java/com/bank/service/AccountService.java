package com.bank.service;

import com.bank.dto.AccountResponse;
import com.bank.dto.CreateAccountRequest;
import com.bank.exception.ApiException;
import com.bank.model.Account;
import com.bank.model.User;
import com.bank.patterns.factory.AccountFactory;
import com.bank.repository.AccountRepository;
import com.bank.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AccountService {

    private final AccountRepository accountRepo;
    private final UserRepository userRepo;
    private final AccountFactory accountFactory;

    public AccountService(AccountRepository accountRepo,
                          UserRepository userRepo,
                          AccountFactory accountFactory) {
        this.accountRepo = accountRepo;
        this.userRepo = userRepo;
        this.accountFactory = accountFactory;
    }

    @Transactional
    public AccountResponse create(UUID userId, CreateAccountRequest req) {
        User owner = userRepo.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        Account account = accountFactory.create(req.accountType(), owner);
        accountRepo.save(account);
        return AccountResponse.from(account);
    }

    @Transactional(readOnly = true)
    public AccountResponse getById(UUID userId, UUID accountId, boolean isAdmin) {
        Account account = accountRepo.findById(accountId)
                .orElseThrow(() -> ApiException.notFound("Account not found"));
        if (!isAdmin && !account.getOwner().getId().equals(userId)) {
            throw ApiException.forbidden("Not your account");
        }
        return AccountResponse.from(account);
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> myAccounts(UUID userId) {
        return accountRepo.findByOwnerId(userId).stream()
                .map(AccountResponse::from)
                .toList();
    }
}
