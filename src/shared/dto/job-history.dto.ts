import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class JobHistoryResponseDto {
    @ApiProperty({ example: 1, description: 'ID записи истории' })
    @Expose()
    id!: bigint;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата создания' })
    @Expose()
    createdAt?: Date | null;

    @ApiProperty({ example: 1, description: 'ID вакансии' })
    @Expose()
    jobId!: bigint;

    @ApiPropertyOptional({ example: 1, description: 'ID редактора (пользователя)' })
    @Expose()
    editorId?: bigint | null;

    @ApiPropertyOptional({ description: 'Изменённые поля' })
    @Expose()
    changedFields: any;

    @ApiPropertyOptional({ description: 'Предыдущие значения' })
    @Expose()
    previousValues: any;
}