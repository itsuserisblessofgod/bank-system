CREATE TABLE user_rewards (
    id            UUID PRIMARY KEY,
    user_id       UUID          NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_points  INT           NOT NULL DEFAULT 0,
    card_tier     VARCHAR(20)   NOT NULL DEFAULT 'SILVER',
    total_earned  DECIMAL(19,4) NOT NULL DEFAULT 0,
    updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_card_tier CHECK (card_tier IN ('SILVER','GOLD','PLATINUM'))
);
