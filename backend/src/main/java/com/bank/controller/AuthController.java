package com.bank.controller;

import com.bank.dto.AuthResponse;
import com.bank.dto.ChangePasswordRequest;
import com.bank.dto.LoginRequest;
import com.bank.dto.RegisterRequest;
import com.bank.dto.TwoFactorVerifyRequest;
import com.bank.security.AuthenticatedUser;
import com.bank.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/change-password")
    public Map<String, String> changePassword(@Valid @RequestBody ChangePasswordRequest req) {
        authService.changePassword(AuthenticatedUser.requireUserId(), req);
        return Map.of("message", "Password changed successfully.");
    }

    @PostMapping("/2fa/challenge")
    public Map<String, String> challenge() {
        return Map.of("challengeId", authService.createTwoFactorChallenge(AuthenticatedUser.requireUserId()));
    }

    @PostMapping("/2fa/verify")
    public AuthResponse verifyTwoFactor(@Valid @RequestBody TwoFactorVerifyRequest req) {
        return authService.verifyTwoFactor(req);
    }
}
