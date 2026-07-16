-- +goose Up
-- +goose StatementBegin
BEGIN;

-- Создаём requirements как массив
ALTER TABLE jobs ADD COLUMN requirements TEXT[];

COMMIT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
BEGIN;

-- Удаляем колонку при откате
ALTER TABLE jobs DROP COLUMN IF EXISTS requirements;

COMMIT;
-- +goose StatementEnd