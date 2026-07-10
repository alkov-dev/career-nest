import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MatchScoreResponseDto {
    @ApiProperty({ example: 1, description: 'ID записи матч-скора' })
    @Expose()
    id!: bigint;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата обновления' })
    @Expose()
    updatedAt?: Date | null;

    @ApiProperty({ example: 1, description: 'ID профиля кандидата' })
    @Expose()
    candidateProfileId!: bigint;

    @ApiProperty({ example: 1, description: 'ID вакансии' })
    @Expose()
    jobId!: bigint;

    @ApiPropertyOptional({ description: 'Детали матч-скора' })
    @Expose()
    details: any;

    @ApiProperty({ example: 85.5, description: 'Значение матч-скора (0-100)' })
    @Expose()
    score!: number;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата вычисления' })
    @Expose()
    computedAt?: Date | null;
}