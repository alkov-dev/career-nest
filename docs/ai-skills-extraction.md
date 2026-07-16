# Извлечение навыков с помощью OpenAI

## Архитектура "Smart Upsert"

### Шаг 1. Промпт для OpenAI (JSON Mode)

```typescript
export const SKILL_EXTRACTION_PROMPT = `
Ты — эксперт по HR и анализу резюме/вакансий. 
Извлеки из текста технические и софт-навыки. 
Для каждого навыка определи категорию (frontend, backend, devops, soft, data, management, design, other).
Возвращай ТОЛЬКО валидный JSON массив.
`;

export const SKILL_EXTRACTION_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Каноническое название навыка' },
      category: { type: 'string', enum: ['frontend', 'backend', 'devops', 'soft', 'data', 'management', 'design', 'other'] },
      confidence: { type: 'number', description: 'Уверенность от 0.0 до 1.0' }
    },
    required: ['name', 'category', 'confidence']
  }
};


///Шаг 2. Умное сохранение в БД
Алгоритм:
Проверка точного совпадения в skills.name или skill_aliases.alias
Если не найдено — семантический поиск через pgvector (порог 0.95)
Если похоже — добавляем как алиас в skill_aliases
Если совсем новый — создаём с needsReview: true


// src/skills/skills.service.ts
async extractAndSaveSkills(text: string, source: 'job' | 'candidate') {
  const aiSkills = await this.openai.extractStructuredData(
    SKILL_EXTRACTION_PROMPT, 
    text, 
    SKILL_EXTRACTION_SCHEMA
  );

  const savedSkills = [];

  for (const aiSkill of aiSkills) {
    const skillName = aiSkill.name.trim();
    
    // Проверка 1: Точное совпадение
    const existingExact = await this.prisma.skill.findFirst({
      where: {
        OR: [
          { name: { equals: skillName, mode: 'insensitive' } },
          { aliases: { some: { alias: { equals: skillName, mode: 'insensitive' } } } }
        ]
      }
    });

    if (existingExact) {
      savedSkills.push({ id: existingExact.id, name: existingExact.name, isNew: false });
      continue;
    }

    // Проверка 2: Семантическое сходство через pgvector
    const embedding = await this.openai.getEmbedding(skillName);
    
    const similarSkill = await this.prisma.$queryRaw`
      SELECT id, name, 1 - (embedding <=> ${embedding}::vector) as similarity
      FROM skills
      WHERE 1 - (embedding <=> ${embedding}::vector) > 0.95
      LIMIT 1
    `;

    if (similarSkill.length > 0) {
      await this.prisma.skillAlias.create({
        data: { skillId: similarSkill[0].id, alias: skillName }
      });
      savedSkills.push({ id: similarSkill[0].id, name: similarSkill[0].name, isNew: false });
      continue;
    }

    // Создание нового навыка
    const newSkill = await this.prisma.skill.create({
      data: {
        name: skillName,
        category: aiSkill.category,
        embedding,
        needsReview: true,
      }
    });
    savedSkills.push({ id: newSkill.id, name: newSkill.name, isNew: true });
  }

  return savedSkills;
}

