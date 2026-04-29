package com.bank.dto;

import com.bank.model.User;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String fullName,
        String email,
        String role,
        String countryCode,
        boolean active,
        Instant createdAt,
        long accountCount
) {
    public static UserResponse from(User u, long accountCount) {
        return new UserResponse(
                u.getId(),
                u.getFullName(),
                u.getEmail(),
                u.getRole(),
                u.getCountryCode(),
                u.isActive(),
                u.getCreatedAt(),
                accountCount
        );
    }
}
