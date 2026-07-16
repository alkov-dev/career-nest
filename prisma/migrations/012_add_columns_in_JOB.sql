-- +goose Up
-- +goose StatementBegin
BEGIN;

-- 1. Удаляем старую колонку requirements (без создания новой)
ALTER TABLE jobs DROP COLUMN IF EXISTS requirements;

-- 2. Добавляем новые колонки
ALTER TABLE jobs 
    ADD COLUMN department TEXT,
    ADD COLUMN remote_option TEXT,
    ADD COLUMN responsibilities TEXT[],
    ADD COLUMN nice_to_have TEXT[],
    ADD COLUMN skills TEXT[],
    ADD COLUMN experience_level VARCHAR(50),
    ADD COLUMN employment_type VARCHAR(50),
    ADD COLUMN benefits TEXT[],
    ADD COLUMN application_count INT DEFAULT 0,
    ADD COLUMN ai_match_count INT DEFAULT 0;

-- 3. Удаляем устаревшую колонку remote_ok
ALTER TABLE jobs DROP COLUMN IF EXISTS remote_ok;

-- 4. Индексы
CREATE INDEX IF NOT EXISTS idx_jobs_remote_option ON jobs(remote_option) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level) WHERE deleted_at IS NULL;

COMMIT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
BEGIN;

-- Возвращаем remote_ok
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS remote_ok BOOLEAN DEFAULT FALSE;

-- Удаляем новые колонки
ALTER TABLE jobs 
    DROP COLUMN IF EXISTS department,
    DROP COLUMN IF EXISTS remote_option,
    DROP COLUMN IF EXISTS responsibilities,
    DROP COLUMN IF EXISTS nice_to_have,
    DROP COLUMN IF EXISTS skills,
    DROP COLUMN IF EXISTS experience_level,
    DROP COLUMN IF EXISTS employment_type,
    DROP COLUMN IF EXISTS benefits,
    DROP COLUMN IF EXISTS application_count,
    DROP COLUMN IF EXISTS ai_match_count;

-- Возвращаем requirements как обычный TEXT
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS requirements TEXT;

-- Удаляем индексы
DROP INDEX IF EXISTS idx_jobs_remote_option;
DROP INDEX IF EXISTS idx_jobs_experience_level;

COMMIT;
-- +goose StatementEnd