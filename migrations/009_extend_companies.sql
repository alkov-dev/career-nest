-- +goose Up
-- Миграция 003: расширение таблицы companies полями из ТЗ (п. 12.2)

ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS head_office        VARCHAR(255),
    ADD COLUMN IF NOT EXISTS linkedin_url       VARCHAR(255),
    ADD COLUMN IF NOT EXISTS benefits           TEXT,
    ADD COLUMN IF NOT EXISTS corporate_culture  TEXT,
    ADD COLUMN IF NOT EXISTS employee_count     INT;

-- +goose Down
ALTER TABLE companies
    DROP COLUMN IF EXISTS head_office,
    DROP COLUMN IF EXISTS linkedin_url,
    DROP COLUMN IF EXISTS benefits,
    DROP COLUMN IF EXISTS corporate_culture,
    DROP COLUMN IF EXISTS employee_count;