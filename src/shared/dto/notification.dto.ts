import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class NotificationResponseDto {
    @ApiProperty({ example: 'application', description: 'Тип уведомления' })
    @Expose()
    type!: string;

    @ApiPropertyOptional({ example: 'Новый отклик', description: 'Заголовок уведомления' })
    @Expose()
    title?: string | null;

    @ApiProperty({ example: 1, description: 'ID уведомления' })
    @Expose()
    id!: bigint;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата создания' })
    @Expose()
    createdAt?: Date | null;

    @ApiProperty({ example: 1, description: 'ID пользователя' })
    @Expose()
    userId!: bigint;

    @ApiPropertyOptional({ description: 'Данные уведомления' })
    @Expose()
    payload: any;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата прочтения' })
    @Expose()
    readAt?: Date | null;
}