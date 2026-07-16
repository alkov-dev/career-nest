-- +goose Up
-- Миграция: изменение типа employee_count с INT на VARCHAR(50)

ALTER TABLE companies 
    ALTER COLUMN employee_count TYPE VARCHAR(50);

-- +goose Down
ALTER TABLE companies 
    ALTER COLUMN employee_count TYPE INT USING employee_count::integer;