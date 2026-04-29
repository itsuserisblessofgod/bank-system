-- Seed an initial admin user.
-- Email: admin@ebms.local
-- Password: Admin12345  (BCrypt hash, strength 12)
INSERT INTO users (id, full_name, email, password_hash, role, country_code, created_at, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'EBMS Admin',
    'admin@ebms.local',
    '$2a$12$CijQZ7DUV3976z6iN7EeteLmM1EPSs6dLBz8kPimmpl3fQrT//s8S',
    'ROLE_ADMIN',
    'US',
    CURRENT_TIMESTAMP,
    TRUE
)
ON CONFLICT (email) DO NOTHING;
