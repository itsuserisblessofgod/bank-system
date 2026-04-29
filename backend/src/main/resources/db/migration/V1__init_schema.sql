CREATE TABLE users (
    id              UUID PRIMARY KEY,
    full_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL,
    country_code    VARCHAR(3),
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_role CHECK (role IN ('ROLE_USER','ROLE_ADMIN'))
);

CREATE TABLE accounts (
    id              UUID PRIMARY KEY,
    account_number  VARCHAR(20)   NOT NULL UNIQUE,
    balance         DECIMAL(19,4) NOT NULL DEFAULT 0,
    account_type    VARCHAR(20)   NOT NULL,
    daily_limit     DECIMAL(19,4) NOT NULL,
    user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_balance CHECK (balance >= 0),
    CONSTRAINT chk_account_type CHECK (account_type IN ('SAVINGS','CHECKING','PREMIUM'))
);

CREATE INDEX idx_accounts_user ON accounts(user_id);

CREATE TABLE transactions (
    id                    UUID PRIMARY KEY,
    sender_account_id     UUID REFERENCES accounts(id),
    receiver_account_id   UUID REFERENCES accounts(id),
    amount                DECIMAL(19,4) NOT NULL,
    transaction_type      VARCHAR(20)   NOT NULL,
    status                VARCHAR(20)   NOT NULL,
    fraud_flag            BOOLEAN       NOT NULL DEFAULT FALSE,
    fraud_reason          VARCHAR(255),
    timestamp             TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_amount CHECK (amount > 0),
    CONSTRAINT chk_tx_type CHECK (transaction_type IN ('DEPOSIT','WITHDRAWAL','TRANSFER')),
    CONSTRAINT chk_tx_status CHECK (status IN ('PENDING','COMPLETED','BLOCKED'))
);

CREATE INDEX idx_tx_sender ON transactions(sender_account_id);
CREATE INDEX idx_tx_receiver ON transactions(receiver_account_id);
CREATE INDEX idx_tx_timestamp ON transactions(timestamp);

CREATE TABLE notifications (
    id                 UUID PRIMARY KEY,
    user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message            TEXT NOT NULL,
    notification_type  VARCHAR(20) NOT NULL,
    sent_at            TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_notification_type CHECK (notification_type IN ('EMAIL','SMS','AUDIT'))
);

CREATE INDEX idx_notifications_user ON notifications(user_id);

CREATE TABLE fraud_audit_log (
    id              UUID PRIMARY KEY,
    transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    rule_triggered  VARCHAR(100) NOT NULL,
    decision        VARCHAR(20)  NOT NULL,
    details         TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_decision CHECK (decision IN ('PASSED','BLOCKED'))
);

CREATE INDEX idx_audit_tx ON fraud_audit_log(transaction_id);
