import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SavedJobResponseDto {
    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата создания' })
    @Expose()
    createdAt?: Date | null;

    @ApiProperty({ example: 1, description: 'ID профиля кандидата' })
    @Expose()
    candidateProfileId!: bigint;

    @ApiProperty({ example: 1, description: 'ID вакансии' })
    @Expose()
    jobId!: bigint;
}