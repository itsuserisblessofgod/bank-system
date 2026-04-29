package com.bank;

import com.bank.security.JwtUtil;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private final JwtUtil jwt = new JwtUtil(
            "test-secret-test-secret-test-secret-test-secret-test-secret-1234567890",
            3_600_000L);

    @Test
    void roundtripsClaims() {
        UUID userId = UUID.randomUUID();
        String token = jwt.generateToken(userId, "x@y.com", "ROLE_USER");
        assertEquals(userId, jwt.extractUserId(token));
        assertEquals("ROLE_USER", jwt.extractRole(token));
    }

    @Test
    void invalidTokenThrows() {
        assertThrows(Exception.class, () -> jwt.extractUserId("not-a-jwt"));
    }
}
