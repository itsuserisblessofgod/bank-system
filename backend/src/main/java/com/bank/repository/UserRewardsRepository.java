package com.bank.repository;

import com.bank.model.UserRewards;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRewardsRepository extends JpaRepository<UserRewards, UUID> {
    Optional<UserRewards> findByUserId(UUID userId);
}
