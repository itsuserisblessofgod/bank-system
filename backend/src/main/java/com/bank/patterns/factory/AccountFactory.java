package com.bank.patterns.factory;

import com.bank.exception.ApiException;
import com.bank.model.*;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.security.SecureRandom;

@Component
public class AccountFactory {

    private static final SecureRandom RNG = new SecureRandom();

    public Account create(AccountType type, User owner) {
        if (type == null) throw ApiException.badRequest("Account type required");
        Account account = switch (type) {
            case SAVINGS -> {
                SavingsAccount a = new SavingsAccount();
                a.setDailyLimit(new BigDecimal("5000.00"));
                yield a;
            }
            case CHECKING -> {
                CheckingAccount a = new CheckingAccount();
                a.setDailyLimit(new BigDecimal("10000.00"));
                yield a;
            }
            case PREMIUM -> {
                PremiumAccount a = new PremiumAccount();
                a.setDailyLimit(new BigDecimal("50000.00"));
                yield a;
            }
        };
        account.setOwner(owner);
        account.setBalance(BigDecimal.ZERO);
        account.setAccountNumber(generateAccountNumber());
        return account;
    }

    private String generateAccountNumber() {
        StringBuilder sb = new StringBuilder("EBMS");
        for (int i = 0; i < 12; i++) sb.append(RNG.nextInt(10));
        return sb.toString();
    }
}
