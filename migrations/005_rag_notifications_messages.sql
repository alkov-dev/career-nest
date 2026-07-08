-- +goose Up
-- Миграция 005: RAG Knowledge Base + Notifications + Messages
-- Завершающая тема: KB для промптов/RAG, уведомления, чат/сообщения (комментарии).

-- Knowledge Base chunks (RAG)
CREATE TABLE IF NOT EXISTS kb_chunks (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    metadata JSONB NOT NULL,                -- {category, module, section, role, grade, source_file, chunk_index}
    hash TEXT UNIQUE,                       -- для дедупликации при re-ingest
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kb_chunks_embedding ON kb_chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_metadata ON kb_chunks USING gin (metadata jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_hash ON kb_chunks(hash);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_category ON kb_chunks USING gin ((metadata->>'category'));

-- Уведомления
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,              -- 'new_match', 'application_viewed', 'message', 'cv_parsed'...
    title TEXT,
    payload JSONB,                          -- данные для рендера (job_id, score и т.д.)
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_user_all ON notifications(user_id, created_at DESC);

-- Сообщения / комментарии (простая реализация 1:1, не полноценный чат WS)
-- По итогам созвона: простой формат как на Авито (комментарий), с email-уведомлением
CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_id BIGINT REFERENCES applications(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_application ON messages(application_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- +goose Down
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS kb_chunks CASCADE;