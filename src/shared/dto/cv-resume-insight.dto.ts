// src/cv-resume-insights/dto/cv-resume-insight-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CvResumeInsightResponseDto {
    @ApiProperty({ example: 1, description: 'ID инсайта' })
    @Expose()
    id!: bigint;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата обновления' })
    @Expose()
    updatedAt?: Date | null;

    @ApiProperty({ example: 1, description: 'ID профиля кандидата' })
    @Expose()
    profileId!: bigint;

    @ApiPropertyOptional({ example: 'gpt-4', description: 'Модель LLM' })
    @Expose()
    llmModel?: string | null;

    @ApiPropertyOptional({ example: 150, description: 'Количество использованных токенов' })
    @Expose()
    tokensUsed?: number | null;

    @ApiProperty({ example: 1, description: 'ID анализа CV' })
    @Expose()
    cvAnalysisId!: bigint;

    @ApiPropertyOptional({ description: 'Детальное объяснение' })
    @Expose()
    explanationDetailed: any;

    @ApiPropertyOptional({ description: 'План улучшений' })
    @Expose()
    improvementPlan: any;

    @ApiPropertyOptional({ description: 'Рекомендуемые курсы' })
    @Expose()
    recommendedCourses: any;

    @ApiProperty({ example: [1, 2, 3], description: 'ID чанков RAG' })
    @Expose()
    ragChunkIds!: bigint[];

    @ApiPropertyOptional({ example: 'v1.0', description: 'Версия промпта' })
    @Expose()
    insightPromptVersion?: string | null;

    @ApiPropertyOptional({ example: false, description: 'Является ли устаревшим' })
    @Expose()
    isStale?: boolean | null;

    @ApiPropertyOptional({ example: 'Профиль обновлён', description: 'Причина устаревания' })
    @Expose()
    staleReason?: string | null;

    @ApiPropertyOptional({ example: 'hash123', description: 'Хеш профиля для которого сгенерирован' })
    @Expose()
    generatedForProfileHash?: string | null;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата генерации' })
    @Expose()
    generatedAt?: Date | null;
}