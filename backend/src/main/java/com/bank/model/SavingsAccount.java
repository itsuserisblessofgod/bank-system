package com.bank.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("SAVINGS")
public class SavingsAccount extends Account {
    @Override
    public AccountType getType() {
        return AccountType.SAVINGS;
    }
}
