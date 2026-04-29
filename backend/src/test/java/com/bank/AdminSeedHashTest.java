package com.bank;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertTrue;

class AdminSeedHashTest {
    @Test
    void seedHashMatchesAdminPassword() {
        String hash = "$2a$12$CijQZ7DUV3976z6iN7EeteLmM1EPSs6dLBz8kPimmpl3fQrT//s8S";
        assertTrue(new BCryptPasswordEncoder(12).matches("Admin12345", hash));
    }
}
