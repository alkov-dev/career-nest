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

4. Сохраняй тип (required/nice_to_have), указанный пользователем для ручных навыков.
   ⚠️ НЕ МЕНЯЙ тип для навыков из ручного списка.

5. Возвращай confidence >= 0.95 для навыков из текста.
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
      "source": "manual"
    },
    {
      "name": "Управление продуктом",
      "category": "management",
      "type": "required",
      "confidence": 0.98,
      "reason": "Основное требование вакансии",
      "source": "ai_suggested"
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
                    // ✅ ИЗМЕНИЛИ: теперь сразу возвращаем source для базы
                    source: {
                        type: 'string',
                        enum: ['manual', 'ai_suggested'],
                        description: 'Источник: manual если из ручного списка, ai_suggested если из текста'
                    }
                },
                required: ['name', 'category', 'type', 'confidence', 'reason', 'source'],
                additionalProperties: false
            }
        }
    },
    required: ['skills'],
    additionalProperties: false
};