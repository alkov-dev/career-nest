-- +goose Up
-- Миграция 002: Skills + Languages (компоненты матчинга Skills 32% + Languages 8%)
-- Отдельная тема: навыки, алиасы, уровни языков. Используется в CandidateSkill/JobSkill и profile_languages/job_languages.

-- Навыки (канонические)
CREATE TABLE IF NOT EXISTS skills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,      -- "React", "PostgreSQL", "Python"
    category VARCHAR(100),                  -- "frontend", "backend", "devops", "soft", "data" и т.д.
    embedding VECTOR(1536),                 -- embedding для semantic matching навыков
    needs_review BOOLEAN DEFAULT FALSE,     -- новый навык требует модерации
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
-- HNSW для semantic поиска навыков
-- CREATE INDEX idx_skills_embedding ON skills USING hnsw (embedding vector_cosine_ops);

-- Алиасы навыков (для exact/alias matching)
CREATE TABLE IF NOT EXISTS skill_aliases (
    id BIGSERIAL PRIMARY KEY,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    alias VARCHAR(255) NOT NULL,            -- "reactjs", "Реакт", "NodeJS", "PG"
    UNIQUE(skill_id, alias),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skill_aliases_alias ON skill_aliases(alias);
CREATE INDEX IF NOT EXISTS idx_skill_aliases_skill_id ON skill_aliases(skill_id);

-- Языки (канонические)
CREATE TABLE IF NOT EXISTS languages (
    id BIGSERIAL PRIMARY KEY,
    canonical_name VARCHAR(100) UNIQUE NOT NULL, -- "Английский", "Немецкий"
    embedding VECTOR(1536),                 -- для редких языков / semantic
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_languages_canonical_name ON languages(canonical_name);

-- Алиасы языков
CREATE TABLE IF NOT EXISTS language_aliases (
    id BIGSERIAL PRIMARY KEY,
    language_id BIGINT NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    alias VARCHAR(100) NOT NULL,            -- "English", "Eng", "EN", "Немецкий"
    UNIQUE(language_id, alias),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_language_aliases_alias ON language_aliases(alias);

-- Связь кандидат <-> навык (уровень)
CREATE TABLE IF NOT EXISTS candidate_skills (
    profile_id BIGINT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    level VARCHAR(20) CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert', 'Junior', 'Middle', 'Senior')),
    years NUMERIC(4,1),                     -- опционально, извлечено из опыта
    PRIMARY KEY (profile_id, skill_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_candidate_skills_profile_id ON candidate_skills(profile_id);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_skill_id ON candidate_skills(skill_id);

-- Связь кандидат <-> язык + уровень
CREATE TABLE IF NOT EXISTS profile_languages (
    profile_id BIGINT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    language_id BIGINT NOT NULL REFERENCES languages(id) ON DELETE CASCADE,
    level VARCHAR(20) CHECK (level IN ('Native', 'Fluent', 'Intermediate', 'Basic')),
    PRIMARY KEY (profile_id, language_id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_languages_profile_id ON profile_languages(profile_id);

-- +goose Down
DROP TABLE IF EXISTS profile_languages CASCADE;
DROP TABLE IF EXISTS candidate_skills CASCADE;
DROP TABLE IF EXISTS language_aliases CASCADE;
DROP TABLE IF EXISTS languages CASCADE;
DROP TABLE IF EXISTS skill_aliases CASCADE;
DROP TABLE IF EXISTS skills CASCADE;