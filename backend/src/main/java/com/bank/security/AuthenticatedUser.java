package com.bank.security;

import com.bank.exception.ApiException;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public class AuthenticatedUser {
    public static UUID requireUserId() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UUID userId)) {
            throw ApiException.forbidden("Not authenticated");
        }
        return userId;
    }

    public static String requireRole() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw ApiException.forbidden("Not authenticated");
        return auth.getAuthorities().stream().findFirst()
                .map(a -> a.getAuthority()).orElse("ROLE_USER");
    }
}
