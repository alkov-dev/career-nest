-- +goose Up
-- +goose StatementBegin
BEGIN;

-- Удаляем старое CHECK-ограничение
ALTER TABLE users 
    DROP CONSTRAINT IF EXISTS users_role_check;

-- Создаём новое ограничение с добавлением 'hr_manager'
ALTER TABLE users 
    ADD CONSTRAINT users_role_check 
    CHECK (role::text = ANY (ARRAY['candidate', 'employer', 'admin', 'hr_manager']::text[]));

COMMIT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
BEGIN;

-- Откат: удаляем новое ограничение
ALTER TABLE users 
    DROP CONSTRAINT IF EXISTS users_role_check;

-- Возвращаем старое ограничение (без 'hr_manager')
ALTER TABLE users 
    ADD CONSTRAINT users_role_check 
    CHECK (role::text = ANY (ARRAY['candidate', 'employer', 'admin']::text[]));

COMMIT;
-- +goose StatementEnd