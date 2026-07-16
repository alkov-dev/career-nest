Поток данных
HR создаёт вакансию → OpenAI извлекает навыки → Smart Upsert в БД
Кандидат загружает резюме → OpenAI извлекает навыки → Smart Upsert в БД
Матчинг (по расписанию или по клику):
Уровень 1: SQL JOIN
Уровень 2: pgvector similarity
Уровень 3: OpenAI для топ-10
Сохранение в match_scores (JSONB в поле details)



### Файл `docs/openai-service-setup.md`

```markdown
# Настройка OpenAI сервиса

## Установка

```bash
npm install openai



OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small