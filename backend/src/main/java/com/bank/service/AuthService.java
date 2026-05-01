package com.bank.service;

import com.bank.dto.AuthResponse;
import com.bank.dto.ChangePasswordRequest;
import com.bank.dto.LoginRequest;
import com.bank.dto.RegisterRequest;
import com.bank.dto.TwoFactorVerifyRequest;
import com.bank.exception.ApiException;
import com.bank.model.User;
import com.bank.repository.UserRepository;
import com.bank.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AccountService accountService;
    private final boolean requireTwoFactor;
    private final Map<String, PendingTwoFactorChallenge> challenges = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepo,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AccountService accountService,
                       @Value("${app.require-2fa:false}") boolean requireTwoFactor) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.accountService = accountService;
        this.requireTwoFactor = requireTwoFactor;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.email())) {
            throw ApiException.conflict("Email already registered");
        }
        User user = User.builder()
                .fullName(req.fullName())
                .email(req.email())
                .passwordHash(passwordEncoder.encode(req.password()))
                .role("ROLE_USER")
                .countryCode(req.countryCode())
                .phone(req.phone())
                .active(true)
                .build();
        userRepo.save(user);
        if (req.accountType() != null && !req.accountType().isBlank()) {
            accountService.createAccount(user.getId(), req.accountType());
        }
        return buildAuthenticatedResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        User user = userRepo.findByEmail(req.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (!user.isActive()) {
            throw ApiException.forbidden("Account is deactivated");
        }
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        if (requireTwoFactor) {
            String challengeId = createTwoFactorChallenge(user.getId());
            return new AuthResponse(null, user.getId(), user.getEmail(), user.getFullName(), user.getRole(), true, challengeId);
        }
        return buildAuthenticatedResponse(user);
    }

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        if (!passwordEncoder.matches(req.currentPassword(), user.getPasswordHash())) {
            throw ApiException.badRequest("Current password is incorrect.");
        }
        if (req.newPassword().length() < 12) {
            throw ApiException.badRequest("Password must be at least 12 characters.");
        }
        user.setPasswordHash(passwordEncoder.encode(req.newPassword()));
        userRepo.save(user);
    }

    public String createTwoFactorChallenge(UUID userId) {
        pruneExpiredChallenges();
        String challengeId = UUID.randomUUID().toString();
        challenges.put(challengeId, new PendingTwoFactorChallenge(userId, Instant.now().plusSeconds(300)));
        return challengeId;
    }

    @Transactional(readOnly = true)
    public AuthResponse verifyTwoFactor(TwoFactorVerifyRequest req) {
        pruneExpiredChallenges();
        PendingTwoFactorChallenge challenge = challenges.remove(req.challengeId());
        if (challenge == null || challenge.expiresAt().isBefore(Instant.now())) {
            throw ApiException.badRequest("Two-factor challenge has expired.");
        }
        if (!req.code().matches("\\d{6}")) {
            throw ApiException.badRequest("Invalid code.");
        }
        User user = userRepo.findById(challenge.userId())
                .orElseThrow(() -> ApiException.notFound("User not found"));
        return buildAuthenticatedResponse(user);
    }

    private AuthResponse buildAuthenticatedResponse(User user) {
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole(), false, null);
    }

    private void pruneExpiredChallenges() {
        Instant now = Instant.now();
        challenges.entrySet().removeIf((entry) -> entry.getValue().expiresAt().isBefore(now));
    }

    private record PendingTwoFactorChallenge(UUID userId, Instant expiresAt) {}
}
