package com.bank.dto;

import jakarta.validation.constraints.NotBlank;

public record LoanStatusUpdateRequest(
        @NotBlank String status
) {}
