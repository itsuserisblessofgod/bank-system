package com.bank;

import com.bank.model.*;
import com.bank.patterns.factory.AccountFactory;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class AccountFactoryTest {

    private final AccountFactory factory = new AccountFactory();
    private final User owner = User.builder()
            .fullName("Test")
            .email("t@example.com")
            .passwordHash("x")
            .role("ROLE_USER")
            .active(true)
            .build();

    @Test
    void createsSavingsAccount() {
        Account a = factory.create(AccountType.SAVINGS, owner);
        assertInstanceOf(SavingsAccount.class, a);
        assertEquals(AccountType.SAVINGS, a.getType());
        assertEquals(new BigDecimal("5000.00"), a.getDailyLimit());
        assertEquals(BigDecimal.ZERO, a.getBalance());
        assertNotNull(a.getAccountNumber());
        assertSame(owner, a.getOwner());
    }

    @Test
    void createsCheckingAccount() {
        Account a = factory.create(AccountType.CHECKING, owner);
        assertInstanceOf(CheckingAccount.class, a);
        assertEquals(new BigDecimal("10000.00"), a.getDailyLimit());
    }

    @Test
    void createsPremiumAccount() {
        Account a = factory.create(AccountType.PREMIUM, owner);
        assertInstanceOf(PremiumAccount.class, a);
        assertEquals(new BigDecimal("50000.00"), a.getDailyLimit());
    }

    @Test
    void generatesUniqueAccountNumbers() {
        Account a1 = factory.create(AccountType.SAVINGS, owner);
        Account a2 = factory.create(AccountType.SAVINGS, owner);
        assertNotEquals(a1.getAccountNumber(), a2.getAccountNumber());
    }
}
