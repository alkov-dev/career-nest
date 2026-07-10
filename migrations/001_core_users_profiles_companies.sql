-- +goose Up
-- Миграция 001: Core Foundation - пользователи, профили кандидатов/работодателей, компании
-- Основа для auth, ролей и базовых сущностей. Запускать первой.

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Таблица пользователей (единая для кандидатов и работодателей)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'candidate' 
        CHECK (role IN ('candidate', 'employer', 'admin')),
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'banned', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status) WHERE deleted_at IS NULL;

-- Профили кандидатов (основная сущность для соискателей)
CREATE TABLE IF NOT EXISTS candidate_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT,
    city TEXT,
    city_canonical TEXT,                    -- нормализованный город для exact match
    location_embedding VECTOR(1536),        -- для location component matching
    summary TEXT,                           -- "о себе"
    summary_embedding VECTOR(1536),         -- для semantic matching
    salary_min INT,
    salary_max INT,
    currency VARCHAR(10) DEFAULT 'RUB',
    remote_ok BOOLEAN DEFAULT FALSE,
    willing_to_relocate BOOLEAN DEFAULT FALSE,
    total_experience_years NUMERIC(5,1),    -- рассчитывается из experiences
    original_cv_url TEXT,                   -- ссылка на оригинал в MinIO
    is_active BOOLEAN DEFAULT FALSE,
    cv_upload_id BIGINT,                    -- ссылка на cv_uploads (добавим FK позже)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user_id ON candidate_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_is_active ON candidate_profiles(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidate_profiles_city_canonical ON candidate_profiles(city_canonical);
-- HNSW индекс для векторов (создаётся отдельно после данных или в 003)
-- CREATE INDEX idx_candidate_profiles_location_embedding ON candidate_profiles USING hnsw (location_embedding vector_cosine_ops);
-- CREATE INDEX idx_candidate_profiles_summary_embedding ON candidate_profiles USING hnsw (summary_embedding vector_cosine_ops);

-- Профили работодателей (HR/рекрутеры)
CREATE TABLE IF NOT EXISTS employer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id BIGINT,                      -- ссылка на компанию (добавим позже)
    position_in_company TEXT,               -- должность HR
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_employer_profiles_user_id ON employer_profiles(user_id);

-- Компании
CREATE TABLE IF NOT EXISTS companies (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    size VARCHAR(50),                       -- "1-10", "11-50", "51-200" и т.д.
    industry TEXT,
    values TEXT,                            -- ценности компании (JSONB лучше в будущем)
    logo_url TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies USING gin (name gin_trgm_ops);

-- +goose Down
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS employer_profiles CASCADE;
DROP TABLE IF EXISTS candidate_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP EXTENSION IF EXISTS vector;
DROP EXTENSION IF EXISTS pg_trgm;