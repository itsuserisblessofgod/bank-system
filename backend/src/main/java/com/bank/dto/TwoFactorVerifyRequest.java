package com.bank.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record TwoFactorVerifyRequest(
        @NotBlank String challengeId,
        @NotBlank @Pattern(regexp = "\\d{6}", message = "Code must be 6 digits.") String code
) {}
