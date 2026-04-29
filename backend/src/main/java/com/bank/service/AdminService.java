package com.bank.service;

import com.bank.dto.AccountResponse;
import com.bank.dto.UserResponse;
import com.bank.exception.ApiException;
import com.bank.model.User;
import com.bank.repository.AccountRepository;
import com.bank.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AdminService {

    private final UserRepository userRepo;
    private final AccountRepository accountRepo;

    public AdminService(UserRepository userRepo, AccountRepository accountRepo) {
        this.userRepo = userRepo;
        this.accountRepo = accountRepo;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepo.findAll().stream()
                .map(u -> UserResponse.from(u, accountRepo.findByOwnerId(u.getId()).size()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> listAccounts() {
        return accountRepo.findAll().stream()
                .map(AccountResponse::from)
                .toList();
    }

    @Transactional
    public void deactivate(UUID userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        user.setActive(false);
        userRepo.save(user);
    }
}
