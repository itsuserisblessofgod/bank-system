package com.bank.controller;

import com.bank.dto.AccountResponse;
import com.bank.dto.UserResponse;
import com.bank.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public List<UserResponse> users() {
        return adminService.listUsers();
    }

    @GetMapping("/accounts")
    public List<AccountResponse> accounts() {
        return adminService.listAccounts();
    }

    @PutMapping("/users/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable("id") UUID id) {
        adminService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
