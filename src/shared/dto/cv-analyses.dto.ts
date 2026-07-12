// src/cv-analyses/dto/cv-analysis-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CvAnalysesResponseDto {
    @ApiProperty({ example: 1, description: 'ID анализа' })
    @Expose()
    id!: bigint;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата создания' })
    @Expose()
    createdAt?: Date | null;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата обновления' })
    @Expose()
    updatedAt?: Date | null;

    @ApiPropertyOptional({ example: 'Сильный кандидат', description: 'Краткое резюме' })
    @Expose()
    summary?: string | null;

    @ApiProperty({ example: 1, description: 'ID профиля кандидата' })
    @Expose()
    profileId?: bigint;

    @ApiPropertyOptional({ example: 'senior', description: 'Уровень кандидата' })
    @Expose()
    level?: string | null;

    @ApiPropertyOptional({ example: 85.5, description: 'Общий балл (0-100)' })
    @Expose()
    overallScore!: number;

    @ApiPropertyOptional({ description: 'Детали анализа' })
    @Expose()
    details: any;

    @ApiPropertyOptional({ example: 'v1.0', description: 'Версия промпта' })
    @Expose()
    evaluationPromptVersion?: string | null;

    @ApiPropertyOptional({ example: 'gpt-4', description: 'Модель LLM' })
    @Expose()
    llmModel?: string | null;

    @ApiPropertyOptional({ example: 150, description: 'Количество использованных токенов' })
    @Expose()
    tokensUsed?: number | null;

    @ApiPropertyOptional({ example: 0.95, description: 'Уверенность LLM (0-1)' })
    @Expose()
    llmConfidence?: number | null;

    @ApiPropertyOptional({ description: 'Сырой ответ LLM' })
    @Expose()
    rawLlmResponse: any;

    @ApiPropertyOptional({ example: true, description: 'Является ли текущим анализом' })
    @Expose()
    isCurrent?: boolean | null;
}