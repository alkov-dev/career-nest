import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { OpenAiService } from '@/openai/openai.service';
import { EmbeddingJobData } from './embeddings.types';

@Processor('embeddings')
export class EmbeddingsQueueProcessor extends WorkerHost {
    private readonly logger = new Logger(EmbeddingsQueueProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly openAiService: OpenAiService,
    ) {
        super();
    }

    async process(job: Job<EmbeddingJobData>): Promise<any> {
        const { entityType, entityId } = job.data;
        const id = BigInt(entityId);

        try {
            if (entityType === 'job') {
                await this.processJobEmbedding(id);
            } else if (entityType === 'skill') {
                await this.processSkillEmbedding(id);
            }
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`❌ Failed embedding for ${entityType} #${entityId}: ${errorMessage}`);
            throw error; // Trigger BullMQ retry
        }
    }

    private async processJobEmbedding(jobId: bigint) {
        const jobs = await this.prisma.$queryRaw<
            Array<{
                id: bigint;
                title: string;
                description: string | null;
                requirements: string[];
                responsibilities: string[];
                location: string | null;
                embedding: string | null;  // Приводим к string
                location_embedding: string | null;  // Приводим к string
            }>
        >`
            SELECT 
                id, 
                title, 
                description, 
                requirements, 
                responsibilities, 
                location, 
                embedding::TEXT,              
                location_embedding::TEXT      
            FROM jobs
            WHERE id = ${jobId}
        `;

        const job = jobs[0];
        if (!job) {
            this.logger.warn(`Вакансия #${jobId} не найдена. Пропускаем.`);
            return;
        }

        let newEmbedding: number[] | null = null;
        let newLocationEmbedding: number[] | null = null;

        if (!job.embedding) {
            this.logger.log(`Генерация embedding для вакансии #${jobId}...`);
            const textToEmbed = [
                job.title,
                job.description,
                `Требования: ${job.requirements?.join(', ')}`,
                `Обязанности: ${job.responsibilities?.join(', ')}`
            ].filter(Boolean).join(' | ');

            newEmbedding = await this.openAiService.generateEmbedding(textToEmbed);
        }

        if (!job.location_embedding && job.location) {
            this.logger.log(`Генерация location_embedding для вакансии #${jobId}...`);
            newLocationEmbedding = await this.openAiService.generateEmbedding(job.location);
        }

        if (newEmbedding && newLocationEmbedding) {
            await this.prisma.$executeRaw`
                UPDATE jobs
                SET 
                    embedding = ${newEmbedding}::vector,
                    location_embedding = ${newLocationEmbedding}::vector
                WHERE id = ${jobId}
            `;
            this.logger.log(`💾 Обновлены оба эмбеддинга для вакансии #${jobId}`);

        } else if (newEmbedding) {
            await this.prisma.$executeRaw`
                UPDATE jobs
                SET embedding = ${newEmbedding}::vector
                WHERE id = ${jobId}
            `;
            this.logger.log(`💾 Обновлен основной эмбеддинг для вакансии #${jobId}`);
        } else if (newLocationEmbedding) {
            await this.prisma.$executeRaw`
                UPDATE jobs
                SET location_embedding = ${newLocationEmbedding}::vector
                WHERE id = ${jobId}
            `;
            this.logger.log(`💾 Обновлен эмбеддинг локации для вакансии #${jobId}`);
        }
    }

    private async processSkillEmbedding(skillId: bigint) {
        // Аналогичная логика для Skill через Raw SQL
        const skills = await this.prisma.$queryRaw<
            Array<{ id: bigint; name: string; category: string | null; embedding: number[] | null }>
        >`
            SELECT id, name, category, embedding
            FROM skills
            WHERE id = ${skillId}
        `;

        const skill = skills[0];
        if (!skill || skill.embedding) return; // Идемпотентность

        this.logger.log(`Генерация embedding для навыка #${skillId} (${skill.name})...`);
        const textToEmbed = `${skill.name} ${skill.category || ''}`.trim();
        const embedding = await this.openAiService.generateEmbedding(textToEmbed);

        await this.prisma.$executeRaw`
            UPDATE skills
            SET embedding = ${embedding}::vector
            WHERE id = ${skillId}
        `;

        this.logger.log(`💾 Эмбеддинг для навыка #${skillId} сохранен.`);
    }
}