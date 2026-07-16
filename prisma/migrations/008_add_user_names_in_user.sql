-- +goose Up
-- Миграция 002: добавление полей first_name и last_name в таблицу users
-- Позволяет хранить имя и фамилию пользователя (кандидата/работодателя).

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS first_name  VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS last_name   VARCHAR(100) NOT NULL DEFAULT '';

-- +goose StatementBegin
-- (не требуется — используем обычный SQL)
-- +goose StatementEnd


-- +goose Down
-- Откат миграции 002: удаляем поля first_name и last_name из таблицы users.

ALTER TABLE users
    DROP COLUMN IF EXISTS first_name,
    DROP COLUMN IF EXISTS last_name;