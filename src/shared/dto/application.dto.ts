import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ApplicationResponseDto {
    @ApiProperty({ example: 1, description: 'ID отклика' })
    @Expose()
    id!: bigint;

    @ApiPropertyOptional({ example: 'pending', description: 'Статус отклика' })
    @Expose()
    status?: string | null;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата создания' })
    @Expose()
    createdAt?: Date | null;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата обновления' })
    @Expose()
    updatedAt?: Date | null;

    @ApiProperty({ example: 1, description: 'ID профиля кандидата' })
    @Expose()
    candidateProfileId!: bigint;

    @ApiProperty({ example: 1, description: 'ID вакансии' })
    @Expose()
    jobId!: bigint;

    @ApiPropertyOptional({ example: 1, description: 'ID сопроводительного письма', required: false })
    @Expose()
    coverLetterId?: bigint | null;
}