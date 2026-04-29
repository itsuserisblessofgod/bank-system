package com.bank.model;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("CHECKING")
public class CheckingAccount extends Account {
    @Override
    public AccountType getType() {
        return AccountType.CHECKING;
    }
}
