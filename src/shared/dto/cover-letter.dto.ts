import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CoverLetterResponseDto {
    @ApiProperty({ example: 1, description: 'ID сопроводительного письма' })
    @Expose()
    id!: bigint;

    @ApiProperty({ example: 1, description: 'ID пользователя' })
    @Expose()
    userId!: bigint;

    @ApiProperty({ example: 1, description: 'ID вакансии' })
    @Expose()
    jobId!: bigint;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата генерации' })
    @Expose()
    generatedAt?: Date | null;

    @ApiPropertyOptional({ description: 'Снимок профиля на момент генерации' })
    @Expose()
    profileSnapshot: any;

    @ApiProperty({ example: 'Здравствуйте, я хочу присоединиться...', description: 'Текст письма' })
    @Expose()
    letterText!: string;

    @ApiPropertyOptional({ description: 'Метаданные генерации (модель, токены, цена)' })
    @Expose()
    metadata: any;

    @ApiPropertyOptional({ example: false, description: 'Использовано в отклике' })
    @Expose()
    usedInApplication?: boolean | null;
}