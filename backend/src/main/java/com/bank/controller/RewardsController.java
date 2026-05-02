package com.bank.controller;

import com.bank.dto.RedeemRequestDTO;
import com.bank.dto.RedeemResponseDTO;
import com.bank.dto.RewardTransactionDTO;
import com.bank.dto.RewardsSummaryDTO;
import com.bank.security.AuthenticatedUser;
import com.bank.service.CashbackService;
import com.bank.repository.RewardTransactionRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rewards")
public class RewardsController {

    private final CashbackService cashbackService;
    private final RewardTransactionRepository rewardTxRepo;

    public RewardsController(CashbackService cashbackService,
                             RewardTransactionRepository rewardTxRepo) {
        this.cashbackService = cashbackService;
        this.rewardTxRepo = rewardTxRepo;
    }

    @GetMapping("/my")
    public RewardsSummaryDTO mySummary() {
        return cashbackService.getSummary(AuthenticatedUser.requireUserId());
    }

    @GetMapping("/my/history")
    public Page<RewardTransactionDTO> myHistory(@RequestParam(defaultValue = "0") int page,
                                                @RequestParam(defaultValue = "10") int size) {
        return rewardTxRepo
                .findByUserIdOrderByCreatedAtDesc(AuthenticatedUser.requireUserId(),
                        PageRequest.of(page, size))
                .map(RewardTransactionDTO::from);
    }

    @PostMapping("/redeem")
    public RedeemResponseDTO redeem(@Valid @RequestBody RedeemRequestDTO req) {
        return cashbackService.redeemPoints(
                AuthenticatedUser.requireUserId(), req.points(), req.accountId());
    }
}
