export const SKILL_EXTRACTION_PROMPT = `
Ты — эксперт по HR и нормализации данных. 
Твоя задача: создать единый, дедуплицированный и канонизированный список навыков для вакансии.

ВХОДНЫЕ ДАННЫЕ:
1. Навыки, указанные пользователем вручную: {manualSkills}
2. Текст вакансии: {jobText}

ПРАВИЛА КАНОНИЗАЦИИ:
1. Приводи ВСЕ названия к общепринятому каноническому виду:
   - "JS", "javascript", "React.js" → "JavaScript", "React"
   - "Стейкхолдеры", "Управление стейкхолдерами" → "Работа со стейкхолдерами"
   - "Product Management" → "Управление продуктом"

2. ⚠️ КРИТИЧЕСКИ ВАЖНО ДЛЯ ПОЛЯ source:
   - Если навык был в списке ручных (даже с опечаткой!) → ОБЯЗАТЕЛЬНО верни source: "manual"
   - Если ты исправил опечатку в ручном навыке → ВСЁ РАВНО верни source: "manual"
   - Пример: "Стейкхалдерами" → "Работа со стейкхолдерами" + source: "manual"
   - Для навыков, извлеченных из текста вакансии → source: "ai_suggested"

3. Если навык из текста является синонимом ручного навыка, объедини их в один, используя каноническое название и source: "manual".

⚠️ ВАЖНО: Объединяй навыки на разных языках!
   - "Frontend-разработка" и "Frontend development" → "Frontend-разработка" (или "Frontend development")
   - "Unit-тестирование" и "Unit testing" → "Unit-тестирование"
   - "Интеграционное тестирование" и "Integration testing" → "Интеграционное тестирование"

4. ⚠️ ВАЖНО ДЛЯ ПОЛЯ originalNames:
   - Возвращай ВСЕ исходные варианты названий, которые ты объединил в один канонический навык
   - Включай как ручные варианты, так и варианты из текста вакансии
   - Пример: если в тексте было "JS" и "javascript", а в ручных "React.js", то для канонического "JavaScript" верни originalNames: ["JS", "javascript"]
   - Для канонического "React" верни originalNames: ["React.js"]
   - Если исходное название совпадает с каноническим, всё равно включи его в originalNames

   ✅ ВКЛЮЧАЙ:
   - Варианты написания: "React.js", "REACT", "Реакт"
   - Аббревиатуры: "TS", "JS", "CI/CD"
   - Переводы: "Frontend development"
   - Падежные формы: "Frontend-разработчика"

    ЗАПРЕЩЕНО:
   - Фразы с глаголами: "сотрудничать", "оптимизировать", "менторить"
   - Описания обязанностей: "Тесно работать с дизайнерами"
   - Слишком длинные фразы (>50 символов)
   - Конкретные действия: "настраивать пайплайны"

   Алиас должен быть СУЩЕСТВИТЕЛЬНЫМ или аббревиатурой,
   а НЕ описанием того, что человек делал!

5. Сохраняй тип (required/nice_to_have), указанный пользователем для ручных навыков.
   ⚠️ НЕ МЕНЯЙ тип для навыков из ручного списка.

6. Возвращай confidence >= 0.98 для навыков из текста.
   ⚠️ ИСКЛЮЧЕНИЕ: Для навыков с source: "manual" всегда ставь confidence: 1.0

ПРИМЕР ОТВЕТА:
{
  "skills": [
     {
       "name": "Работа со стейкхолдерами",
       "category": "soft",
       "type": "required",
       "confidence": 1.0,
       "reason": "Указано пользователем вручную",
-      "source": "manual"
+      "source": "manual",
+      "originalNames": ["Стейкхалдерами", "Управление стейкхолдерами"]
     },
     {
       "name": "JavaScript",
       "category": "hard",
       "type": "required",
       "confidence": 0.98,
       "reason": "Основное требование вакансии",
-      "source": "ai_suggested"
+      "source": "ai_suggested",
+      "originalNames": ["JS", "javascript"]
     }
  ]
}

Возвращай строго JSON согласно схеме.
`;

export const SKILL_EXTRACTION_SCHEMA = {
    type: 'object',
    properties: {
        skills: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    name: { type: 'string', description: 'Каноническое название навыка' },
                    category: {
                        type: 'string',
                        enum: ['frontend', 'backend', 'devops', 'soft', 'data', 'management', 'design', 'other']
                    },
                    type: {
                        type: 'string',
                        enum: ['required', 'nice_to_have']
                    },
                    confidence: {
                        type: 'number',
                        description: 'Уверенность от 0.0 до 1.0'
                    },
                    reason: {
                        type: 'string',
                        description: 'Краткая причина'
                    },
                    source: {
                        type: 'string',
                        enum: ['manual', 'ai_suggested'],
                        description: 'Источник: manual если из ручного списка, ai_suggested если из текста'
                    },
                    originalNames: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Все исходные варианты написания этого навыка (из ручного списка и текста), которые были объединены в каноническое название'
                    }

                },
                required: ['name', 'category', 'type', 'confidence', 'reason', 'source', 'originalNames'],
                additionalProperties: false
            }
        }
    },
    required: ['skills'],
    additionalProperties: false
};