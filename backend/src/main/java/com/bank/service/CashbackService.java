package com.bank.service;

import com.bank.dto.RedeemResponseDTO;
import com.bank.dto.RewardTransactionDTO;
import com.bank.dto.RewardsSummaryDTO;
import com.bank.exception.ApiException;
import com.bank.model.*;
import com.bank.repository.AccountRepository;
import com.bank.repository.RewardTransactionRepository;
import com.bank.repository.UserRepository;
import com.bank.repository.UserRewardsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
public class CashbackService {

    private static final BigDecimal RATE_SILVER   = new BigDecimal("1.0");
    private static final BigDecimal RATE_GOLD     = new BigDecimal("1.5");
    private static final BigDecimal RATE_PLATINUM = new BigDecimal("2.0");

    private static final int THRESHOLD_GOLD     = 10_000;
    private static final int THRESHOLD_PLATINUM = 50_000;

    private final UserRewardsRepository rewardsRepo;
    private final RewardTransactionRepository rewardTxRepo;
    private final UserRepository userRepo;
    private final AccountRepository accountRepo;

    public CashbackService(UserRewardsRepository rewardsRepo,
                           RewardTransactionRepository rewardTxRepo,
                           UserRepository userRepo,
                           AccountRepository accountRepo) {
        this.rewardsRepo = rewardsRepo;
        this.rewardTxRepo = rewardTxRepo;
        this.userRepo = userRepo;
        this.accountRepo = accountRepo;
    }

    @Transactional
    public int awardPoints(UUID userId, BigDecimal amount, String transactionType) {
        if (amount == null || amount.signum() <= 0) return 0;
        UserRewards rewards = getOrCreate(userId);

        BigDecimal rate = rateFor(rewards.getCardTier());
        int points = amount.multiply(rate)
                .divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP)
                .intValue();
        if (points <= 0) return 0;

        rewards.setTotalPoints(rewards.getTotalPoints() + points);
        rewards.setTotalEarned(rewards.getTotalEarned().add(BigDecimal.valueOf(points))
                .setScale(4, RoundingMode.HALF_UP));
        rewards.setCardTier(tierFor(rewards.getTotalPoints()));
        rewardsRepo.save(rewards);

        RewardTransaction rt = RewardTransaction.builder()
                .user(rewards.getUser())
                .points(points)
                .type(RewardType.EARNED)
                .description("Cashback for " + transactionType + " of " + amount)
                .build();
        rewardTxRepo.save(rt);
        return points;
    }

    @Transactional
    public RedeemResponseDTO redeemPoints(UUID userId, int points, UUID accountId) {
        if (points <= 0) throw ApiException.badRequest("points must be > 0");
        UserRewards rewards = rewardsRepo.findByUserId(userId)
                .orElseThrow(() -> ApiException.notFound("No rewards balance for this user"));
        if (rewards.getTotalPoints() < points) {
            throw ApiException.badRequest("Insufficient points");
        }
        Account account = accountRepo.findById(accountId)
                .orElseThrow(() -> ApiException.notFound("Account not found"));
        if (!account.getOwner().getId().equals(userId)) {
            throw ApiException.forbidden("Account does not belong to current user");
        }

        BigDecimal credit = BigDecimal.valueOf(points).setScale(4, RoundingMode.HALF_UP);
        rewards.setTotalPoints(rewards.getTotalPoints() - points);
        rewardsRepo.save(rewards);

        account.setBalance(account.getBalance().add(credit));
        accountRepo.save(account);

        RewardTransaction rt = RewardTransaction.builder()
                .user(rewards.getUser())
                .points(points)
                .type(RewardType.REDEEMED)
                .description("Redeemed to account " + account.getAccountNumber())
                .build();
        rewardTxRepo.save(rt);

        return new RedeemResponseDTO(
                account.getId(),
                points,
                credit,
                account.getBalance(),
                rewards.getTotalPoints()
        );
    }

    @Transactional(readOnly = true)
    public RewardsSummaryDTO getSummary(UUID userId) {
        UserRewards rewards = rewardsRepo.findByUserId(userId)
                .orElseGet(() -> defaultsFor(userId));
        BigDecimal rate = rateFor(rewards.getCardTier());
        int next = pointsToNextTier(rewards.getTotalPoints(), rewards.getCardTier());
        List<RewardTransactionDTO> recent = rewardTxRepo
                .findTop10ByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(RewardTransactionDTO::from)
                .toList();
        return new RewardsSummaryDTO(
                rewards.getTotalPoints(),
                rewards.getCardTier(),
                rate,
                next,
                rewards.getTotalEarned(),
                recent
        );
    }

    private UserRewards getOrCreate(UUID userId) {
        return rewardsRepo.findByUserId(userId).orElseGet(() -> {
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> ApiException.notFound("User not found"));
            UserRewards r = UserRewards.builder()
                    .user(user)
                    .totalPoints(0)
                    .cardTier("SILVER")
                    .totalEarned(BigDecimal.ZERO)
                    .build();
            return rewardsRepo.save(r);
        });
    }

    private UserRewards defaultsFor(UUID userId) {
        UserRewards transient_ = new UserRewards();
        transient_.setTotalPoints(0);
        transient_.setCardTier("SILVER");
        transient_.setTotalEarned(BigDecimal.ZERO);
        return transient_;
    }

    private static BigDecimal rateFor(String tier) {
        return switch (tier) {
            case "PLATINUM" -> RATE_PLATINUM;
            case "GOLD"     -> RATE_GOLD;
            default         -> RATE_SILVER;
        };
    }

    private static String tierFor(int totalPoints) {
        if (totalPoints >= THRESHOLD_PLATINUM) return "PLATINUM";
        if (totalPoints >= THRESHOLD_GOLD)     return "GOLD";
        return "SILVER";
    }

    private static int pointsToNextTier(int totalPoints, String tier) {
        return switch (tier) {
            case "PLATINUM" -> 0;
            case "GOLD"     -> Math.max(0, THRESHOLD_PLATINUM - totalPoints);
            default         -> Math.max(0, THRESHOLD_GOLD - totalPoints);
        };
    }
}
