-- +goose Up
-- Миграция 003: Jobs (Vacancies) + Matching Core (Application, Match, SavedJob, JobHistory)
-- + geo_clusters и matching_weights (конфиг)
-- Тема: всё связанное с вакансиями, откликами и расчётом скора.

-- Вакансии
CREATE TABLE IF NOT EXISTS jobs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    status VARCHAR(20) DEFAULT 'draft' 
        CHECK (status IN ('draft', 'active', 'paused', 'closed', 'archived')),
    salary_min INT,
    salary_max INT,
    currency VARCHAR(10) DEFAULT 'RUB',
    exp_years_min INT DEFAULT 0,
    remote_ok BOOLEAN DEFAULT FALSE,
    location TEXT,                          -- сырой город вакансии
    location_embedding VECTOR(1536),
    embedding VECTOR(1536),                 -- summary_embedding вакансии для semantic
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);

-- Связь вакансия <-> навык (required / nice-to-have)
CREATE TABLE IF NOT EXISTS job_skills (
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL DEFAULT 'nice_to_have' 
        CHECK (type IN ('required', 'nice_to_have')),
    weight NUMERIC(3,2) DEFAULT 1.0,
    PRIMARY KEY (job_id, skill_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_skills_job_id ON job_skills(job_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_skill_id ON job_skills(skill_id);

-- Связь вакансия <-> язык
CREATE TABLE IF NOT EXISTS job_languages (
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    language_id BIGINT NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    required_level VARCHAR(20) NOT NULL,
    is_critical BOOLEAN DEFAULT FALSE,
    weight NUMERIC(3,2) DEFAULT 1.0,
    PRIMARY KEY (job_id, language_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Отклики (Application)
CREATE TABLE IF NOT EXISTS applications (
    id BIGSERIAL PRIMARY KEY,
    candidate_profile_id BIGINT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'submitted' 
        CHECK (status IN ('submitted', 'viewed', 'interview', 'offer', 'rejected', 'withdrawn')),
    cover_letter_id BIGINT,                 -- ссылка на сгенерированное письмо (опционально)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_profile_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_profile_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Матчинг-скор (результаты расчёта)
CREATE TABLE IF NOT EXISTS match_scores (
    id BIGSERIAL PRIMARY KEY,
    candidate_profile_id BIGINT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,            -- 0-100
    details JSONB NOT NULL,                 -- полная расшифровка по компонентам (skills, semantic, location...)
    computed_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(candidate_profile_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_match_scores_candidate ON match_scores(candidate_profile_id);
CREATE INDEX IF NOT EXISTS idx_match_scores_job ON match_scores(job_id);
CREATE INDEX IF NOT EXISTS idx_match_scores_score ON match_scores(score DESC);

-- Сохранённые вакансии кандидатом
CREATE TABLE IF NOT EXISTS saved_jobs (
    candidate_profile_id BIGINT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (candidate_profile_id, job_id)
);

-- История изменений вакансий (аудит + для JobHistory в ERD)
CREATE TABLE IF NOT EXISTS job_history (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    editor_id BIGINT REFERENCES users(id),  -- кто редактировал
    changed_fields JSONB,                   -- что именно поменялось
    previous_values JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_history_job_id ON job_history(job_id);

-- Конфиг весов матчинга (таблица для гибкости, можно менять без деплоя)
CREATE TABLE IF NOT EXISTS matching_weights (
    id BIGSERIAL PRIMARY KEY,
    component VARCHAR(50) UNIQUE NOT NULL,  -- 'skills', 'semantic', 'location'...
    weight NUMERIC(4,3) NOT NULL,           -- 0.32, 0.23 и т.д.
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Гео-кластеры для location boost (Москва/МО, СПб/ЛО и т.д.)
CREATE TABLE IF NOT EXISTS geo_clusters (
    id BIGSERIAL PRIMARY KEY,
    cluster_name VARCHAR(100) UNIQUE NOT NULL, -- "Москва", "Санкт-Петербург"
    canonical_cities TEXT[] NOT NULL,       -- массив канонических городов
    boost_value NUMERIC(3,2) DEFAULT 0.92,
    aliases JSONB,                          -- {"мск": true, "мо": true...}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geo_clusters_cluster_name ON geo_clusters(cluster_name);

-- +goose Down
DROP TABLE IF EXISTS geo_clusters CASCADE;
DROP TABLE IF EXISTS matching_weights CASCADE;
DROP TABLE IF EXISTS job_history CASCADE;
DROP TABLE IF EXISTS saved_jobs CASCADE;
DROP TABLE IF EXISTS match_scores CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS job_languages CASCADE;
DROP TABLE IF EXISTS job_skills CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;