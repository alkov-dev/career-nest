import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MessageResponseDto {
    @ApiProperty({ example: 1, description: 'ID сообщения' })
    @Expose()
    id!: bigint;

    @ApiPropertyOptional({ example: '2026-07-10T10:00:00.000Z', description: 'Дата создания' })
    @Expose()
    createdAt?: Date | null;

    @ApiProperty({ example: 'Здравствуйте!', description: 'Содержимое сообщения' })
    @Expose()
    content!: string;

    @ApiProperty({ example: 1, description: 'ID отправителя' })
    @Expose()
    senderId!: bigint;

    @ApiProperty({ example: 2, description: 'ID получателя' })
    @Expose()
    receiverId!: bigint;

    @ApiPropertyOptional({ example: 1, description: 'ID отклика (если сообщение по вакансии)' })
    @Expose()
    applicationId?: bigint | null;

    @ApiPropertyOptional({ example: false, description: 'Прочитано ли сообщение' })
    @Expose()
    isRead?: boolean | null;
}