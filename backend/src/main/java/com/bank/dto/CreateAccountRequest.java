package com.bank.dto;

import com.bank.model.AccountType;
import jakarta.validation.constraints.NotNull;

public record CreateAccountRequest(
        @NotNull AccountType accountType
) {}
