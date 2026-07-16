// src/skills/skills.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { SKILL_EXTRACTION_PROMPT, SKILL_EXTRACTION_SCHEMA } from '@/ai/prompts/skill-extraction.prompt';
import { OpenAiService } from '@/openai/openai.service';

@Injectable()
export class SkillsService {
    private readonly logger = new Logger(SkillsService.name);

    constructor(
        private prisma: PrismaService,
        private openai: OpenAiService,
    ) { }

    /**
     * Главный метод: извлекает навыки из текста и сохраняет их в словарь
     */
    async extractAndSaveSkills(text: string, source: 'job' | 'candidate') {
        // 1. Получаем навыки от OpenAI (теперь схема передается и строго соблюдается)
        const aiSkills = await this.openai.extractJson(
            SKILL_EXTRACTION_PROMPT,
            text,
            SKILL_EXTRACTION_SCHEMA
        );

        const savedSkills: Array<{ id: bigint; name: string; isNew: boolean }> = [];

        for (const aiSkill of aiSkills) {
            if (!aiSkill?.name) continue; // Защита от невалидных записей
            const skillName = aiSkill.name.trim();

            // 2. ПРОВЕРКА 1: Точное совпадение в названии или алиасах
            const existingExact = await this.prisma.skill.findFirst({
                where: {
                    OR: [
                        { name: { equals: skillName, mode: 'insensitive' } },
                        { aliases: { some: { alias: { equals: skillName, mode: 'insensitive' } } } }
                    ]
                },
                select: { id: true, name: true } // Оптимизация: не тянем огромный embedding
            });

            if (existingExact) {
                savedSkills.push({ id: existingExact.id, name: existingExact.name, isNew: false });
                continue;
            }

            // 3. ПРОВЕРКА 2: Семантическое сходство через pgvector
            const embedding = await this.openai.generateEmbedding(skillName);

            const similarSkills = await this.prisma.$queryRaw<
                Array<{ id: bigint; name: string; similarity: number }>
            >`
                SELECT id, name, 1 - (embedding <=> ${embedding}::vector) as similarity
                FROM skills
                WHERE 1 - (embedding <=> ${embedding}::vector) > 0.92
                ORDER BY similarity DESC
                LIMIT 1
            `;

            if (similarSkills.length > 0) {
                const targetSkill = similarSkills[0];

                // ✅ ИСПРАВЛЕНО: используем upsert вместо create, чтобы избежать 
                // ошибки уникальности, если этот алиас уже был добавлен ранее
                await this.prisma.skillAlias.upsert({
                    where: {
                        skillId_alias: {
                            skillId: targetSkill.id,
                            alias: skillName
                        }
                    },
                    update: {}, // Ничего не обновляем, если алиас уже есть
                    create: {
                        skillId: targetSkill.id,
                        alias: skillName
                    }
                });

                savedSkills.push({ id: targetSkill.id, name: targetSkill.name, isNew: false });
                continue;
            }

            // Превращаем массив чисел [0.1, 0.2, ...] в строку '[0.1,0.2,...]' для PostgreSQL
            const embeddingString = `[${embedding.join(',')}]`;

            await this.prisma.$executeRaw`
                INSERT INTO skills (name, category, embedding, needs_review, created_at, updated_at)
                VALUES (
                    ${skillName},
                    ${aiSkill.category || 'other'},
                    ${embeddingString}::vector,
                    true,
                    NOW(),
                    NOW()
                )
                ON CONFLICT (name) DO NOTHING
            `;

            // Получаем только что созданный (или параллельно созданный) навык обычным запросом
            const createdSkill = await this.prisma.skill.findFirst({
                where: { name: skillName },
                select: { id: true, name: true }
            });

            if (createdSkill) {
                savedSkills.push({ id: createdSkill.id, name: createdSkill.name, isNew: true });
            }
            // 4. СОЗДАНИЕ НОВОГО НАВЫКА (с флагом модерации)
            // const newSkill = await this.prisma.skill.create({
            //     data: {
            //         name: skillName,
            //         category: aiSkill.category || 'other', // Фоллбэк, если ИИ не вернул категорию
            //         embedding,
            //         needsReview: true,
            //     },
            //     select: { id: true, name: true }
            // });

            // savedSkills.push({ id: newSkill.id, name: newSkill.name, isNew: true });
        }

        this.logger.log(`Successfully processed ${savedSkills.length} skills for ${source}`);
        return savedSkills;
    }
}