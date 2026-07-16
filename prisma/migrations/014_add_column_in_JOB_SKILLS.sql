-- +goose Up
-- +goose StatementBegin
BEGIN;

ALTER TABLE job_skills 
    ADD COLUMN IF NOT EXISTS source VARCHAR(30) DEFAULT 'manual';

ALTER TABLE job_skills 
    ADD COLUMN IF NOT EXISTS confidence NUMERIC(3,2);

ALTER TABLE job_skills 
    ADD COLUMN IF NOT EXISTS reason TEXT;

COMMIT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
BEGIN;

ALTER TABLE job_skills 
    DROP COLUMN IF EXISTS source,
    DROP COLUMN IF EXISTS confidence,
    DROP COLUMN IF EXISTS reason;

COMMIT;
-- +goose StatementEnd