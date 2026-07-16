
export const SKILL_EXTRACTION_PROMPT = `
Ты — эксперт по HR и анализу резюме/вакансий. 
Извлеки из текста технические и софт-навыки. 
Для каждого навыка определи категорию (frontend, backend, devops, soft, data, management, design, other).
Возвращай ТОЛЬКО валидный JSON массив.
`;

// JSON Schema для OpenAI
export const SKILL_EXTRACTION_SCHEMA = {
    type: 'array',
    items: {
        type: 'object',
        properties: {
            name: { type: 'string', description: 'Каноническое название навыка (например, "React", а не "ReactJS")' },
            category: { type: 'string', enum: ['frontend', 'backend', 'devops', 'soft', 'data', 'management', 'design', 'other'] },
            confidence: { type: 'number', description: 'Уверенность от 0.0 до 1.0' }
        },
        required: ['name', 'category', 'confidence']
    }
};