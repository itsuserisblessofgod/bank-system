CREATE TABLE reward_transactions (
    id                    UUID PRIMARY KEY,
    user_id               UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points                INT          NOT NULL,
    type                  VARCHAR(20)  NOT NULL,
    source_transaction_id UUID         REFERENCES transactions(id) ON DELETE SET NULL,
    description           VARCHAR(255),
    created_at            TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_reward_type CHECK (type IN ('EARNED','REDEEMED'))
);

CREATE INDEX idx_reward_transactions_user_id ON reward_transactions(user_id);
