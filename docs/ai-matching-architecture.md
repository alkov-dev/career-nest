
### Файл `docs/ai-matching-architecture.md`

```markdown
# Архитектура матчинга кандидатов и вакансий

## Трехуровневая система

### Уровень 1: Точный матчинг (SQL)
- Быстрый и бесплатный
- Считает процент совпадения по `skill_id`
- Формула: `(matchedRequiredSkills / totalRequiredSkills) * 100`

### Уровень 2: Семантический матчинг (pgvector)
- Находит похожие навыки (Vue.js ≈ React)
- Порог similarity > 0.8 = частичное совпадение
- SQL-запрос с оператором `<=>`

Если кандидат знает "Vue.js", а вакансия требует "React". Точный матч даст 0, но векторный поиск покажет, что это оба frontend-фреймворки.

-- Ищем похожие навыки кандидата для требований вакансии
SELECT cs.skill_id, js.skill_id as required_id, 
       1 - (s1.embedding <=> s2.embedding) as similarity
FROM candidate_skills cs
JOIN skills s1 ON cs.skill_id = s1.id
CROSS JOIN job_skills js
JOIN skills s2 ON js.skill_id = s2.id
WHERE js.type = 'required' AND js.job_id = $1
ORDER BY similarity DESC;

Если similarity > 0.8, мы засчитываем это как "частичное совпадение" и даем бонусные баллы.

### Уровень 3: LLM-рассуждение (OpenAI)
Когда мы уже собрали факты (Уровень 1 и 2), мы отдаем их OpenAI, чтобы он написал человеческое объяснение (почему этот кандидат подходит, а этот нет).
- Генерирует человеческое объяснение
- Работает только для топ-10 кандидатов
- Возвращает JSON: overallScore, summary, strengths, concerns, missingSkills

## Промпт для объяснения

```typescript
const prompt = `
  Ты — опытный IT-рекрутер. Оцени кандидата на вакансию.
  
  ВАКАНСИЯ: ${job.title}
  Требования: ${job.jobSkills.map(js => `${js.skill.name} (${js.type})`).join(', ')}
  
  КАНДИДАТ: ${candidateProfile.headline}
  Навыки: ${candidateProfile.candidateSkills.map(cs => `${cs.skill.name} (${cs.level})`).join(', ')}
  
  ТЕХНИЧЕСКИЕ МЕТРИКИ:
  - Точное совпадение навыков: ${matchScores.exact}%
  - Семантическое совпадение: ${matchScores.semantic}%
  
  ЗАДАЧА:
  Верни JSON с полями:
  - overallScore (0-100)
  - summary (2-3 предложения)
  - strengths (массив)
  - concerns (массив)
  - missingSkills (массив)
`;