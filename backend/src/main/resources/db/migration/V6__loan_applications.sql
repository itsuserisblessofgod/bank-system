CREATE TABLE loan_applications (
    id              UUID PRIMARY KEY,
    user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    strategy_type   VARCHAR(20)   NOT NULL,
    asset_price     DECIMAL(19,4) NOT NULL,
    total_price     DECIMAL(19,4) NOT NULL,
    monthly_payment DECIMAL(19,4) NOT NULL,
    term_months     INT           NOT NULL,
    purpose         VARCHAR(50),
    status          VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP,
    CONSTRAINT chk_loan_strategy CHECK (strategy_type IN ('MURABAHA','STANDARD','LEASING')),
    CONSTRAINT chk_loan_status   CHECK (status IN ('PENDING','APPROVED','REJECTED'))
);

CREATE INDEX idx_loan_applications_user ON loan_applications(user_id);
