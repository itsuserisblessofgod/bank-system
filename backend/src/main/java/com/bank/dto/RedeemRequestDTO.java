package com.bank.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RedeemRequestDTO(
        @Min(value = 1, message = "points must be >= 1") int points,
        @NotNull UUID accountId
) {}
