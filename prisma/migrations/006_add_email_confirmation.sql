-- +goose Up
-- Добавляем поля для email-подтверждения
ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS email_confirm_token TEXT,
    ADD COLUMN IF NOT EXISTS email_confirm_expires TIMESTAMPTZ;

-- Добавляем уникальный индекс на токен (для быстрого поиска)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_confirm_token 
    ON users(email_confirm_token) 
    WHERE email_confirm_token IS NOT NULL;

-- Изменяем статус по умолчанию на 'pending'
ALTER TABLE users 
    ALTER COLUMN status SET DEFAULT 'pending';

-- +goose Down
-- Откатываем изменения
DROP INDEX IF EXISTS idx_users_email_confirm_token;

ALTER TABLE users 
    DROP COLUMN IF EXISTS email_confirm_token,
    DROP COLUMN IF NOT EXISTS email_confirm_expires;

ALTER TABLE users 
    ALTER COLUMN status SET DEFAULT 'active';