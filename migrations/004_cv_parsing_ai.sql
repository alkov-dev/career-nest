-- +goose Up
-- Миграция 004: CV Parsing + AI Evaluation (cv_uploads, experiences, cv_analyses, cv_resume_insights, cover_letters)
-- Тема: загрузка/парсинг резюме, Review, AI-скор, insights, генерация cover letter.
-- Зависит от 001 (candidate_profiles) и 003 (jobs).

-- Загрузки CV (асинхронный парсинг)
CREATE TABLE IF NOT EXISTS cv_uploads (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_url TEXT NOT NULL,             -- MinIO / S3 путь
    mime_type TEXT,
    size_bytes BIGINT,
    extracted_text TEXT,                    -- для отладки
    parsed_json JSONB,                      -- сырой результат LLM (с TTL / retention)
    status VARCHAR(20) DEFAULT 'uploaded' 
        CHECK (status IN ('uploaded', 'processing', 'parsed', 'failed', 'reviewed')),
    confidence NUMERIC(3,2),                -- 0.0-1.0 от LLM
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    parsed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,                 -- для автоочистки
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cv_uploads_user_id ON cv_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_uploads_status ON cv_uploads(status);
CREATE INDEX IF NOT EXISTS idx_cv_uploads_expires_at ON cv_uploads(expires_at) WHERE expires_at IS NOT NULL;

-- Опыт работы (из парсинга + ручного редактирования)
CREATE TABLE IF NOT EXISTS experiences (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    current BOOLEAN DEFAULT FALSE,
    description TEXT,                       -- обязанности + достижения ( coherent текст )
    technologies JSONB,                     -- ["React", "TypeScript"] 
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experiences_profile_id ON experiences(profile_id);
CREATE INDEX IF NOT EXISTS idx_experiences_dates ON experiences(profile_id, start_date, end_date);

-- Добавляем FK на cv_upload_id в candidate_profiles (если ещё не было)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_candidate_profiles_cv_upload'
    ) THEN
        ALTER TABLE candidate_profiles 
        ADD CONSTRAINT fk_candidate_profiles_cv_upload 
        FOREIGN KEY (cv_upload_id) REFERENCES cv_uploads(id) ON DELETE SET NULL;
    END IF;
END $$;

-- AI-оценка резюме (базовый детальный скор после Review)
CREATE TABLE IF NOT EXISTS cv_analyses (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    overall_score NUMERIC(5,2) NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
    level VARCHAR(20),                      -- Junior / Middle / Senior / Lead
    details JSONB NOT NULL,                 -- subscores, detected_skills, reason, explanation_for_user
    summary TEXT,                           -- короткий narrative
    evaluation_prompt_version VARCHAR(50),
    llm_model VARCHAR(50),
    tokens_used INT,
    llm_confidence NUMERIC(3,2),
    raw_llm_response JSONB,                 -- сырой ответ (с retention policy)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_current BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_cv_analyses_profile_current ON cv_analyses(profile_id, is_current) WHERE is_current = TRUE;
CREATE INDEX IF NOT EXISTS idx_cv_analyses_profile_created ON cv_analyses(profile_id, created_at DESC);

-- On-demand insights (объяснение скора + план улучшения + курсы) — только по кнопке
CREATE TABLE IF NOT EXISTS cv_resume_insights (
    id BIGSERIAL PRIMARY KEY,
    cv_analysis_id BIGINT NOT NULL REFERENCES cv_analyses(id) ON DELETE CASCADE,
    profile_id BIGINT NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    explanation_detailed JSONB NOT NULL,    -- why_this_score, strengths, weaknesses, comparison
    improvement_plan JSONB NOT NULL,        -- priority_1/2/3 с actions и expected_impact
    recommended_courses JSONB,              -- массив {skill_or_area, course, reason, impact}
    rag_chunk_ids BIGINT[],                 -- ссылки на kb_chunks
    insight_prompt_version VARCHAR(50),
    llm_model VARCHAR(50),
    tokens_used INT,
    is_stale BOOLEAN DEFAULT FALSE,
    stale_reason TEXT,
    generated_for_profile_hash TEXT,        -- hash данных профиля на момент генерации
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_cv_resume_insights_analysis ON cv_resume_insights(cv_analysis_id);
CREATE INDEX IF NOT EXISTS idx_cv_resume_insights_profile ON cv_resume_insights(profile_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_cv_resume_insights_stale ON cv_resume_insights(is_stale) WHERE is_stale = TRUE;

-- Сгенерированные сопроводительные письма
CREATE TABLE IF NOT EXISTS cover_letters (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    profile_snapshot JSONB,                 -- snapshot профиля на момент генерации (reproducibility)
    letter_text TEXT NOT NULL,
    metadata JSONB,                         -- model, tokens, confidence, match_score_at_gen, tone, focus
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    used_in_application BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_cover_letters_user_job ON cover_letters(user_id, job_id);
CREATE INDEX IF NOT EXISTS idx_cover_letters_job ON cover_letters(job_id);

-- +goose Down
ALTER TABLE candidate_profiles DROP CONSTRAINT IF EXISTS fk_candidate_profiles_cv_upload;
DROP TABLE IF EXISTS cover_letters CASCADE;
DROP TABLE IF EXISTS cv_resume_insights CASCADE;
DROP TABLE IF EXISTS cv_analyses CASCADE;
DROP TABLE IF EXISTS experiences CASCADE;
DROP TABLE IF EXISTS cv_uploads CASCADE;